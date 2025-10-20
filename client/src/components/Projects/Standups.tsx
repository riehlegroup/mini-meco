import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopNavBar from "../common/TopNavBar";
import Button from "@/components/common/Button";
import Textarea from "@/components/common/Textarea";
import SectionCard from "@/components/common/SectionCard";
import AuthStorage from "@/services/storage/auth";
import projectsApi from "@/services/api/projects";

const Standups: React.FC = () => {
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

  return (
    <div className="min-h-screen">
      <TopNavBar title="Standup Emails" showBackButton={true} showUserInfo={true} />

      <div className="mx-auto max-w-6xl space-y-8 p-6">
        <SectionCard title="Submit Standup">
          <div className="space-y-6">
            <Textarea
              label="What did you complete yesterday?"
              placeholder="Enter completed work..."
              value={doneText}
              onChange={(e) => handleInputChange(e, setDoneText)}
              rows={5}
            />

            <Textarea
              label="What are your plans for today?"
              placeholder="Enter your plans..."
              value={plansText}
              onChange={(e) => handleInputChange(e, setPlansText)}
              rows={5}
            />

            <Textarea
              label="What blockers or challenges do you face?"
              placeholder="Enter any challenges..."
              value={challengesText}
              onChange={(e) => handleInputChange(e, setChallengesText)}
              rows={5}
            />

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSendStandups} className="min-w-32">
                Send Email
              </Button>
            </div>

            {message && (
              <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
                {message}
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default Standups;
