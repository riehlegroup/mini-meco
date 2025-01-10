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
  const [enrolledProjects, setEnrolledProjects] = useState<string[]>([]);
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedAvailableProject, setSelectedAvailableProject] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [edit, setEdit] = useState(false);
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [user, setUser] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [role, setRole] = useState("");
  const [projectRoles, setProjectRoles] = useState<{ [key: string]: string }>({});

  


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    const fetchUserData = async () => {
      const userName = localStorage.getItem("username");
      const userEmail = localStorage.getItem("email");
      if (userName && userEmail) {
        setUser({
          name: userName,
          email: userEmail,
        });
      } else {
        console.warn("User data not found in localStorage");
      }
    };

    fetchUserData();

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
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }
  };

  const fetchRoles = async (projectName: string) => {
    const userEmail = localStorage.getItem("email");
    if (userEmail) {
      try {
        const response = await fetch(
          `http://localhost:3000/roleForProject?projectName=${projectName}&userEmail=${userEmail}`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setRole(data.role);
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    }
  }
  const handleProjectChange = (projectName: string) => {
    setSelectedProject(projectName);
    fetchProjectURL(projectName);
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
  const handleJoin = async (projectName: string) => {
    if (!user) {
      setMessage("User data not available. Please log in again.");
      return;
    }

    const body = {
      projectName,
      memberName: user.name,
      memberRole: role,
      memberEmail: user.email,
    };

    try {
      const response = await fetch(
        "http://localhost:3000/projConfig/joinProject",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage(data.message || "Successfully joined the project!");
      if (data.message.includes("successfully")) {
        window.location.reload();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        setMessage(error.message);
      }
    }
  };

  const handleLeave = async (projectName: string) => {
    if (!user) {
      setMessage("User data not available. Please log in again.");
      return;
    }
    const body = {
      projectName,
      memberEmail: user.email,
    };

    try {
      const response = await fetch(
        "http://localhost:3000/projConfig/leaveProject",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage(data.message || "Successfully left the project!");
      if (data.message.includes("successfully")) {
        window.location.reload();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        setMessage(error.message);
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

  return (
    <div onClick={handleNavigation}>
      <ReturnButton />
      <div className="DashboardContainer">
        <h1>Project Configuration</h1>
      </div>
      <div className="BigContainerProjConfig">
        <div className="margintop">
          <h2>Enrolled Courses</h2>
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
                  <li key={project}>
                    {project}
                    
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="editButton"
                            type="button"
                            onClick={() => handleProjectChange(project)}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="DialogContent">
                          <DialogHeader>
                            <DialogTitle className="DialogTitle">
                              Edit Project URL
                            </DialogTitle>
                          </DialogHeader>
                          <div className="URLInput">
                            <div className="URL">
                              {url ? `Current URL: ${url}` : "No URL currently set"}
                            </div>
                            <input
                              type="text"
                              className="ProjAdmin-inputBox"
                              placeholder="Enter new URL"
                              value={newURL}
                              onChange={(e) => setNewURL(e.target.value)}
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              className="create"
                              variant="primary"
                              onClick={handleChangeURL}
                            >
                              Save
                            </Button>
                          </DialogFooter>
                          {message && <div className="Message">{message}</div>}
                        </DialogContent>
                      </Dialog>
                    
                    <Button
                      className="leaveButton"
                      type="button"
                      onClick={() => handleLeave(project)}
                    >
                      Leave
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="margintop">
              <h2>Available Projects</h2>
              <Select onValueChange={setSelectedAvailableProject}>
                <SelectTrigger className="SelectTriggerProject">
                  <SelectValue placeholder="Select Project to Join" />
                </SelectTrigger>
                <SelectContent className="SelectContentProject">
                  {availableProjects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAvailableProject && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="joinButton"
                      type="button"
                    >
                      Join
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="DialogContent">
                    <DialogHeader>
                      <DialogTitle className="DialogTitle">
                        Join Project
                      </DialogTitle>
                    </DialogHeader>
                    <div className="RoleInput">
                      <div className="Role">Role: </div>
                      <input
                        type="text"
                        className="ProjAdmin-inputBox"
                        placeholder="Enter your role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        className="create"
                        variant="primary"
                        onClick={() => handleJoin(selectedAvailableProject)}
                      >
                        Join
                      </Button>
                    </DialogFooter>
                    {message && <div className="Message">{message}</div>}
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {message && <div className="message">{message}</div>}

            {(
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