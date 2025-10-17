import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import TopNavBar from "@/components/common/TopNavBar";
import Button from "@/components/common/Button";
import SectionCard from "@/components/common/SectionCard";
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
    <div className="min-h-screen">
      <TopNavBar title="Dashboard" showBackButton={false} showUserInfo={true} />

      <div className="mx-auto max-w-6xl space-y-8 p-6">
        {/* Projects Section */}
        <SectionCard title="Projects">
          <div className="space-y-4">
            <Select onValueChange={handleProjectChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project} value={project}>
                    {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={goToStandups}
                disabled={!selectedProject}
              >
                Standups
              </Button>
              <Button
                onClick={goHappiness}
                disabled={!selectedProject}
              >
                Happiness
              </Button>
              <Button
                onClick={goCodeActivity}
                disabled={!selectedProject}
              >
                Code Activity
              </Button>
            </div>
          </div>
        </SectionCard>

        {/* Configuration Section */}
        <SectionCard title="Configuration">
          <div className="flex flex-wrap gap-4">
            <Button onClick={goUserPanel}>
              User profile
            </Button>
            <Button onClick={goSettings}>
              Settings
            </Button>
            <Button onClick={goCourseParticipation}>
              Course Participation
            </Button>
            <Button onClick={goProjectConfig}>
              Project Config
            </Button>
          </div>
        </SectionCard>

        {/* System Administration Section */}
        {userRole === "ADMIN" && (
          <SectionCard title="System Administration">
            <div className="flex flex-wrap gap-4">
              <Button onClick={goUserAdmin}>
                User Admin
              </Button>
              <Button onClick={goCourseAdmin}>
                Course Admin
              </Button>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
