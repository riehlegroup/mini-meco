import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopNavBar from "../common/TopNavBar";
import "./Standups.css";
import Button from "react-bootstrap/esm/Button";
import AuthStorage from "@/services/storage/auth";
import projectsApi from "@/services/api/projects";

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
    const authStorage = AuthStorage.getInstance();
    const storedUserName = authStorage.getUserName();
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
  const [message, setMessage] = useState("");

  const handleSendStandups = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!projectName || !userName) {
      console.error("Missing project or user information");
      setMessage("Missing project or user information");
      return;
    }

    const authStorage = AuthStorage.getInstance();
    const userEmail = authStorage.getEmail();

    if (!userEmail) {
      setMessage("User email not found");
      return;
    }

    try {
      await projectsApi.sendStandupEmail({
        userEmail,
        projectName,
        yesterday: doneText,
        today: plansText,
        blockers: challengesText,
      });

      setMessage("Standup email sent successfully");
      setDoneText("");
      setPlansText("");
      setChallengesText("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred");
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
      <TopNavBar title="Standup Emails" showBackButton={true} showUserInfo={true} />
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
        {message && <div className="my-5 p-3 text-center text-base font-semibold text-green-700">{message}</div>}
      </div>
    </div>
  );
};

export default Standups;
