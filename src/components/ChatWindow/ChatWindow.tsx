import React, { useState, useEffect, useRef } from "react";
import socket from "../../utils/socket";
import InputForm from "./InputForm";
import Message from "./Message";
import Recommendation from "./Recommendation";
import { ComparisonMessage } from "./ComparisonMessage";

interface Message {
  text: string;
  isUser: boolean;
  payload?: RecommendationsData | ComparisonData;
}

export type Phone = {
  name: string;
  price: number;
  rating: number;
  discount: string | null;
  image_url: string;
  features: string[];
  purchase_url: string | null;
  score: number;
};

export type RecommendationsData = {
  title: string;
  phones: Phone[];
};

export type ComparisonData = {
  phone1: Phone;
  phone2: Phone;
  specs: {
    name: string;
    phone1: string | number;
    phone2: string | number;
    winner: 'phone1' | 'phone2';
  }[];
  summary: string
};

type Response = Array<{
  recipient_id: string;
  custom: {
    payload: 'recommendation' | 'comparison';
    data: RecommendationsData | ComparisonData;
  };
  text?: string;
}>;

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
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

    socket.on("chat_message", handleChatMessage);
    socket.on("data", handleData);

    return () => {
      socket.off("chat_message", handleChatMessage);
      socket.off("data", handleData);
    };
  }, []);

  const handleSendMessage = (message: string) => {
    setMessages((prev) => [...prev, { text: message, isUser: true }]);
  };

  const renderMessageContent = (msg: Message, index: number) => {
    if (msg.isUser) {
      return <Message text={msg.text} isUser={true} />;
    }

    if (msg.payload) {
      if ('phone1' in msg.payload && 'phone2' in msg.payload) {
        return (
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
        );
      }
      return <Recommendation data={msg.payload as RecommendationsData} key={index} />;
    }

    return <Message text={msg.text} isUser={false} key={index} />;
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