import "./Settings.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Edit from "./../../assets/Edit.png";
import ReturnButton from "../Components/return";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import Button from "react-bootstrap/esm/Button";

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/settings");
  };

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [githubUsername, setGithubUsername] = useState("");

  const [user, setUser] = useState<{
    name: string;
    email: string;
    UserGithubUsername: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userName = localStorage.getItem("username");
      const userEmail = localStorage.getItem("email");
      const userGithubUsername = localStorage.getItem("githubUsername");
      if (userName && userEmail) {
        setUser({
          name: userName,
          email: userEmail,
          UserGithubUsername: userGithubUsername || "",
        });
      } else {
        console.warn("User data not found in localStorage");
      }

      if (userEmail) {
        try {
          const response = await fetch(
            `http://localhost:3000/user/githubUsername?email=${userEmail}`
          );
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || "Something went wrong");
          }
          setGithubUsername(data.githubUsername || "");
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.warn("User email not found in localStorage");
      }
    };

    fetchUserData();
  }, []);

  const handleEmailChange = async () => {
    if (!user) {
      setMessage("User data not available. Please log in again.");
      return;
    }

    const body = {
      newEmail: newEmail,
      oldEmail: user.email.toString(),
    };

    try {
      const response = await fetch(
        `http://localhost:3000/user/${user.email}/email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage(data.message || "Email changed successfully!");
      if (data.message.includes("successfully")) {
        const updatedUser = { ...user, email: newEmail };
        setUser(updatedUser);
        localStorage.setItem("email", newEmail);
        window.location.reload();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        setMessage(error.message);
      }
    }
  };

  const handlePasswordChange = async () => {
    if (!user) {
      setMessage("User data not available. Please log in again.");
      return;
    }

    const body = {
      userEmail: user.email.toString(),
      password: newPassword,
    };

    try {
      const response = await fetch(
        `http://localhost:3000/user/${encodeURIComponent(user.email)}/password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage(data.message || "Password changed successfully!");
      if (data.message.includes("successfully")) {
        window.location.reload();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        setMessage(error.message);
      }
    }
  };

  const handleAddGithubUsername = async () => {
    if (!githubUsername) {
      setMessage("GitHub username cannot be empty");
      return;
    }

    const body = {
      email: user?.email,
      newGithubUsername: githubUsername,
    };

    try {
      const response = await fetch(
        "http://localhost:3000/user/githubUsername",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      console.log(response);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage(data.message || "GitHub username added successfully!");
      if (data.message.includes("successfully")) {
        setGithubUsername(githubUsername);
        localStorage.setItem("githubUsername", githubUsername);
        window.location.reload();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        setMessage(error.message);
      }
    }
  };

  return (
    <div onClick={handleNavigation}>
      <ReturnButton />
      <div className="DashboardContainer">
        <h1>Settings</h1>
      </div>
      <div className="BigContainer">
        <div className="AccountInfoContainer">
          <div className="AccountTitle">
            <h3>Account Info</h3>
          </div>
          <div className="PersonalDataContainer">
            <div className="PersonalData">
              <div className="Email">
                Email: {user?.email || "Email not available"}
              </div>

              <Dialog>
                <DialogTrigger className="DialogTrigger">
                  <img className="Edit" src={Edit} />
                </DialogTrigger>
                <DialogContent className="DialogContent">
                  <DialogHeader>
                    <DialogTitle className="DialogTitle">
                      Change Email Address
                    </DialogTitle>
                  </DialogHeader>
                  <div className="EmailInput">
                    <div className="newEmail">New Email: </div>
                    <input
                      type="text"
                      className="NewEmail-inputBox"
                      placeholder="Enter your new email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      className="create"
                      variant="primary"
                      onClick={handleEmailChange}
                    >
                      Change
                    </Button>
                  </DialogFooter>
                  {message && <div className="Message">{message}</div>}
                </DialogContent>
              </Dialog>
            </div>
            <div className="PersonalData">
              <div className="Password">Password: ********</div>
              <Dialog>
                <DialogTrigger className="DialogTrigger">
                  <img className="Edit" src={Edit} />
                </DialogTrigger>
                <DialogContent className="DialogContent">
                  <DialogHeader>
                    <DialogTitle className="DialogTitle">
                      Change Password
                    </DialogTitle>
                  </DialogHeader>
                  <div className="EmailInput">
                    <div className="newEmail">New Password: </div>
                    <input
                      type="password"
                      className="NewEmail-inputBox"
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      className="create"
                      variant="primary"
                      onClick={handlePasswordChange}
                    >
                      Change
                    </Button>
                  </DialogFooter>
                  {message && <div className="Message">{message}</div>}
                </DialogContent>
              </Dialog>
            </div>
            <div className="PersonalData">
              <div className="GitHub">
                GitHub Username: {user?.UserGithubUsername}
              </div>
              <Dialog>
                <DialogTrigger className="DialogTrigger">
                  <img className="Edit" src={Edit} />
                </DialogTrigger>
                <DialogContent className="DialogContent">
                  <DialogHeader>
                    <DialogTitle className="DialogTitle">
                      Edit GitHub Username
                    </DialogTitle>
                  </DialogHeader>
                  <div className="GitHubInput">
                    <div className="GitHubusername">GitHub username: </div>
                    <input
                      type="text"
                      className="GitHubUsername-inputBox"
                      placeholder="Enter your GitHub username"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      className="create"
                      variant="primary"
                      onClick={handleAddGithubUsername}
                    >
                      Confirm
                    </Button>
                  </DialogFooter>
                  {message && <div className="Message">{message}</div>}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;