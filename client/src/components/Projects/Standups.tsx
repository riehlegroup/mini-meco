import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReturnButton from "../Components/return";
import "./Standups.css";
import Button from "react-bootstrap/esm/Button";

const Standups: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projectName, setProjectName] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const projectNameFromState = location.state?.projectName;
    if (projectNameFromState) {
      setProjectName(projectNameFromState);
    }
    const storedUserName = localStorage.getItem("username");
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, [location.state]);

  console.log("Project Name:", projectName);

  const handleStandups = () => {
    navigate("/standups");
  };

  const [doneText, setDoneText] = useState("");
  const [plansText, setPlansText] = useState("");
  const [challengesText, setChallengesText] = useState("");

  const handleSendStandups = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!projectName) {
      console.error("No project selected");
      return;
    }

    const endpoint = "/courseProject/standupsEmail";
    const body = { projectName, userName, doneText, plansText, challengesText };

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

      console.log(data.message || "Success!");
      if (data.message.includes("successfully")) {
        window.location.reload();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unexpected error occurred");
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setState: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setState(e.target.value);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const value = target.value;
      const newValue = value + "\n";
      target.value = newValue;
    }
  };

  return (
    <div onClick={handleStandups}>
      <ReturnButton />
      <div className="DashboardContainerStandups">
        <h1>Standup Emails</h1>
      </div>
      <div className="BigContainerStandups">
        <div className="InputContainer">
          <div className="Done">
            <div className="DoneTitle">Done</div>
            <textarea
              className="DoneContainer"
              value={doneText}
              onChange={(e) => handleInputChange(e, setDoneText)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="Plans">
            <div className="PlansTitle">Plans</div>
            <textarea
              className="PlansContainer"
              value={plansText}
              onChange={(e) => handleInputChange(e, setPlansText)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="Challenges">
            <div className="ChallengesTitle">Challenges</div>
            <textarea
              className="ChallengesContainer"
              value={challengesText}
              onChange={(e) => handleInputChange(e, setChallengesText)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        <Button
          className="SendButton"
          type="submit"
          onClick={handleSendStandups}
        >
          Send Email
        </Button>
      </div>
    </div>
  );
};

export default Standups;
