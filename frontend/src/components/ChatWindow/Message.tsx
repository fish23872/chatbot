interface MessageProps {
  text: string;
  isUser: boolean;
}

const Message: React.FC<MessageProps> = ({ text, isUser }) => {
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-4 ${
          isUser 
            ? "bg-blue-600 rounded-tr-none" 
            : "bg-gray-700 rounded-tl-none"
        } shadow-md`}
      >
        <p className="text-white whitespace-pre-wrap break-words">{text}</p>
        <div className={`absolute w-3 h-3 ${isUser ? "-right-3" : "-left-3"} top-0`}>
          <div className={`w-full h-full ${isUser ? "bg-blue-600" : "bg-gray-700"}`}></div>
        </div>
      </div>
    </div>
  );
};

export default Message;