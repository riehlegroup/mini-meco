import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReturnButton from "../Components/return";
import { Octokit } from "@octokit/rest";

const CodeActivity: React.FC = () => {
  const navigate = useNavigate();

  const [issue, setIssue] = useState<any>(null);
  const handleNavigation = () => {
    navigate("/code-activity");
  };

  const octokit = new Octokit({
    auth: import.meta.env.VITE_GITHUB_TOKEN,
  });

  const getIssue = async () => {
    try {
      const response = await octokit.request(
        "GET /repos/{owner}/{repo}/commits",
        {
          owner: "shumancheng",
          repo: "Mini-Meco",
        }
      );
      setIssue(response.data);
    } catch (error: any) {
      console.error(
        `Error! Status: ${error.status}. Message: ${error.response.data.message}`
      );
    }
  };

  useEffect(() => {
    getIssue();
  }, []);

  return (
    <div onClick={handleNavigation}>
      <ReturnButton />
      <h3>Code Activity</h3>
      {issue ? <pre>{JSON.stringify(issue, null, 2)}</pre> : <p>Loading...</p>}
    </div>
  );
};

export default CodeActivity;
