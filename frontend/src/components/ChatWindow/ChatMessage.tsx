import React, { useState, useEffect} from "react";
import Button from "../Button/Button";
import Message from "./Message";
import Recommendation from "./Cards/Recommendation";
import { RepairMessage } from "./Cards/RepairMessage";
import { ComparisonMessage } from "./Cards/ComparisonMessage";
import { MessageType, ComparisonData, RepairData, RecommendationsData } from "@types";
import bot from "../../assets/bot.svg"

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

  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (msg.isLoading) {
      const timeout = setTimeout(() => setShowSkeleton(true), 300);
      return () => clearTimeout(timeout);
    } else {
      setShowSkeleton(false);
    }
  }, [msg.isLoading]);

  if (msg.isLoading && showSkeleton) {
    return (
      <div className="flex items-start space-x-3 max-w-3xl">
        <div className="w-8 h-8 rounded-full bg-gray-600 animate-pulse"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
          <div className="mt-4 space-y-2">
            <div className="h-32 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (msg.isUser) {
    return <Message text={msg.text} isUser={true} />;
  }

  return (
    <div className="">
      {!msg.isUser ? (
        <div className="flex items-start space-x-2">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-400 flex-shrink-0">
            <img
              src={bot}
              alt="Bot"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
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
        </div>
      ) : (
        <Message text={msg.text} isUser={true} />
      )}
    </div>
  );
};

export default ChatMessage;