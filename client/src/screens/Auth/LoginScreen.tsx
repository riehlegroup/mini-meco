import { useState } from "react";
import "./LoginScreen.css";
import UserNameIcon from "./../../assets/UserNameIcon.png";
import EmailIcon from "./../../assets/EmailIcon.png";
import PasswordIcon from "./../../assets/PasswordIcon.png";
import { useNavigate } from "react-router-dom";

const LoginScreen = () => {
  const navigate = useNavigate();
  const [action, setAction] = useState("Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    const endpoint = action === "Registration" ? "/register" : "/login";
    const body: { [key: string]: string } = { email, password };
    // Add name to the body if the action is Registration (not Login)
    if (action === "Registration") {
      body.name = name;
    }

    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
        },
        body: JSON.stringify(body), 
      });

      const data = await response.json();

      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (endpoint === "/login") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.name);
        localStorage.setItem("email", data.email);
        localStorage.setItem("githubUsername", data.githubUsername);
      }

      setMessage(data.message || "Success!");
      navigate("/dashboard");
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
      <h1 className="WelcomeTitle">Welcome to Mini-Meco</h1>
      <div className="container">
        <div className="header">
          <div className="text">{action}</div>
          {action === "Login" ? (
            <>
              {" "}
              <br></br>{" "}
            </>
          ) : (
            ""
          )}
          <div className="underline"></div>
        </div>
        <div className="inputs">
          {action === "Registration" && (
            <div className="input">
              <img className="username-icon" src={UserNameIcon} alt="" />
              <input
                className="inputBox"
                type="text"
                placeholder="Please enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

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
          <div className="input">
            <img className="password-icon" src={PasswordIcon} alt="" />
            <input
              className="inputBox"
              type="password"
              placeholder="Please enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        {action === "Login" && (
          <div className="forget-password">
            Forget Password? Click <a href="/ForgotPassword">Here</a>
          </div>
        )}
        <div className="submit-container">
          <div
            className={action === "Login" ? "submit" : "submit gray"}
            onClick={() => {
              setAction("Login");
              handleSubmit();
            }}
          >
            Login
          </div>
          <div
            className={action === "Registration" ? "submit" : "submit gray"}
            onClick={() => {
              setAction("Registration");
              handleSubmit();
            }}
          >
            Sign Up
          </div>
        </div>
        {message && <div className="message">{message}</div>}
      </div>
    </>
  );
};

export default LoginScreen;
