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
import TopNavBar from "@/components/common/TopNavBar";
import { useUserRole } from "@/hooks/useUserRole";
import AuthStorage from "@/services/storage/auth";
import projectsApi from "@/services/api/projects";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const userRole = useUserRole();

  const authStorage = AuthStorage.getInstance();
  console.log("[Dashboard] mounted");

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      navigate("/login");
    }

    const fetchProjects = async () => {
      const userEmail = authStorage.getEmail();
      if (userEmail) {
        try {
          const data = await projectsApi.getUserProjects(userEmail);
          setProjects(data.map((project) => project.projectName));
        } catch (error) {
          console.error("Error fetching projects:", error);
        }
      }
    };

    fetchProjects();
  }, [navigate, authStorage]);

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

  function goCodeActivity() {
    if (selectedProject) {
      navigate("/code-activity", { state: { projectName: selectedProject } });
    }
  }

  function goSettings() {
    navigate("/settings");
  }

  function goCourseParticipation() {
    navigate("/course-participation");
  }

  function goProjectConfig() {
    navigate("/project-config");
  }
  function goUserPanel() {
    navigate("/user-panel");
  }
  function goUserAdmin() {
    navigate("/user-admin");
  }

  function goCourseAdmin() {
    navigate("/course-admin");
  }

  return (
    <div>
      <TopNavBar title="Dashboard" showBackButton={false} showUserInfo={true} />

      <div>
        <div className="Title">
          <h2>Projects</h2>
        </div>
        <div className="ComponentContainer">
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
            <div onClick={goToStandups} className={"components" + (selectedProject ? "" : " disabled")}>
              Standups
            </div>
            <div onClick={goHappiness} className={"components" + (selectedProject ? "" : " disabled")}>
              Happiness
            </div>
            <div onClick={goCodeActivity} className={"components" + (selectedProject ? "" : " disabled")}>
              Code Activity
            </div>
        </div>
        <div className="Title">
          <h2>Configuration</h2>
        </div>
        
        <div className="ComponentContainer">
          <div onClick={goUserPanel} className="components">
              User profile
          </div>
          <div onClick={goSettings} className="components">
            Settings
          </div>
          <div onClick={goCourseParticipation} className="components">
            Course Participation
          </div>
          <div onClick={goProjectConfig} className="components">
            Project Config
          </div>
        </div>

       {userRole === "ADMIN" && (
        <>
        <div className="Title">
          <h2>System Administration</h2>
        </div>
        <div className="ComponentContainer">
          <div onClick={goUserAdmin} className="components">
            User Admin
          </div>
          <div onClick={goCourseAdmin} className="components">
            Course Admin
          </div>
        </div>
       </>)}
      </div>
    </div>
  );
};

export default Dashboard;
