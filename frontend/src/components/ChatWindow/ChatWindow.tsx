/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useChatSocket } from "../../hooks/useChatSocket";
import socket from "../../utils/socket";
import InputForm from "./InputForm";
import ChatMessage from "./ChatMessage";
import { Response, MessageType } from "@types";

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
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
    addMessage({ text: "", isLoading: true,  isUser: false});
    setIsWaitingForResponse(true);
    socket.emit("chat_message", message);
  };

  const handleButtonClick = (payload: string) => {
    const displayText = formatPayloadDisplayText(payload);
    addMessage({ text: displayText, isUser: true });
    addMessage({ text: "", isLoading: true, isUser: false});
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
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = {
            text: first.text || "",
            isUser: false,
            payload: first.custom.data
          };
        } else {
          newMessages.push({
            text: first.text || "",
            isUser: false,
            payload: first.custom.data
          });
        }
        return newMessages;
      });
    },
    onButtons: (data: Response) => {
      setIsWaitingForResponse(false);
      setMessages(prev => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex(m => m.isLoading);
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = {
            text: data[0].text || "",
            isUser: false,
            buttons: data[0].buttons
          };
        } else {
          newMessages.push({
            text: data[0].text || "",
            isUser: false,
            buttons: data[0].buttons
          });
        }
        return newMessages;
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