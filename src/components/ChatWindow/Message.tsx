interface MessageProps {
    text: string;
    isUser: boolean;
  }
  
  const Message: React.FC<MessageProps> = ({ text, isUser }) => {
    return (
      <div
        className={`p-4 my-4 rounded-lg min-h-12 flex max-w-md w-[50%] shadow-lg ${
          isUser ? "bg-green-600 self-end mr-auto" : "bg-blue-950 self-start ml-auto"
        }`}
      >
        <span className="whitespace-pre-wrap break-words w-full">{text}</span>
      </div>
    );
  };
  
  export default Message;