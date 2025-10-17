import "./Settings.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Edit from "./../../assets/Edit.png";
import TopNavBar from "../common/TopNavBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import Button from "react-bootstrap/esm/Button";
import AuthStorage from "@/services/storage/auth";
import usersApi from "@/services/api/users";

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/settings");
  };

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [githubMessage, setGithubMessage] = useState("");
  const [githubUsername, setGithubUsername] = useState("");

  const [user, setUser] = useState<{
    name: string;
    email: string;
    UserGithubUsername: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const authStorage = AuthStorage.getInstance();
      const userName = authStorage.getUserName();
      const userEmail = authStorage.getEmail();

      if (userName && userEmail) {
        setUser({
          name: userName,
          email: userEmail,
          UserGithubUsername: "",
        });

        try {
          const githubUser = await usersApi.getGithubUsername(userEmail);
          setGithubUsername(githubUser);
          setUser((prev) => prev ? { ...prev, UserGithubUsername: githubUser } : null);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.warn("User data not found in storage");
      }
    };

    fetchUserData();
  }, []);

  const handleEmailChange = async () => {
    if (!user) {
      setEmailMessage("User data not available. Please log in again.");
      return;
    }

    try {
      const data = await usersApi.changeEmail({
        oldEmail: user.email,
        newEmail: newEmail,
      });

      setEmailMessage(data.message || "Email changed successfully!");
      if (data.message.includes("successfully")) {
        const updatedUser = { ...user, email: newEmail };
        setUser(updatedUser);
        AuthStorage.getInstance().setEmail(newEmail);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        setEmailMessage(error.message);
      }
    }
  };

  const handlePasswordChange = async () => {
    if (!user) {
      setPasswordMessage("User data not available. Please log in again.");
      return;
    }

    try {
      const data = await usersApi.changePassword({
        userEmail: user.email,
        password: newPassword,
      });

      setPasswordMessage(data.message || "Password changed successfully!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        setPasswordMessage(error.message);
      }
    }
  };

  const handleAddGithubUsername = async () => {
    if (!githubUsername) {
      setGithubMessage("GitHub username cannot be empty");
      return;
    }

    if (!user?.email) {
      setGithubMessage("User email not available");
      return;
    }

    try {
      const data = await usersApi.updateGithubUsername({
        userEmail: user.email,
        newGithubUsername: githubUsername,
      });

      setGithubMessage(data.message || "GitHub username added successfully!");
      if (data.message.includes("successfully")) {
        const updatedUser = { ...user, UserGithubUsername: githubUsername } as typeof user;
        setUser(updatedUser);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        setGithubMessage(error.message);
      }
    }
  };

  return (
    <div onClick={handleNavigation}>
      <TopNavBar title="Settings" showBackButton={true} showUserInfo={true} />
      <div className="ProjectContainer">
        <div className="ProjectTitle">
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
                  {emailMessage && <div className="Message">{emailMessage}</div>}
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
                  {passwordMessage && <div className="Message">{passwordMessage}</div>}
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
                  {githubMessage && <div className="Message">{githubMessage}</div>}
                </DialogContent>
              </Dialog>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Settings;