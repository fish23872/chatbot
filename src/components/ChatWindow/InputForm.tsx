import React, { useState } from "react";
import Button from "../Button/Button";
import socket from "../../utils/socket";

interface InputFormProps {
  onSendMessage: (message: string) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onSendMessage }) => {
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      socket.emit("chat_message", inputText); // Sending the message to the backend
      setInputText(""); // clearing the text
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default behavior (new line)
      handleSend(); // trigger the send message function
    }
  };

  return (
    <div className="flex mt-4 mb-2 w-[80%] mr-auto space-x-4">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="flex-1 p-2 border placeholder:text-white rounded-lg"
        placeholder="Type a message..."
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <Button buttonText="Send" onClick={handleSend}></Button>
    </div>
  );
};

export default InputForm;
