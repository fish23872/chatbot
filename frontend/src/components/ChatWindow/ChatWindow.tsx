import React, { useState, useEffect, useRef } from "react";
import socket from "../../utils/socket";
import InputForm from "./InputForm";
import { Response, MessageType } from "@types";
import ChatMessage from "./ChatMessage";

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleChatMessage = (data: string) => {
      setMessages((prev) => [...prev, { text: data, isUser: false }]);
    };

    const handleData = (data: Response) => {
      const firstItem = data[0];
      if (!firstItem.custom) return;
      setMessages((prev) => [
        ...prev,
        {
          text: firstItem.text || "",
          isUser: false,
          payload: firstItem.custom.data
        }
      ]);
    };
    const handleButtons = (data: Response) => {
      setMessages(prev => [
        ...prev,
        {
          isUser: false,
          payload: undefined,
          text: data[0].text || "",
          buttons: data[0].buttons,
        }
      ]);
    }

    socket.on("buttons", handleButtons)
    socket.on("chat_message", handleChatMessage);
    socket.on("data", handleData);

    return () => {
      socket.off("buttons", handleButtons)
      socket.off("chat_message", handleChatMessage);
      socket.off("data", handleData);
    };
  }, []);

  const handleSendMessage = (message: string) => {
    setMessages((prev) => [...prev, { text: message, isUser: true }]);
  };


  const handleButtonClick = (payload: string) => {
    const cleanedPayload = payload.replace("/pref_brand_", '');
    const displayText = cleanedPayload.charAt(0).toUpperCase() + cleanedPayload.slice(1);
    
    setMessages(prev => [...prev, { text: displayText, isUser: true }]);
    socket.emit("chat_message", payload);
  };

  

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.map((msg, index) => (
            <ChatMessage key={index} msg={msg} onButtonClick={handleButtonClick} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="max-w-3xl mx-auto">
          <InputForm onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;