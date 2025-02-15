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
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [user, setUser] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [createdProject, setCreatedProject] = useState<string>("");
  const [memberRole, setMemberRole] = useState("");
  const [projectRoles, setProjectRoles] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState('');





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
            `http://localhost:3000/user/courses?userEmail=${userEmail}`
          );
          const data = await response.json();
          setCourses(data.map((course: { courseName: string }) => course.courseName));
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
          `http://localhost:3000/course/courseProjects?courseName=${courseName}&userEmail=${userEmail}`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setEnrolledProjects(data.enrolledProjects.map((project: { projectName: string }) => project.projectName));
        setAvailableProjects(data.availableProjects.map((project: { projectName: string }) => project.projectName));

        for (const project of data.enrolledProjects) {
          try {
            const roleResponse = await fetch(
              `http://localhost:3000/courseProject/user/role?projectName=${project.projectName}&userEmail=${userEmail}`
            );

            const roleData = await roleResponse.json();
            setProjectRoles((prevRoles) => ({
              ...prevRoles,
              [project.projectName]: roleData.role,
            }));

          } catch (error) {
            console.error("Error fetching role:", error);
          }
        }

      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }
  };


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
        `http://localhost:3000/user/project/url?email=${localStorage.getItem(
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
      } else {
        setURL("");
      }
    } catch (error) {
      console.error("Error fetching URL:", error);
    }
  };

  const handleChangeURL = async () => {
    const userEmail = localStorage.getItem("email");
    if (userEmail && selectedProject) {
      try {
        const response = await fetch("http://localhost:3000/user/project/url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userEmail: userEmail,
            URL: newURL,
            projectName: selectedProject,
          }),
        });
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
  const handleJoin = async (projectName: string, role: string) => {
    if (!user) {
      setMessage("User data not available. Please log in again.");
      return;
    }

    const body = {
      projectName,
      memberName: user.name,
      memberRole: role,
      memberEmail: user.email.toString(),
    };

    try {
      const response = await fetch(
        "http://localhost:3000/user/project",
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
      memberEmail: user.email.toString(),
    };

    try {
      const response = await fetch(
        "http://localhost:3000/user/project",
        {
          method: "DELETE",
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

  const handleCreate = async (projectName: string) => {
    const body = {
      courseName: selectedCourse,
      projectName,
    };

    try {
      const response = await fetch(
        `http://localhost:3000/courseProject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      setMessage(data.message || "Project created successfully");
      if (data.message.includes("successfully")) {
        window.location.reload();
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred");
      }
    }
  };

  const validateProjectName = (name: string) => {
    const isValid = /^[a-zA-Z0-9_]+$/.test(name);
    if (!isValid) {
      setError('Project name can only contain letters, numbers, and underscores.');
    } else {
      setError('');
    }
  };

  const handleCreateAndJoin = async (projectName: string) => {
    await handleCreate(projectName);
    await handleJoin(projectName, "owner");
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
              <div className="project-container">
                <ul className="project-list">
                  {enrolledProjects.map((project) => (
                    <li key={project} className="project-item">
                      <span>{project}</span>
                      <div className="project-buttons">

                        {projectRoles[project] === "owner" && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                className="editButton"
                                type="button"
                                onClick={() => handleProjectChange(project)}
                              >
                                <img src={Edit} alt="Edit" />
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
                        )}

                        <Button
                          className="leaveButton"
                          type="button"
                          onClick={() => handleLeave(project)}
                        >
                          Leave
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
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
                        value={memberRole}
                        onChange={(e) => setMemberRole(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        className="create"
                        variant="primary"
                        onClick={() => handleJoin(selectedAvailableProject, memberRole)}
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

            <Dialog>
              <DialogTrigger asChild>
                <div className="createButton">
                  <Button
                    className="createButton"
                    type="button"
                  >
                    Create Project
                  </Button>
                </div>
              </DialogTrigger>
              <DialogContent className="DialogContent">
                <DialogHeader>
                  <DialogTitle className="DialogTitle">
                    Create Project
                  </DialogTitle>
                </DialogHeader>
                <div className="ProjectInput">
                  <div className="ProjectName">Project Name: </div>
                  <input
                    type="text"
                    className="ProjAdmin-inputBox"
                    placeholder="Enter project name"
                    value={createdProject}
                    onChange={(e) => {
                      setCreatedProject(e.target.value);
                      validateProjectName(e.target.value);
                    }}
                  />
                  {error && <div className="ErrorMessage">{error}</div>}
                </div>
                <DialogFooter>
                  <Button
                    className="create"
                    variant="primary"
                    onClick={() => handleCreateAndJoin(createdProject)}
                    disabled={!!error}
                  >
                    Create
                  </Button>
                </DialogFooter>
                {message && <div className="Message">{message}</div>}
              </DialogContent>
            </Dialog>
          </>
        )}
        {message && <div className="message">{message}</div>}
      </div>
    </div>
  );
};

export default ProjectConfig;
