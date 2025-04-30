import React, { useState } from "react";
import Button from "../Button/Button";

interface InputFormProps {
  onSendMessage: (message: string) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onSendMessage }) => {
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="text"
        name="chat-input"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="flex-1 p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        placeholder="Type your message..."
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <Button 
        buttonText="Send" 
        onClick={handleSend}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      />
    </div>
  );
};

export default InputForm;