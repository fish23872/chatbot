/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useChatSocket } from "../../hooks/useChatSocket";
import socket from "../../utils/socket";
import InputForm from "./InputForm";
import ChatMessage from "./ChatMessage";
import { Response, MessageType } from "@types";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([
    { text: "👋 Welcome! Ask me anything about mobile phones.", isUser: false },
  ]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [showWelcomeCard, setShowWelcomeCard] = useState(true);
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
    if (message.trim().length === 0) return;
    setShowWelcomeCard(false);
    addMessage({ text: message, isUser: true });
    addMessage({ text: "", isLoading: true, isUser: false });
    setIsWaitingForResponse(true);
    socket.emit("chat_message", message);
  };

  const handleButtonClick = (payload: string) => {
    setShowWelcomeCard(false);
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
    <div className="flex flex-col h-screen  bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900  text-white max-w-screen ">
      <div className="bg-gray-900 text-white py-4 px-6 border-b border-gray-700 shadow sticky top-0 z-20">
        <h1 className="text-xl font-semibold tracking-wide">Chat Support</h1>
      </div>
      {showWelcomeCard && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-xl p-4 border border-gray-700 shadow-lg mb-6 m-4 max-w-full bg-gray-900"
            >
              <div className="flex items-start">
                <div className="bg-blue-500 p-2 rounded-lg mr-3">
                  <Info size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">How can I help you today?</h3>
                  <p className="text-gray-300 text-md mb-3">
                    I can help with:
                  </p>
                  <ul className="text-md text-gray-300 space-y-1 mb-3">
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                      Finding the right phone for your needs
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                      Comparing different phone models
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                      Troubleshooting common issues
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                      Information about repairs and warranties
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleSendMessage("I need help choosing a new phone")}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1.5 px-3 rounded-full transition-colors"
                    >
                      Help me choose a phone
                    </button>
                    <button 
                      onClick={() => handleSendMessage("I want to compare two phones")}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1.5 px-3 rounded-full transition-colors"
                    >
                      Compare models
                    </button>
                    <button 
                      onClick={() => handleSendMessage("I need repairs for my device")}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1.5 px-3 rounded-full transition-colors"
                    >
                      Technical support
                    </button>
                    <button 
                      onClick={() => handleSendMessage("Are there any discounts?")}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm py-1.5 px-3 rounded-full transition-colors"
                    >
                      Ask for discounts
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
      <div className="flex-1 overflow-y-auto p-4">
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
      <div className="bg-gray-850 p-4 border-t border-gray-700 bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <InputForm onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;