import React, {useState} from "react";

interface EmailWidgetProps {
    onEmailChange: (email: string) => void; // Callback-Prop
    action: "Registration" | "Login"; // current action
}

const EmailWidget: React.FC<EmailWidgetProps> = ({ onEmailChange, action }) => {
    // create values to store the email inputs
    const [values, setValues] = useState({email: ''});
    // create empty error object to track validation errors
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);


    const validateEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        // Get email input directly from the ChangeEvent
        const currentEmailValue = e.target.value;
        // Set state to current value of email input
        setValues({ email: currentEmailValue });
        // Callback to parent-component-handler
        onEmailChange(currentEmailValue);

        const errors = {emailErrors: ''};
        // Reset success message
        setSuccessMessage(null);

        // Check the validity of the user input
        if (isValidEmail(currentEmailValue))
        {
            setErrors({});
            // Give different feedback based on current action
            if (action === "Registration") {
                setSuccessMessage("E-Mail address is valid for registration!");
            } else if (action === "Login") {
                setSuccessMessage("E-Mail address valid for login!");
            }
        }
        else
        {
            errors.emailErrors = "invalid email address.";
            setErrors(errors);
        }
    }

    // Copy&pasted EmailValidation from ../server/src/email
    function isValidEmail (email: string): boolean {
        // Valid email string format: must not contain '@', followed by '@', must include a '.',
        // and end with a string without '@'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    return (
        <div className="space-y-2">
            <input
                type="email"
                placeholder="Please enter your email address"
                value={values.email}
                onChange={validateEmailInput}
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {/* Show negative feedback */}
            {Object.entries(errors).map(([key, error]) => (
                <p key={`${key}: ${String(error)}`} className="text-sm font-semibold text-red-600">
                    {String(error)}
                </p>
            ))}
            {/* Show positive feedback */}
            {successMessage && (
                <p className="text-sm font-semibold text-green-600">
                    {successMessage}
                </p>
            )}
        </div>
    )
}

export default EmailWidget;
