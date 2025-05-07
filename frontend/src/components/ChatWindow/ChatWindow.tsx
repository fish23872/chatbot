/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useChatSocket } from "../../hooks/useChatSocket";
import socket from "../../utils/socket";
import InputForm from "./InputForm";
import ChatMessage from "./ChatMessage";
import { Response, MessageType } from "@types";
import { motion } from "framer-motion";

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([
    { text: "👋 Welcome! Ask me anything about mobile phones.", isUser: false },
  ]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatPayloadDisplayText = (payload: string): string => {
    const cleaned = payload.replace("/pref_brand_", "").replace("/", "");
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
    addMessage({ text: "", isLoading: true, isUser: false });
    setIsWaitingForResponse(true);
    socket.emit("chat_message", message);
  };

  const handleButtonClick = (payload: string) => {
    const displayText = formatPayloadDisplayText(payload);
    addMessage({ text: displayText, isUser: true });
    addMessage({ text: "", isLoading: true, isUser: false });
    setIsWaitingForResponse(true);
    socket.emit("chat_message", payload);
  };

  useChatSocket({
    onChatMessage: (msg) => {
      setIsWaitingForResponse(false);
      setMessages(prev => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex(m => m.isLoading);
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = { text: msg, isUser: false };
        } else {
          newMessages.push({ text: msg, isUser: false });
        }
        return newMessages;
      });
    },
    onData: (data: Response) => {
      setIsWaitingForResponse(false);
      const first = data[0];
      if (!first.custom) return;
      setMessages(prev => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex(m => m.isLoading);
        const updatedMessage = {
          text: first.text || "",
          isUser: false,
          payload: first.custom.data
        };
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = updatedMessage;
        } else {
          newMessages.push(updatedMessage);
        }
        return newMessages;
      });
    },
    onButtons: (data: Response) => {
      setIsWaitingForResponse(false);
      setMessages(prev => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex(m => m.isLoading);
        const buttonMsg = {
          text: data[0].text || "",
          isUser: false,
          buttons: data[0].buttons
        };
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = buttonMsg;
        } else {
          newMessages.push(buttonMsg);
        }
        return newMessages;
      });
    }
  });

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white max-w-screen">
      
      <div className="bg-gray-850 text-white py-4 px-6 border-b border-gray-700 shadow sticky top-0 z-20">
        <h1 className="text-xl font-semibold tracking-wide">Chat Support</h1>
      </div>
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <ChatMessage msg={msg} onButtonClick={handleButtonClick} />
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="bg-gray-850 p-4 border-t border-gray-700">
        <div className="max-w-3xl mx-auto">
          <InputForm onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;