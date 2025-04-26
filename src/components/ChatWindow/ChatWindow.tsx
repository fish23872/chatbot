import React, { useState, useEffect, useRef } from "react";
import socket from "../../utils/socket";
import InputForm from "./InputForm";
import Message from "./Message";
import Recommendation from "./Cards/Recommendation";
import { RepairMessage } from "./Cards/RepairMessage";
import { ComparisonMessage } from "./Cards/ComparisonMessage";
import { RecommendationsData, ComparisonData, Response, RepairData, MessageType } from "@types";
import Button from "../Button/Button";

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
    setMessages(prev => [...prev, { 
      text: displayText, 
      isUser: true 
    }]);
    socket.emit("chat_message", payload);
  };

  const renderMessageContent = (msg: MessageType, index: number) => {
    if (msg.isUser) {
      return <Message text={msg.text} isUser={true} />;
    }
  
    return (
      <div className="message-container">
        {msg.text && <Message text={msg.text} isUser={false} key={index}/>}
      
        {msg.buttons && (
          <div className="flex flex-wrap gap-2 mt-2">
            {msg.buttons.map((button, buttonIndex) => (
              <Button
                key={buttonIndex}
                buttonText={button.title}
                onClick={() => handleButtonClick(button.payload)}
                variant="primary"
                className="text-white"
              />
            ))}
          </div>
        )}
        {msg.payload && (
          <>
            {('phone1' in msg.payload && 'phone2' in msg.payload) ? (
              <ComparisonMessage 
                message={{
                  custom: {
                    payload: 'comparison',
                    data: msg.payload as ComparisonData
                  },
                  text: msg.text
                }}
                key={index}
              />
            ) : (msg.payload && 'urgency' in msg.payload && 'category' in msg.payload) ? (
              <RepairMessage data={msg.payload as RepairData} key={index} />
            ) : (
              <Recommendation data={msg.payload as RecommendationsData} key={index} />
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="bg-gray-800 p-4 text-white shadow-md">
        <h1 className="text-xl font-bold">Chat Support</h1>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.map((msg, index) => (
            <React.Fragment key={index}>
              {renderMessageContent(msg, index)}
            </React.Fragment>
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