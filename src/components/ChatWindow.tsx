import React, { useState, useEffect } from "react";
import socket from "../utils/socket";
import InputForm from "./InputForm";

interface Message {
  text: string;
  isUser: boolean; // to distinguish the user from the chatbot (styling)
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
    <div className="flex flex-col h-screen p-4 text-white items-center overflow-y-auto">
      <div className="flex-1 w-full max-w-lg">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-4 rounded-lg min-h-12 flex items-center max-w-md w-[50%] shadow-lg ${
              msg.isUser
                ? "bg-green-600 self-end mr-auto"
                : "bg-blue-950 self-start ml-auto"
            }`}
          >
            <span className="whitespace-pre-wrap break-words w-full">
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <InputForm onSendMessage={handleSendMessage} />
      {/* separated the input field to a different component  */}
    </div>
  );
};

export default ChatWindow;
