import React, { useState, useEffect } from "react";
import TopNavBar from "../common/TopNavBar";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import SectionCard from "@/components/common/SectionCard";
import AuthStorage from "@/services/storage/auth";
import usersApi from "@/services/api/users";

const UserPanel: React.FC = () => {

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [githubMessage, setGithubMessage] = useState("");
  const [user, setUser] = useState<{
    name: string;
    email: string;
    UserGithubUsername: string;
  } | null>(null);

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

  
  useEffect(() => {
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
        setNewEmail("");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
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
      if (data.message.includes("successfully")) {
        setNewPassword("");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setPasswordMessage(error.message);
      }
    }
  };

  const handleAddGithubUsername = async () => {
    if (!user?.email) {
      setGithubMessage("User email not available. Please log in again.");
      return;
    }

    if (!githubUsername || githubUsername.trim() === "") {
      setGithubMessage("GitHub username cannot be empty");
      return;
    }

    try {
      const data = await usersApi.updateGithubUsername({
        userEmail: user.email,
        newGithubUsername: githubUsername.trim(),
      });

      setGithubMessage(data.message || "GitHub username updated successfully!");
      if (data.message.includes("successfully")) {
        const updatedUser = { ...user, UserGithubUsername: githubUsername } as typeof user;
        setUser(updatedUser);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setGithubMessage(error.message);
      }
    }
  };

  const handleSubmitAll = async () => {
    if (newEmail) {
      await handleEmailChange();
    }
    if (newPassword) {
      await handlePasswordChange();
    }
    if (githubUsername) {
      await handleAddGithubUsername();
    }
  };

  return (
    <div className="min-h-screen">
      <TopNavBar title="User Profile" showBackButton={true} showUserInfo={true} />

      <div className="mx-auto max-w-6xl space-y-8 p-6">
        <SectionCard title="Update Profile">
          <div className="space-y-6">
            <Input
              type="email"
              label="Email Address"
              placeholder={user?.email || ""}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            {emailMessage && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                {emailMessage}
              </div>
            )}

            <Input
              type="password"
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {passwordMessage && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                {passwordMessage}
              </div>
            )}

            <Input
              type="text"
              label="GitHub Username"
              placeholder="Enter your GitHub username"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
            />
            {githubMessage && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                {githubMessage}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSubmitAll}>Submit Changes</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setNewEmail("");
                  setNewPassword("");
                  setGithubUsername("");
                  setEmailMessage("");
                  setPasswordMessage("");
                  setGithubMessage("");
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default UserPanel;
