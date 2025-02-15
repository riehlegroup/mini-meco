import "./UserPanel.css";
import React, { useState, useEffect } from "react";
import {useNavigate } from "react-router-dom";
import ReturnButton from "../Components/return";


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
  const [message, setMessage] = useState("");
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

  
  useEffect(() => {
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
        "http://localhost:3000/settings/changeEmail",
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
        //window.location.reload();
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
        "http://localhost:3000/user/password",
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
        pwErrormessage = "";
        //window.location.reload();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        setMessage(error.message);
        pwErrormessage = error.message;
      }
    }
  };

  const handleAddGithubUsername = async () => {

    if (!githubUsername) {
      setMessage("GitHub username cannot be empty");
      return;
    }
  
    const body = {
      userEmail: user?.email,
      newGithubUsername: githubUsername,
    };
    let msg = document.getElementById('ErrorMessageGithub');
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
        //window.location.reload();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        setMessage(error.message);
        if(msg !=null)
        {
          msg.textContent = error.message;
        }
      }
    }
    console.log(message) //For later debugging
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
      setMessage("Working");
      window.location.reload();
    }
    setMessage("Error");
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
            <input onChange={(e) => setNewEmail(e.target.value)} type="email" name="floating_email" id="floating_email" className="text-m peer block w-full appearance-none border-0 border-b-2 border-gray-700 bg-transparent px-0 py-2.5 text-gray-900 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-700 dark:text-white dark:focus:border-blue-500" placeholder="Email" required />
            <label className="text-m absolute top-3 -z-10  origin-[0] -translate-y-6 scale-75 text-gray-700 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 peer-focus:dark:text-blue-500 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4">{user?.email || "Email not available"}</label>
            <label id="ErrorMailPassword" className="text-red-600">{emailErrormessage}</label>
        </div>
        <div className="group relative z-0 mb-5 w-full">
            <input type="password" onChange={(e) => setNewPassword(e.target.value)}  name="floating_password" id="floating_password" className="text-m peer block w-full appearance-none border-0 border-b-2 border-gray-700 bg-transparent px-0 py-2.5 text-gray-900 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-700 dark:text-white dark:focus:border-blue-500" placeholder="Password" required />
            <label className="text-m absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 text-gray-700 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500 rtl:peer-focus:translate-x-1/4">********</label>
            <label id="ErrorMessagePassword" className="text-red-600">{pwErrormessage}</label>
        </div>
        <div className="group relative z-0 mb-5 w-full">
            <input type="github" onChange={(e) => setGithubUsername(e.target.value)} name="floating_github" id="floating_github" className="text-m peer block w-full appearance-none border-0 border-b-2 border-gray-700 bg-transparent px-0 py-2.5 text-gray-900 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-700 dark:text-white dark:focus:border-blue-500" placeholder="Github Username" required />
            <label className="text-m absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 text-gray-700 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500 rtl:peer-focus:translate-x-1/4">{user?.UserGithubUsername}</label>
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
