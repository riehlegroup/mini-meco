import "./UserPanel.css";
import React, { useState, useEffect } from "react";
import {useNavigate } from "react-router-dom";
import ReturnButton from "../Components/return";
import { API_BASE_URL } from "@/config/api";


let pwErrormessage = ""
let gitErrormessage = ""
let emailErrormessage = ""

const UserPanel: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/user-panel");
  };

  const handleReload = () =>
  {
    window.location.reload();
  };

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [user, setUser] = useState<{
    name: string;
    email: string;
    UserGithubUsername: string;
  } | null>(null);

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
          `${API_BASE_URL}/user/githubUsername?userEmail=${userEmail}`
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

  
  useEffect(() => {
    fetchUserData();
  }, []);


 
  const handleEmailChange = async () => {
    if (!user) {
      console.error("User data not available. Please log in again.");
      return;
    }

    const body = {
      newEmail: newEmail,
      oldEmail: user.email,
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/settings/changeEmail`,
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

      if (data.message && data.message.includes("successfully")) {
        const updatedUser = { ...user, email: newEmail };
        setUser(updatedUser);
        localStorage.setItem("email", newEmail);
        //window.location.reload();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  };

  const handlePasswordChange = async () => {
    if (!user) {
      console.error("User data not available. Please log in again.");
      return;
    }

    const body = {
      userEmail: user.email.toString(),
      password: newPassword,
    };
    try {
      const response = await fetch(
        `${API_BASE_URL}/user/password/change`,
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

      if (data.message && data.message.includes("successfully")) {
        pwErrormessage = "";
        //window.location.reload();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        pwErrormessage = error.message;
      }
    }
  };

  const handleAddGithubUsername = async () => {
    if (!user?.email) {
      console.error("User email not available. Please log in again.");
      return;
    }

    if (!githubUsername || githubUsername.trim() === "") {
      console.error("GitHub username cannot be empty");
      return;
    }

    const body = {
      userEmail: user.email,
      newGithubUsername: githubUsername.trim(),
    };

    console.log("Submitting GitHub username:", body);

    let msg = document.getElementById('ErrorMessageGithub');
    try {
      const response = await fetch(
        `${API_BASE_URL}/user/githubUsername`,
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

      if (data.message && data.message.includes("successfully")) {
        localStorage.setItem("githubUsername", githubUsername.trim());
        gitErrormessage = "";
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        gitErrormessage = error.message;
        if(msg !=null)
        {
          msg.textContent = error.message;
        }
      }
    }
  };

  const handleSubmitAll = async () =>
  {
    if(newEmail != "")
    {
      await handleEmailChange()
    }
    if(newPassword != "")
    {
      await handlePasswordChange()
    }

    await handleAddGithubUsername()
    //fetchUserData();
    if(pwErrormessage == "" && emailErrormessage == "" && gitErrormessage == "")
    {
      window.location.reload();
    }
  }
  return (
    
    <div onClick={handleNavigation}>
      <ReturnButton />
      <div className="DashboardContainer">
        <h1 className="text-4xl">User profile</h1>
      </div>
      <div className="BigContainer">
      <form className="mx-auto max-w-md content-center space-y-10">
        <div className="group relative z-0 mb-5 w-full">
            <label htmlFor="floating_email" className="text-m mb-2 block text-gray-700 dark:text-gray-400">Email</label>
            <input onChange={(e) => setNewEmail(e.target.value)} type="email" name="floating_email" id="floating_email" className="text-m block w-full appearance-none border-0 border-b-2 border-gray-700 bg-transparent px-0 py-2.5 text-gray-900 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-700 dark:text-white dark:focus:border-blue-500" placeholder={user?.email || ""} />
            <label id="ErrorMailPassword" className="text-red-600">{emailErrormessage}</label>
        </div>
        <div className="group relative z-0 mb-5 w-full">
            <label htmlFor="floating_password" className="text-m mb-2 block text-gray-700 dark:text-gray-400">Password</label>
            <input type="password" onChange={(e) => setNewPassword(e.target.value)}  name="floating_password" id="floating_password" className="text-m block w-full appearance-none border-0 border-b-2 border-gray-700 bg-transparent px-0 py-2.5 text-gray-900 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-700 dark:text-white dark:focus:border-blue-500" placeholder="********" />
            <label id="ErrorMessagePassword" className="text-red-600">{pwErrormessage}</label>
        </div>
        <div className="group relative z-0 mb-5 w-full">
            <label htmlFor="floating_github" className="text-m mb-2 block text-gray-700 dark:text-gray-400">GitHub Username</label>
            <input type="text" value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} name="floating_github" id="floating_github" className="text-m block w-full appearance-none border-0 border-b-2 border-gray-700 bg-transparent px-0 py-2.5 text-gray-900 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-700 dark:text-white dark:focus:border-blue-500" placeholder={githubUsername || ""} />
            <label id="ErrorMessageGithub" className="text-red-600">{gitErrormessage}</label>
        </div>
          <button type="button" onClick={handleSubmitAll} className="mb-2 me-2 rounded-full bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Submit</button>
          <button type="button" onClick={handleReload} className="mb-2 me-2 rounded-full bg-red-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Reset</button>
      </form>

      </div>
    </div>
  );
};

export default UserPanel;
