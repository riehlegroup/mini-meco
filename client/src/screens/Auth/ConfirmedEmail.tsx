import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const useQuery = () => {
  return new URLSearchParams(useLocation().search); // search: '?query=string'
};

const ConfirmedEmail = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const query = useQuery();
  const token = query.get("token");

  useEffect(() => {
    console.log("Token from URL:", token);
  }, [token]);

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    navigate("/login");

    e.preventDefault();
    const endpoint = "/user/confirmation/email";
    const body = { token };

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

      setMessage(data.message || "Email has been confirmed!");
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
        <div className="COnfirmEMailheader">
          <div className="text">Confirm Email</div>
          <br />
          <div className="underline"></div>
        </div>
        <div className="text ConfirmEmailText">
          Thank you for confirming your email!
          <br /> Please click the button to confirm and go back to Login Page
        </div>
        <div className="ConfirmEmailsubmit-container">
          <button type="submit" className="submit" onClick={handleSubmit}>
            Confirm
          </button>
        </div>

        {message && <div className="message">{message}</div>}
      </div>
    </>
  );
};

export default ConfirmedEmail;
