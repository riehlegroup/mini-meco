import React, { useState } from "react";
import "./LoginScreen.css";
import EmailIcon from "./../../assets/EmailIcon.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const endpoint = "/user/password/forgotMail";
    const body = { email };

    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage(data.message || "Success!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred");
      }
    }
  };

  return (
    <>
      <div className="container">
        <div className="header">
          <div className="text">Forgot Your Password</div>
          <br />
          <div className="underline"></div>
        </div>
        <div className="text ForgotPasswordText">
          Enter your email address and
          <br /> we will send you a link to reset your password
        </div>
        <form onSubmit={handleSubmit}>
          <div className="inputs">
            <div className="input">
              <img className="email-icon" src={EmailIcon} alt="" />
              <input
                className="inputBox"
                type="email"
                placeholder="Please enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="submit-container">
            <button type="submit" className="submit">
              Send
            </button>
          </div>
        </form>
        {message && <div className="message">{message}</div>}
      </div>
    </>
  );
};

export default ForgotPassword;
