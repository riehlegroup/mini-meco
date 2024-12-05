import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const username = localStorage.getItem("username");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }

    const fetchProjects = async () => {
      const userEmail = localStorage.getItem("email");
      if (userEmail) {
        try {
          const response = await fetch(
            `http://localhost:3000/userProjects?userEmail=${userEmail}`
          );
          const data = await response.json();
          setProjects(data.map((project: { projectName: string }) => project.projectName));
        } catch (error) {
          console.error("Error fetching projects:", error);
        }
      }
    };

    fetchProjects();
  }, [navigate]);

  const handleProjectChange = (projectName: string) => {
    setSelectedProject(projectName);
  };

  const goToStandups = () => {
    if (selectedProject) {
      navigate("/standups", { state: { projectName: selectedProject } });
    }
  };

  const goHappiness = () => {
    if (selectedProject) {
      navigate("/happiness", { state: { projectName: selectedProject } });
    }
  };

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  }


  function goCodeActivity() {
    navigate("/code-activity");
  }

  function goSettings() {
    navigate("/settings");
  }

  function goProjectConfig() {
    navigate("/project-config");
  }

  function goUserAdmin() {
    navigate("/user-admin");
  }

  function goProjectAdmin() {
    navigate("/project-admin");
  }

  return (
    <div>
      <div className="DashboardContainer">
        <h1>Dashboard</h1>
      </div>
      <div className="UserLogoutContainer">
        <div className="UserAttribute">
          <h3>User: {username}</h3>
        </div>
        <div className="Logout" onClick={logout}>
          <h3>Log out</h3>
        </div>
      </div>

      <div>
        <div className="Title">
          <h2>Projects</h2>
        </div>
        <div className="ProjectsContainer">
          <Select onValueChange={handleProjectChange}>
            <SelectTrigger className="SelectTriggerProject">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent className="SelectContentProject">
              {projects.map((project) => (
                <SelectItem key={project} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="componentsContainer">
            <div onClick={goToStandups} className="componentsProject">
              Standups
            </div>
            <div onClick={goHappiness} className="componentsProject">
              Happiness
            </div>
            <div onClick={goCodeActivity} className="componentsProject">
              Code Activity
            </div>
          </div>
        </div>
        <div className="Title ConfigTitle">
          <h2>Configuration</h2>
        </div>
        <div className="Container">
          <div onClick={goSettings} className="components">
            Settings
          </div>
          <div onClick={goProjectConfig} className="components">
            Project Config
          </div>
        </div>

        <div className="Title AdminTitle">
          <h2>Administration</h2>
        </div>
        <div className="Container">
          <div onClick={goUserAdmin} className="components">
            User Admin
          </div>
          <div onClick={goProjectAdmin} className="components">
            Project Admin
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
