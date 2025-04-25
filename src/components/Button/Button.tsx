import React from "react";

interface ButtonProps {
  buttonText: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "disabled";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  buttonText, 
  onClick, 
  disabled = false,
  variant = "primary",
  className = ""
}) => {
  const baseClasses = "py-2 px-4 rounded transition-colors duration-200";
  
  const variantClasses = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-300 hover:bg-gray-400 text-gray-800",
    disabled: "bg-gray-400 text-gray-200 cursor-not-allowed"
  };
  
  const buttonClasses = `${baseClasses} ${variantClasses[disabled ? "disabled" : variant]} ${className}`;
  
  return (
    <button
      onClick={onClick}
      className={buttonClasses}
      disabled={disabled}
    >
      {buttonText}
    </button>
  );
};

export default Button;