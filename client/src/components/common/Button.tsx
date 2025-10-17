import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => {
    const baseClasses =
      "rounded-md shadow-md px-4 py-2 text-center font-medium transition-colors cursor-pointer flex-1";

    const variantClasses = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary-dark disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed",
      secondary:
        "bg-secondary text-white hover:bg-secondary-dark disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed",
    };

    const finalClassName = `${baseClasses} ${variantClasses[variant]} ${className}`;

    return (
      <button ref={ref} className={finalClassName} {...props} />
    );
  }
);

Button.displayName = "Button";

export default Button;
