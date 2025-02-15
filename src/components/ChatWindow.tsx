import React, { useState, useEffect } from "react";
import socket from "../utils/socket";

interface Message {
  text: string;
  isUser: boolean; // to distinguish the user from the chatbot (styling)
}

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");

  // Listening for messages
  useEffect(() => {
    socket.on("chat_message", (data: string) => {
      setMessages((prev) => [...prev, { text: data, isUser: false }]);
    });

    return () => {
      socket.off("chat_message");
    };
  }, []);

  const handleSend = () => {
    if (inputText.trim()) {
      const userMessage = { text: inputText, isUser: true };
      setMessages((prev) => [...prev, userMessage]);
      setInputText("");
      socket.emit("chat_message", inputText); //sending the message
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray p-4 w-[30%]">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`p-2 my-2 rounded-lg max-w-md`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 p-2 border border-gray"
        />
        <button
          onClick={handleSend}
          className="bg-blue text-white p-2 rounded-r-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
