import { useEffect } from "react";
import socket from "../utils/socket";
import { Response } from "@types";

type Handlers = {
  onChatMessage: (msg: string) => void;
  onData: (data: Response) => void;
  onButtons: (data: Response) => void;
};

export const useChatSocket = ({ onChatMessage, onData, onButtons }: Handlers) => {
  useEffect(() => {
    socket.on("chat_message", onChatMessage);
    socket.on("data", onData);
    socket.on("buttons", onButtons);

    return () => {
      socket.off("chat_message", onChatMessage);
      socket.off("data", onData);
      socket.off("buttons", onButtons);
    };
  }, [onChatMessage, onData, onButtons]);
};