import React from "react";

interface CardProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="rounded-md bg-white p-6 shadow-md">
      {children}
    </div>
  );
};

export default Card;
