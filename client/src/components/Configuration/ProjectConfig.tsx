import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReturnButton from "../Components/return";
import "./ProjectConfig.css";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Button from "react-bootstrap/esm/Button";
import Edit from "./../../assets/Edit.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const ProjectConfig: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/project-config");
  };

  const [url, setURL] = useState("");
  const [newURL, setNewURL] = useState("");
  const [projects, setProjects] = useState<string[]>([]);
  const [enrolledProjects, setEnrolledProjects] = useState<string[]>([]);
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [edit, setEdit] = useState(false);
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [isOwner, setIsOwner] = useState(false);
  const [canCreateProject, setCanCreateProject] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    const fetchCourses = async () => {
      const userEmail = localStorage.getItem("email");
      if (userEmail) {
        try {
          const response = await fetch(
            `http://localhost:3000/enrolledCourses?userEmail=${userEmail}`
          );
          const data = await response.json();
          setCourses(data.map((course: { projectGroupName: string }) => course.projectGroupName));
        } catch (error) {
          console.error("Error fetching courses:", error);
        }
      }
    };

    fetchCourses();
    }, [navigate]);

    const handleCourseChange = (courseName: string) => {
      setSelectedCourse(courseName);
      setSelectedProject(null);
      fetchProjects(courseName);
    };

    const fetchProjects = async (courseName: string) => {
      const userEmail = localStorage.getItem("email");
      if (userEmail) {
        try {
          const response = await fetch(
            `http://localhost:3000/projectsForCourse?courseName=${courseName}&userEmail=${userEmail}`
          );
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          const data = await response.json();
          setEnrolledProjects(data.enrolledProjects.map((project: { projectName: string }) => project.projectName));
          setAvailableProjects(data.availableProjects.map((project: { projectName: string }) => project.projectName));
          setProjects(data.map((project: { projectName: string }) => project.projectName));
        } catch (error) {
          console.error("Error fetching projects:", error);
        }
      }
    };

    /*
    const fetchProjects = async () => {
      const userEmail = localStorage.getItem("email");
      if (userEmail) {
        try {
          const response = await fetch(
            `http://localhost:3000/userProjects?userEmail=${userEmail}`
          );
          const data = await response.json();
          setProjects(
            data.map((project: { projectName: string }) => project.projectName)
          );
        } catch (error) {
          console.error("Error fetching projects:", error);
        }
      }
    };
    **/

  const handleProjectChange = (projectName: string) => {
    setSelectedProject(projectName);
    fetchProjectURL(projectName);
  };

  const fetchProjectDetails = async (projectName: string) => {
    const userEmail = localStorage.getItem("email");
    if (userEmail) {
      try {
        const response = await fetch(
          `http://localhost:3000/projectDetails?projectName=${projectName}&userEmail=${userEmail}`
        );
        const data = await response.json();
        setURL(data.url || "");
        setIsOwner(data.isOwner);
        setCanCreateProject(data.canCreateProject);
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    }
  };

  const fetchProjectURL = async (projectName: string) => {
    if (!projectName) {
      console.error("Selected project is missing");
      return;
    } else if (!localStorage.getItem("email")) {
      console.error("User email is missing");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/getGitURL?email=${localStorage.getItem(
          "email"
        )}&project=${projectName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching URL:", errorData);
        return;
      }

      const data = await response.json();
      

      if (data && data.url) {
        setURL(data.url || "");
        setEdit(!!data.url);
      } else {
        setURL("");
        setEdit(false);
      }
    } catch (error) {
      console.error("Error fetching URL:", error);
    }
  };

  const handleAddURL = async () => {
    const userEmail = localStorage.getItem("email");
    if (userEmail && selectedProject) {
      try {
        const response = await fetch(
          "http://localhost:3000/projConfig/addURL",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: userEmail,
              URL: url,
              project: selectedProject,
            }),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error adding URL:", errorData);
        } else {
          setMessage(data.message || "URL added successfully");
          if (data.message.includes("successfully")) {
            window.location.reload();
          }
        }
      } catch (error) {
        console.error("Error adding URL:", error);
      }
    } else {
      console.error("User email or selected project is missing");
    }
  };

  const handleChangeURL = async () => {
    const userEmail = localStorage.getItem("email");
    if (userEmail && selectedProject) {
      try {
        const response = await fetch(
          "http://localhost:3000/projConfig/addURL",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: userEmail,
              URL: newURL,
              project: selectedProject,
            }),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error changing URL:", errorData);
        } else {
          setMessage(data.message || "URL changed successfully");
          if (data.message.includes("successfully")) {
            window.location.reload();
          }
        }
      } catch (error) {
        console.error("Error changed URL:", error);
      }
    } else {
      console.error("User email or selected project is missing");
    }
  };

  const handleLeaveProject = async () => {
    const userEmail = localStorage.getItem("email");
    if (userEmail && selectedProject) {
      try {
        const response = await fetch(
          "http://localhost:3000/leaveProject",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ projectName: selectedProject, userEmail }),
          }
        );
        const data = await response.json();
        setMessage(data.message || "Left project successfully");
        if (data.message.includes("successfully")) {
          window.location.reload();
        }
      } catch (error) {
        console.error("Error leaving project:", error);
      }
    }
  };

  const handleCreateProject = async () => {
    const userEmail = localStorage.getItem("email");
    if (userEmail && selectedCourse) {
      try {
        const response = await fetch(
          "http://localhost:3000/createProject",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ courseName: selectedCourse, userEmail }),
          }
        );
        const data = await response.json();
        setMessage(data.message || "Project created successfully");
        if (data.message.includes("successfully")) {
          window.location.reload();
        }
      } catch (error) {
        console.error("Error creating project:", error);
      }
    }
  };

  const handleEditProject = async () => {
    const userEmail = localStorage.getItem("email");
    if (userEmail && selectedProject) {
      try {
        const response = await fetch(
          "http://localhost:3000/editProject",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ projectName: selectedProject, url: newURL, userEmail }),
          }
        );
        const data = await response.json();
        setMessage(data.message || "Project updated successfully");
        if (data.message.includes("successfully")) {
          window.location.reload();
        }
      } catch (error) {
        console.error("Error updating project:", error);
      }
    }
  };

  return (
    <div onClick={handleNavigation}>
      <ReturnButton />
      <div className="DashboardContainer">
        <h1>Project Config</h1>
      </div>
      <div className="BigContainerProjConfig">
        <div className="margintop">
          <Select onValueChange={handleCourseChange}>
            <SelectTrigger className="SelectTriggerProject">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent className="SelectCourse">
              {courses.map((course) => (
                <SelectItem key={course} value={course}>
                  {course}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedCourse && (
          <>
          <div className="margintop">
              <h2>Enrolled Projects</h2>
              <ul>
                {enrolledProjects.map((project) => (
                  <li key={project} onClick={() => handleProjectChange(project)}>
                    {project}
                  </li>
                ))}
              </ul>
            </div>
            <div className="margintop">
              <h2>Available Projects</h2>
              <ul>
                {availableProjects.map((project) => (
                  <li key={project} onClick={() => handleProjectChange(project)}>
                    {project}
                  </li>
                ))}
              </ul>
            </div>
            
            ö

            {selectedProject && (
              <>
                <div className="gitURL">Git URL</div>
                <input
                  className="gitURLInput"
                  type="url"
                  placeholder="Please Add Git URL"
                  value={url}
                  onChange={(e) => setURL(e.target.value)}
                />
                {isOwner && (
                  <Button
                    className="confirm"
                    type="submit"
                    onClick={handleEditProject}
                  >
                    Edit
                  </Button>
                )}
                <Button
                  className="confirm"
                  type="submit"
                  onClick={handleLeaveProject}
                >
                  Leave
                </Button>
              </>
            )}
            {canCreateProject && (
              <Button
                className="confirm"
                type="submit"
                onClick={handleCreateProject}
              >
                Create Project
              </Button>
            )}
          </>
        )}
        {message && <div className="message">{message}</div>}
      </div>
    </div>
  );
};

export default ProjectConfig;