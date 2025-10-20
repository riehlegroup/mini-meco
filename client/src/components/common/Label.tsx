import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, className = "", children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`block text-sm font-medium text-slate-700 ${className}`}
        {...props}
      >
        {children}
        {required && <span className="ml-1 text-error">*</span>}
      </label>
    );
  }
);

Label.displayName = "Label";

export default Label;
