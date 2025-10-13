import { useState } from "react";
import "./LoginScreen.css";
import UserNameIcon from "./../../assets/UserNameIcon.png";
import EmailIcon from "./../../assets/EmailIcon.png";
import PasswordIcon from "./../../assets/PasswordIcon.png";
import { useNavigate } from "react-router-dom";
import EmailWidget from "@/components/Components/EmailWidget.tsx";
import PasswordWidget from "@/components/Components/PasswordWidget";
import { API_BASE_URL } from "@/config/api";

const LoginScreen = () => {
  const navigate = useNavigate();
  const [action, setAction] = useState<"Registration" | "Login">("Login");
  const [validationOn, setValidationOn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  // Updates email based on the value from EmailWidget
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };

  const handleSubmit = async () => {
    if (!validationOn) {
      setValidationOn(true);
    }

    if (!email || !password || (action === "Registration" && !name)) {
      return;
    }

    const endpoint = action === "Registration" ? "/user" : "/session";
    const body: { [key: string]: string } = {
      email,
      password,
    };
    // Add name to the body if the action is Registration (not Login)
    if (action === "Registration") {
      body.name = name;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

      if (endpoint === "/session") {
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
        </div>
        <div className="inputs">
          {action === "Registration" && (
            <div
              className={"input" + (validationOn && !name ? " validation" : "")}
            >
              <img className="username-icon" src={UserNameIcon} alt="" />
              <input
                className={"inputBox"}
                type="text"
                placeholder="Please enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div
            className={"input" + (validationOn && !email ? " validation" : "")}
          >
            <img className="email-icon" src={EmailIcon} alt="" />
            <EmailWidget onEmailChange={handleEmailChange} action={action} />
            {validationOn && !email && (
              <span style={{ color: "red", fontWeight: "bold" }}>
                Please enter a valid email address.
              </span>
            )}
          </div>
          <div
            className={
              "input" + (validationOn && !password ? " validation" : "")
            }
          >
            <img className="password-icon" src={PasswordIcon} alt="" />
            <PasswordWidget
              password={password}
              onPasswordChange={handlePasswordChange}
              action={action}
            ></PasswordWidget>
          </div>
        </div>
        {action === "Login" && (
          <div className="forget-password">
            Forget Password? Click <a href="/ForgotPassword">Here</a>
          </div>
        )}
        <div className="submit-container">
          <div
            className={
              "submit " + (action === "Login" ? "primary" : "secondary")
            }
            onClick={() => {
              if (action === "Login") {
                handleSubmit();
                return;
              }
              setAction("Login");
              setValidationOn(false);
            }}
          >
            Login
          </div>
          <div
            className={
              "submit " + (action === "Registration" ? "primary" : "secondary")
            }
            onClick={() => {
              if (action === "Registration") {
                handleSubmit();
                return;
              } else {
                setAction("Registration");
                setValidationOn(false);
              }
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
