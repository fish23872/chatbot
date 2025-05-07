interface MessageProps {
  text: string;
  isUser: boolean;
}

const Message: React.FC<MessageProps> = ({ text, isUser }) => {
  return (
    <div className={`flex items-start ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-4 shadow-md ${
          isUser 
            ? "bg-blue-600 rounded-tr-none" 
            : "bg-gray-700 rounded-tl-none"
        }`}
      >
        <p className="text-white whitespace-pre-wrap break-words">{text}</p>
      </div>
    </div>
  );
};

export default Message;
