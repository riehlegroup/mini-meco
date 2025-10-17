import "./CourseParticipation.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Add from "./../../assets/Add.png";
import Delete from "./../../assets/Line 20.png";
import ReturnButton from "../common/ReturnButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import Button from "react-bootstrap/esm/Button";
import AuthStorage from "@/services/storage/auth";
import coursesApi from "@/services/api/courses";
import projectsApi from "@/services/api/projects";
import ApiClient from "@/services/api/client";

const CourseParticipation: React.FC = () => {
  type Project = {
    id: number; 
    projectName: string; 
    courseName: string;
  };
  
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/course-participation");
  };

  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");


  const [user, setUser] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const [courses, setCourses] = useState<string[]>([]);
  const [userProjects, setUserProjects] = useState<string[]>([]);

  const [enrolledProjects, setEnrolledProjects] = useState<Project[]>([]);
  const [selectedEnrolledCourse, setSelectedEnrolledCourse] = useState<string>("");

  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [selectedAvailableCourse, setSelectedAvailableCourse] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      const authStorage = AuthStorage.getInstance();
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
      try {
        const data = await coursesApi.getCourses();
        setCourses(data.map((item) => item.courseName));
        console.log("Fetched project groups:", data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    };

    fetchCourses();

    const fetchUserProjects = async() => {
      try {
        const authStorage = AuthStorage.getInstance();
        const userEmail = authStorage.getEmail();
        if (!userEmail) return;

        const data = await projectsApi.getUserProjects(userEmail);
        setUserProjects(data.map((item) => item.projectName));
        console.log("Fetched user projects:", data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    };

    fetchUserProjects();
  }, []);

  useEffect(() => {
    const fetchEnrolledProjects = async () => {
      if (selectedEnrolledCourse) {
        try {
          const data = await projectsApi.getProjectsByCourseName(selectedEnrolledCourse);
          const mappedProjects = data.map((item) => ({
            id: item.id,
            projectName: item.projectName,
            courseName: selectedEnrolledCourse,
          }));

          const enrolledProjects = mappedProjects.filter((item: Project) => userProjects.includes(item.projectName));

          setEnrolledProjects(enrolledProjects);
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(error.message);
          }
        }
      } else {
        setEnrolledProjects([]);
      }
    };

    fetchEnrolledProjects();
  }, [selectedEnrolledCourse, userProjects]);

  const filteredEnrolledProjects = enrolledProjects.filter(
    (project) => project.courseName === selectedEnrolledCourse
  );

  useEffect(() => {
    const fetchAvailableProjects = async () => {
      if (selectedAvailableCourse) {
        try {
          const data = await projectsApi.getProjectsByCourseName(selectedAvailableCourse);
          const mappedProjects = data.map((item) => ({
            id: item.id,
            projectName: item.projectName,
            courseName: selectedAvailableCourse,
          }));

          const availableProjectsWithoutEnrolled = mappedProjects.filter((item: Project) => !userProjects.includes(item.projectName));

          setAvailableProjects(availableProjectsWithoutEnrolled);
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(error.message);
          }
        }
      } else {
        setAvailableProjects([]);
      }
    };

    fetchAvailableProjects();
  }, [selectedAvailableCourse, userProjects]);

  const filteredAvailableProjects = availableProjects.filter(
    (project: Project) => project.courseName === selectedAvailableCourse
  );

  const handleJoin = async (projectName: string) => {
    if (!user) {
      setMessage("User data not available. Please log in again.");
      return;
    }

    try {
      const data = await ApiClient.getInstance().post<{ success: boolean; message: string }>(
        "/user/project",
        {
          projectName,
          memberName: user.name,
          memberRole: role,
          memberEmail: user.email,
        }
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
      const data = await ApiClient.getInstance().delete<{ success: boolean; message: string }>(
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

  return (
    <div onClick={handleNavigation}>
      <ReturnButton />
      <div className="DashboardContainer">
        <h1>Course Participation</h1>
      </div>
      <div className="ProjectContainer">
          <div className="ProjectTitle">
            <h3>Project Lists - Enrolled Courses</h3>
          </div>
          <div className="SelectWrapper">
            <Select
              onValueChange={(value) => {
                setSelectedEnrolledCourse(value);
              }}
            >
              <SelectTrigger className="SelectTrigger">
                <SelectValue placeholder="Select a project group" />
              </SelectTrigger>
              <SelectContent className="SelectContent">
                {courses.map((group, index) => (
                  <SelectItem key={index} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            {filteredEnrolledProjects.map((project: Project) => (
              <div key={project.id}>
                <div className="ProjectItem3">
                  <div className="ProjectName">{project.projectName}</div>
                  <div className="Imgs">
                    <Dialog>
                      <DialogTrigger className="DialogTrigger">
                        <img className="Delete" src={Delete} alt="Delete" />
                      </DialogTrigger>
                      <DialogContent className="DialogContent">
                        <DialogHeader>
                          <DialogTitle className="DialogTitle">
                            Leave Project
                          </DialogTitle>
                        </DialogHeader>
                        <div className="LeaveText">
                          Are you sure you want to leave {project.projectName} ?{" "}
                        </div>
                        <DialogFooter>
                          <Button
                            className="create"
                            variant="primary"
                            onClick={() => handleLeave(project.projectName)}
                          >
                            Confirm
                          </Button>
                        </DialogFooter>
                        {message && <div className="Message">{message}</div>}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <hr className="ProjectDivider" />
              </div>
            ))}
          </div>
        </div>

        <div className="ProjectContainer">
          <div className="ProjectTitle">
            <h3>Project Lists - Available Courses</h3>
          </div>
          <div className="SelectWrapper">
            <Select
              onValueChange={(value) => {
                setSelectedAvailableCourse(value);
              }}
            >
              <SelectTrigger className="SelectTrigger">
                <SelectValue placeholder="Select a project group" />
              </SelectTrigger>
              <SelectContent className="SelectContent">
                {courses.map((group, index) => (
                  <SelectItem key={index} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            {filteredAvailableProjects.map((project: Project) => (
              <div key={project.id}>
                <div className="ProjectItem3">
                  <div className="ProjectName">{project.projectName}</div>
                  <div className="Imgs">
                    <Dialog>
                      <DialogTrigger className="DialogTrigger">
                        <img className="Add" src={Add} alt="Add" />
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
                            onClick={() => handleJoin(project.projectName)}
                          >
                            Join
                          </Button>
                        </DialogFooter>
                        {message && <div className="Message">{message}</div>}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <hr className="ProjectDivider" />
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default CourseParticipation;
