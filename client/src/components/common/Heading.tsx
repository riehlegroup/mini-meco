import React from "react";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  level?: 1 | 2 | 3;
}

const headingStyles = {
  1: "text-4xl font-bold",
  2: "text-3xl font-bold",
  3: "text-2xl font-bold",
};

const Heading: React.FC<HeadingProps> = ({
  level = 2,
  className = "",
  children,
  ...props
}) => {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  const finalClassName = `${headingStyles[level]} ${className}`;

  return React.createElement(HeadingTag, { className: finalClassName, ...props }, children);
};

export default Heading;
