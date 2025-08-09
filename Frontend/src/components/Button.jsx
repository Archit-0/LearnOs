import React from "react";

const Button = ({
  children,
  classname = "",
  type = "button",
  bgColor = "bg-blue-600",
  textColor = "text-white",
  ...props
}) => {
  return (
    <button
      type={type}
      {...props}
      className={`px-4 py-2 rounded-lg ${classname} ${bgColor} ${textColor}`}
    >
      {children}
    </button>
  );
};

export default Button;
