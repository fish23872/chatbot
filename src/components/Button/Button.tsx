import React from "react";

interface ButtonProps {
  buttonText: string;
  className: string;
  onClick: () => void; 
}

const Button: React.FC<ButtonProps> = ({ buttonText, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={className}
    >
      {buttonText}
    </button>
  );
};

export default Button;