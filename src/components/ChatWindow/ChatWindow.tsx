import React, { useState, useEffect } from "react";
import socket from "../../utils/socket";
import InputForm from "./InputForm";
import Message from "./Message";

interface Message {
  text: string;
  isUser: boolean;
}

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  // Listening for messages
  useEffect(() => {
    socket.on("chat_message", (data: string) => {
      setMessages((prev) => [...prev, { text: data, isUser: false }]);
    });

    return () => {
      socket.off("chat_message");
    };
  }, []);

  const handleSendMessage = (message: string) => {
    setMessages((prev) => [...prev, { text: message, isUser: true }]);
  };

  return (
    <div className="flex flex-col h-screen p-4 text-white overflow-y-auto">
      <div className="flex-1 w-full max-w-lg">
        {messages.map((msg, index) => (
          <Message key={index} text={msg.text} isUser={msg.isUser} />  // using the Message component
        ))}
      </div>
      <InputForm onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;