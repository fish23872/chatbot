import React, { useState, useEffect, useRef, useCallback } from "react";
import { useChatSocket } from "../../hooks/useChatSocket";
import socket from "../../utils/socket";
import InputForm from "./InputForm";
import ChatMessage from "./ChatMessage";
import { Response, MessageType } from "@types";


// TODO: fix Can't reach ticket pages on URL
const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatPayloadDisplayText = (payload: string): string => {
    const cleaned = payload.replace("/pref_brand_", "");
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = useCallback((msg: MessageType) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleSendMessage = (message: string) => {
    addMessage({ text: message, isUser: true });
    socket.emit("chat_message", message);
  };

  const handleButtonClick = (payload: string) => {
    const displayText = formatPayloadDisplayText(payload);
    addMessage({ text: displayText, isUser: true });
    socket.emit("chat_message", payload);
  };

  useChatSocket({
    onChatMessage: (msg) => {
      addMessage({ text: msg, isUser: false });
    },
    onData: (data: Response) => {
      const first = data[0];
      if (!first.custom) return;
      addMessage({
        text: first.text || "",
        isUser: false,
        payload: first.custom.data
      });
    },
    onButtons: (data: Response) => {
      addMessage({
        text: data[0].text || "",
        isUser: false,
        buttons: data[0].buttons
      });
    }
  });

  return (
    <div className="flex flex-col h-screen bg-gray-900 max-w-screen">
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