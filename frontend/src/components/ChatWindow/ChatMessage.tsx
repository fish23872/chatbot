import React, { useState } from "react";
import Button from "../Button/Button";
import Message from "./Message";
import Recommendation from "./Cards/Recommendation";
import { RepairMessage } from "./Cards/RepairMessage";
import { ComparisonMessage } from "./Cards/ComparisonMessage";
import { MessageType, ComparisonData, RepairData, RecommendationsData } from "@types";

type ChatMessageProps = {
  msg: MessageType;
  onButtonClick: (payload: string) => void;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ msg, onButtonClick }) => {
  const [buttonsDisabled, setButtonsDisabled] = useState(false);

  const localHandleButtonClick = (payload: string) => {
    if (buttonsDisabled) return;
    setButtonsDisabled(true);
    onButtonClick(payload);
  };

  if (msg.isUser) {
    return <Message text={msg.text} isUser={true} />;
  }

  return (
    <div className="message-container">
      {msg.text && <Message text={msg.text} isUser={false} />}

      {msg.buttons && (
        <div className="flex flex-wrap gap-2 mt-2">
          {msg.buttons.map((button, buttonIndex) => (
            <Button
              key={buttonIndex}
              buttonText={button.title}
              onClick={() => localHandleButtonClick(button.payload)}
              variant="primary"
              className="text-white"
              disabled={buttonsDisabled}
            />
          ))}
        </div>
      )}

      {msg.payload && (
        <>
          {"phone1" in (msg.payload || {}) && "phone2" in (msg.payload || {}) ? (
            <ComparisonMessage
              message={{
                custom: {
                  payload: "comparison",
                  data: msg.payload as ComparisonData,
                },
                text: msg.text,
              }}
            />
          ) : "urgency" in (msg.payload || {}) && "category" in (msg.payload || {}) ? (
            <RepairMessage data={msg.payload as RepairData} />
          ) : (
            <Recommendation data={msg.payload as RecommendationsData} />
          )}
        </>
      )}
    </div>
  );
};

export default ChatMessage;