import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopNavBar from "../common/TopNavBar";
import { Octokit } from "@octokit/rest";
import { Endpoints } from "@octokit/types";
import SectionCard from "@/components/common/SectionCard";
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
import AuthStorage from "@/services/storage/auth";
import ApiClient from "@/services/api/client";

type ArrayElement<T> = T extends (infer U)[] ? U : never;
type Commit = ArrayElement<Endpoints["GET /repos/{owner}/{repo}/commits"]["response"]["data"]>;
type Sprint = {
  id: number;
  projectGroupName: string;
  sprintName: string;
  endDate: number;
  startDate: Date;
  name: string;
};

type CommitCount = {
  sprint: string;
  count: number;
};

const CodeActivity: React.FC = () => {
  const location = useLocation();

  const [commits, setCommits] = useState<Commit[]>([]);
  // GitHub API only returns 30 results on subsequent requests
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [repoDetails, setRepoDetails] = useState<{
    owner: string;
    repo: string;
  } | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);

  const [projectName, setProjectName] = useState<string | null>("");
  const [user, setUser] = useState<{
    name: string;
    email: string;
    githubUsername: string;
  } | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [commitsPerSprint, setCommitsPerSprint] = useState<CommitCount[]>([]);

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
    const fetchCourse = async () => {
      if (!projectName) return;

      try {
        const data = await ApiClient.getInstance().get<{ courseName: string }>(
          "/courseProject/course",
          { projectName: encodeURIComponent(projectName) }
        );
        if (data && data.courseName) {
          setSelectedCourse(data.courseName);
        }
      } catch (error) {
        console.error("Error fetching project group:", error);
      }
    };

    fetchCourse();
  }, [projectName]);

  useEffect(() => {
    const fetchUserData = () => {
      const authStorage = AuthStorage.getInstance();
      const userName = authStorage.getUserName();
      const userEmail = authStorage.getEmail();
      const user = authStorage.getUser();
      const githubUsername = user?.githubUsername;

      console.log("CodeActivity - Loading user data:", { userName, userEmail, githubUsername });

      if (userName && userEmail && githubUsername) {
        setUser({
          name: userName,
          email: userEmail,
          githubUsername: githubUsername,
        });
      } else {
        console.warn("User data not found in storage", { userName, userEmail, githubUsername });
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
      const data = await ApiClient.getInstance().get<{ url: string; message?: string }>(
        "/user/project/url",
        {
          userEmail: encodeURIComponent(user.email),
          projectName: encodeURIComponent(projectName)
        }
      );

      if (data.url) {
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
      if (!selectedCourse) return;

      try {
        const fetchedSprints: Sprint[] = await ApiClient.getInstance().get<Sprint[]>(
          "/courseProject/sprints",
          { courseName: encodeURIComponent(selectedCourse) }
        );

        // Only have end date, so calculate start date
        const updatedSprints = fetchedSprints.map(
          (sprint, index) => {
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
  }, [selectedCourse]);
  

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

      const filteredCommits: Commit[] = response.data.filter((commit) => {
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
    if (hasMore && repoDetails && sprints.length && user) {
      console.log("Loading more commits...");
      getCommits(page);
    } else {
      console.log("Not loading more commits:", {
        hasMore,
        repoDetails,
        sprints,
        user,
      });
    }
  }, [page, repoDetails, sprints, user]);

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
          const commitDate = new Date(commit.commit.author?.date ?? 0);
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
    <div className="min-h-screen">
      <TopNavBar title="Code Activity" showBackButton={true} showUserInfo={true} />
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        <SectionCard title="Commits on GitHub">
          <div className="space-y-4">
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
              <p className="text-slate-600">Loading...</p>
            ) : (
              <p className="text-slate-500">No commits found.</p>
            )}
            {loading && <p className="text-sm text-slate-500">Loading more commits...</p>}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default CodeActivity;
