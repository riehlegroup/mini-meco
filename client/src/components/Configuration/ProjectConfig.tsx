import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReturnButton from "../common/ReturnButton";
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
import AuthStorage from "@/services/storage/auth";
import ApiClient from "@/services/api/client";

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
  const [courses, setCourses] = useState<{ id: number; courseName: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<{ id: number; courseName: string } | null>(null);
  const [user, setUser] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [createdProject, setCreatedProject] = useState<string>("");
  const [memberRole, setMemberRole] = useState("");
  const [projectRoles, setProjectRoles] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState('');





  useEffect(() => {
    const authStorage = AuthStorage.getInstance();
    const token = authStorage.getToken();
    if (!token) {
      navigate("/login");
    }
    const fetchUserData = async () => {
      const userName = authStorage.getUserName();
      const userEmail = authStorage.getEmail();
      if (userName && userEmail) {
        setUser({
          name: userName,
          email: userEmail,
        });
      } else {
        console.warn("User data not found in storage");
      }
    };

    fetchUserData();

    const fetchCourses = async () => {
      const userEmail = authStorage.getEmail();
      if (userEmail) {
        try {
          const data = await ApiClient.getInstance().get<Array<{ id: number; courseName: string }>>(
            "/user/courses",
            { userEmail }
          );
          setCourses(data);
        } catch (error) {
          console.error("Error fetching courses:", error);
        }
      }
    };

    fetchCourses();
  }, [navigate]);

  const handleCourseChange = (courseId: string) => {
    const course = courses.find(c => c.id.toString() === courseId);
    if (course) {
      setSelectedCourse(course);
      setSelectedProject(null);
      fetchProjects(course.id);
    }
  };

  const fetchProjects = async (courseId: number) => {
    const authStorage = AuthStorage.getInstance();
    const userEmail = authStorage.getEmail();
    if (userEmail) {
      try {
        const data = await ApiClient.getInstance().get<{
          enrolledProjects: Array<{ projectName: string }>;
          availableProjects: Array<{ projectName: string }>;
        }>("/course/courseProjects", { courseId, userEmail });

        setEnrolledProjects(data.enrolledProjects.map((project) => project.projectName));
        setAvailableProjects(data.availableProjects.map((project) => project.projectName));

        for (const project of data.enrolledProjects) {
          try {
            const roleData = await ApiClient.getInstance().get<{ role: string }>(
              "/courseProject/user/role",
              { projectName: encodeURIComponent(project.projectName), email: encodeURIComponent(userEmail) }
            );
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
    const authStorage = AuthStorage.getInstance();
    const userEmail = authStorage.getEmail();

    if (!projectName) {
      console.error("Selected project is missing");
      return;
    } else if (!userEmail) {
      console.error("User email is missing");
      return;
    }

    try {
      const data = await ApiClient.getInstance().get<{ url: string }>(
        "/user/project/url",
        { userEmail: encodeURIComponent(userEmail), projectName: encodeURIComponent(projectName) }
      );

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
    const authStorage = AuthStorage.getInstance();
    const userEmail = authStorage.getEmail();
    if (userEmail && selectedProject) {
      try {
        const data = await ApiClient.getInstance().post<{ message: string }>(
          "/user/project/url",
          { userEmail, URL: newURL, projectName: selectedProject }
        );
        setMessage(data.message || "URL changed successfully");
        setURL(newURL);
        setNewURL("");
      } catch (error: unknown) {
        if (error instanceof Error) {
          setMessage(error.message);
        } else {
          setMessage("An unexpected error occurred");
        }
      }
    } else {
      setMessage("User email or selected project is missing");
    }
  };
  const handleJoin = async (projectName: string, role: string) => {
    if (!user) {
      setMessage("User data not available. Please log in again.");
      return;
    }

    try {
      const data = await ApiClient.getInstance().post<{ message: string }>(
        "/user/project",
        { projectName, memberName: user.name, memberRole: role, memberEmail: user.email }
      );

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

    try {
      const data = await ApiClient.getInstance().delete<{ message: string }>(
        `/user/project?projectName=${projectName}&memberEmail=${user.email}`
      );

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
    if (!selectedCourse?.id) {
      setMessage("No course selected");
      return;
    }

    try {
      const data = await ApiClient.getInstance().post<{ message: string }>(
        "/courseProject",
        { courseId: selectedCourse.id, projectName }
      );

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
      <div className="ProjectConfigContainer">
        <div className="margintop">
          <h2>Enrolled Courses</h2>
          <Select onValueChange={handleCourseChange}>
            <SelectTrigger className="SelectTriggerProject">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent className="SelectCourse">
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.courseName}
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
                          <Dialog onOpenChange={(open) => {
                            if (open) {
                              handleProjectChange(project);
                            } else {
                              setMessage("");
                              setNewURL("");
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                className="editButton"
                                type="button"
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
                              <div className="mb-4 space-y-3">
                                <div className="break-words text-sm text-gray-700">
                                  <span className="font-semibold">Current URL: </span>
                                  {url ? <span className="break-all">{url}</span> : <span className="italic">No URL currently set</span>}
                                </div>
                                <input
                                  type="text"
                                  className="w-full rounded border border-gray-300 p-2"
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
