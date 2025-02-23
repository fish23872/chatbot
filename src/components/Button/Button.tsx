import React from "react";

interface ButtonProps {
  buttonText: string;
  onClick: () => void; 
}

const Button: React.FC<ButtonProps> = ({ buttonText, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 px-12 bg-red-600 rounded-lg"
    >
      {buttonText}
    </button>
  );
};

export default Button;