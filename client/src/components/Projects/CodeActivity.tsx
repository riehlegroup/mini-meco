import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReturnButton from "../Components/return";
import { Octokit } from "@octokit/rest";
import "./CodeActivity.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CodeActivity: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [commits, setCommits] = useState<any[]>([]);
  // GitHub API only returns 30 results on subsequent requests
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [repoDetails, setRepoDetails] = useState<{
    owner: string;
    repo: string;
  } | null>(null);
  const [sprints, setSprints] = useState<any[]>([]);

  const [projectName, setProjectName] = useState<string | null>("");
  const [user, setUser] = useState<{
    name: string;
    email: string;
    githubUsername: string;
  } | null>(null);
  // @ts-ignore: suppress unused variable warning
  const [projectGroups, setProjectGroups] = useState<string[]>([]);
  const [selectedProjectGroup, setSelectedProjectGroup] = useState<string>("");
  const [commitsPerSprint, setCommitsPerSprint] = useState<any[]>([]);

  const handleNavigation = () => {
    navigate("/code-activity");
  };

  const octokit = new Octokit({
    auth: import.meta.env.VITE_GITHUB_TOKEN,
  });

  useEffect(() => {
    const projectNameFromState = location.state?.projectName;
    if (projectNameFromState) {
      setProjectName(projectNameFromState);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchProjectGroup = async () => {
      if (!projectName) return;

      try {
        const response = await fetch(
          `http://localhost:3000/getUserProjectGroups?projectName=${encodeURIComponent(
            projectName
          )}`
        );
        if (response.ok) {
          const text = await response.text();
          if (text) {
            const data = JSON.parse(text);
            if (data && data.projectGroupName) {
              setSelectedProjectGroup(data.projectGroupName);
            }
          } else {
            console.error("Empty response body");
          }
        } else {
          console.error(`Error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error fetching project group:", error);
      }
    };

    fetchProjectGroup();
  }, [projectName]);

  useEffect(() => {
    const fetchUserData = () => {
      const userName = localStorage.getItem("username");
      const userEmail = localStorage.getItem("email");
      const githubUsername = localStorage.getItem("githubUsername");
      if (userName && userEmail && githubUsername) {
        setUser({
          name: userName,
          email: userEmail,
          githubUsername: githubUsername,
        });
      } else {
        console.warn("User data not found in localStorage");
      }
    };

    fetchUserData();
  }, []);

  const extractOwnerAndRepo = (url: string) => {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2] };
    } else {
      console.error("Failed to extract owner and repo from URL:", url);
      return { owner: undefined, repo: undefined };
    }
  };

  const fetchRepoUrl = async () => {
    if (!projectName || !user?.email) return;

    try {
      const response = await fetch(
        `http://localhost:3000/getProjectGitHubURL?email=${encodeURIComponent(
          user.email
        )}&projectName=${encodeURIComponent(projectName)}`
      );
      const data = await response.json();

      if (response.ok && data.url) {
        console.log("Fetched repository URL:", data.url);
        const { owner, repo } = extractOwnerAndRepo(data.url);
        if (owner && repo) {
          setRepoDetails({ owner, repo });
        } else {
          console.error("Failed to extract owner and repo from URL:", data.url);
        }
        console.log("Owner:", owner);
        console.log("Repo:", repo);
      } else {
        console.error("Error:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching repository URL:", error);
    }
  };

  useEffect(() => {
    fetchRepoUrl();
  }, [projectName, user]);

  useEffect(() => {
    const fetchAllSprints = async () => {
      if (!selectedProjectGroup) return;
  
      try {
        const response = await fetch(
          `http://localhost:3000/sprints?projectGroupName=${encodeURIComponent(
            selectedProjectGroup
          )}`
        );
        const fetchedSprints = await response.json();
  
        // Only have end date, so calculate start date
        const updatedSprints = fetchedSprints.map(
          (sprint: any, index: number) => {
            const sprintName = `sprint${index}`; 
            if (index === 0) {
              // First sprint: start date is one week before end date
              const startDate = new Date(sprint.endDate);
              startDate.setDate(startDate.getDate() - 7);
              return { ...sprint, startDate, name: sprintName }; 
            } else {
              // Other sprints: start date is the previous sprint's end date
              const startDate = new Date(fetchedSprints[index - 1].endDate);
              return { ...sprint, startDate, name: sprintName }; 
            }
          }
        );
  
        setSprints(updatedSprints);
      } catch (error) {
        console.error("Error fetching sprints:", error);
      }
    };
  
    fetchAllSprints();
  }, [selectedProjectGroup]);
  

  const getCommits = async (page: number) => {
    if (!repoDetails || !sprints.length) {
      console.log(
        "Repo details or sprints data is missing, skipping commit fetch."
      );
      return;
    }

    console.log(`Fetching commits for page ${page}...`);

    setLoading(true);

    try {
      const response = await octokit.request(
        "GET /repos/{owner}/{repo}/commits",
        {
          owner: repoDetails.owner,
          repo: repoDetails.repo,
          per_page: 100,
          page: page,
          author: user?.githubUsername,
        }
      );

      console.log("Fetched commits:", response.data);

      const filteredCommits = response.data.filter((commit) => {
        const commitDate = commit.commit.author?.date
          ? new Date(commit.commit.author.date)
          : new Date();

        const isWithinSprint = sprints.some((sprint) => {
          const sprintStart = new Date(sprint.startDate);
          const sprintEnd = new Date(sprint.endDate);

          return commitDate >= sprintStart && commitDate <= sprintEnd;
        });
        return isWithinSprint;
      });

      console.log("Filtered commits:", filteredCommits);

      setCommits((prevCommits) => [...prevCommits, ...filteredCommits]);
      if (response.data.length < 100) {
        console.log("No more commits to fetch.");
        setHasMore(false);
      } else {
        console.log("There are more commits to fetch.");
      }
    } catch (error) {
      console.error(`Error fetching commits: ${error}`);
      setHasMore(false);
    } finally {
      console.log("Stopping loading state");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasMore && repoDetails && sprints.length) {
      console.log("Loading more commits...");
      getCommits(page);
    } else {
      console.log("Not loading more commits:", {
        hasMore,
        repoDetails,
        sprints,
      });
    }
  }, [page, repoDetails, sprints]);

  useEffect(() => {
    if (hasMore && !loading) {
      // Automatically increment page number to fetch next set of commits
      setPage((prevPage) => prevPage + 1);
    }
  }, [commits]); // Trigger whenever commits are updated

  useEffect(() => {
    const calculateCommitsPerSprint = () => {
      const commitsCount = sprints.map((sprint) => {
        const sprintStart = new Date(sprint.startDate);
        const sprintEnd = new Date(sprint.endDate);
        const commitsInSprint = commits.filter((commit) => {
          const commitDate = new Date(commit.commit.author.date);
          return commitDate >= sprintStart && commitDate <= sprintEnd;
        });
        return { sprint: sprint.name, count: commitsInSprint.length }; // Ensure `sprint` is the name
      });
  
      setCommitsPerSprint(commitsCount);
    };
  
    if (commits.length && sprints.length) {
      calculateCommitsPerSprint();
    }
  }, [commits, sprints]);
  

  return (
    <div onClick={handleNavigation}>
      <ReturnButton />
      <div className="DashboardContainerStandups">
        <h1>Code Activity</h1>
      </div>
      <div className="BigContainerCodeActivity">
        <div className="GitHubTitle">
          <h2>Commits on GitHub</h2>
        </div>
        {commits.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={commitsPerSprint}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sprint" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        ) : loading ? (
          <p>Loading...</p>
        ) : (
          <p>No commits found.</p>
        )}
        {loading && <p>Loading more commits...</p>}
      </div>
    </div>
  );
};

export default CodeActivity;
