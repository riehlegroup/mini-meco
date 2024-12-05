import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/esm/Button";
import { useNavigate } from "react-router-dom";
import "./ProjectAdmin.css";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Add from "./../../assets/Add.png";
import Edit from "./../../assets/Edit.png";
import ReturnButton from "../Components/return";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const ProjectAdmin: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/project-admin");
  };

  const [semester, setSemester] = useState("");
  const [projectGroupName, setProjectGroupName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [message, setMessage] = useState("");
  const [action, setAction] = useState("");

  const [semesters, setSemesters] = useState<string[]>([]);
  const [projectGroups, setProjectGroups] = useState<string[]>([]);
  const [projects, setProjects] = useState<
    { id: number; projectName: string; projectGroupName: string }[]
  >([]);
  const [selectedProjectGroup, setSelectedProjectGroup] = useState<string>("");

  const [newSemester, setNewSemester] = useState("");
  const [newProjectGroupName, setNewProjectGroupName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [selectToEditProjectGroup, setSelectToEditProjectGroup] = useState("");
  const [selectToEditProject, setSelectToEditProject] = useState<
    { id: number; projectName: string; projectGroupName: string } | string
  >("");

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await fetch("http://localhost:3000/semesters");
        const data = await response.json();
        setSemesters(data.map((item: any) => item.semester));
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    };

    const fetchProjectGroups = async () => {
      if (semester) {
        try {
          const response = await fetch(
            `http://localhost:3000/project-groups?semester=${semester}`
          );
          const data = await response.json();
          setProjectGroups(data.map((item: any) => item.projectGroupName));
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(error.message);
          }
        }
      } else {
        setProjectGroups([]);
      }
    };

    fetchSemesters();
    fetchProjectGroups();
  }, [semester]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (selectedProjectGroup) {
        try {
          const response = await fetch(
            `http://localhost:3000/projects?projectGroupName=${selectedProjectGroup}`
          );
          const data = await response.json();
          const mappedProjects = data.map((item: any) => ({
            id: item.id,
            projectName: item.projectName,
            projectGroupName: item.projectGroupName || selectedProjectGroup, // Fallback to selectedProjectGroup if undefined
          }));
          setProjects(mappedProjects);
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(error.message);
          }
        }
      } else {
        setProjects([]);
      }
    };

    fetchProjects();
  }, [selectedProjectGroup]);

  const handleCreate = async () => {
    const endpoint =
      action === "CreateProjectGroup"
        ? "/createProjectGroup"
        : "/createProject";
    const body: { [key: string]: string } = { semester, projectGroupName };

    if (action === "CreateProject") {
      body.projectName = projectName;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/project-admin${endpoint}`,
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

      setMessage(data.message || "Success!");
      if (data.message.includes("successfully")) {
        window.location.reload(); // Refresh the page
      }

      console.log(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred");
      }
    }
  };

  const filteredProjects = projects.filter(
    (project) => project.projectGroupName === selectedProjectGroup
  );

  const HandleEdit = async () => {
    const endpoint =
      action === "EditProjectGroup" ? "/editProjectGroup" : "/editProject";
    const body: { [key: string]: string } = {
      projectGroupName: selectToEditProjectGroup,
      newSemester,
      newProjectGroupName,
    };
    if (action === "EditProject") {
      if (typeof selectToEditProject === "string") {
        body.projectName = selectToEditProject;
      } else {
        body.projectName = selectToEditProject.projectName;
      }
      body.newProjectName = newProjectName;
      body.newProjectGroupName = newProjectGroupName;
    }
    try {
      const response = await fetch(
        `http://localhost:3000/project-admin${endpoint}`,
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

      setMessage(data.message || "Success!");
      if (data.message.includes("successfully")) {
        window.location.reload(); // Refresh the page
      }

      console.log(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error occurred:", error);
        setMessage("An error occurred: " + error.message);
      } else {
        setMessage("An unexpected error occurred");
      }
    }
  };

  return (
    <div onClick={handleNavigation}>
      <ReturnButton />
      <div className="DashboardContainer">
        <h1>Project Admin</h1>
      </div>
      <div className="BigContainer">
        <div className="ProjectGroupContainer">
          <div className="title">
            <h3>Project Group Lists</h3>
            <div className="Add">
              <Dialog>
                <DialogTrigger className="DialogTrigger" data-cy="add-project-group-button">
                  <img src={Add} alt="Add" />
                </DialogTrigger>
                <DialogContent className="DialogContent">
                  <DialogHeader>
                    <DialogTitle className="DialogTitle">
                      Create New Project Group
                    </DialogTitle>
                  </DialogHeader>
                  <div className="ProjAdmin-input">
                    <div className="Sem">Semester: </div>
                    <input
                      className="ProjAdmin-inputBox"
                      type="text"
                      placeholder="Please follow this format: SS24 / WS2425"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                    />
                  </div>
                  <div className="ProjAdmin-input">
                    <div className="ProjGroupName">Project Group Name: </div>
                    <input
                      className="ProjAdmin-inputBox2"
                      type="text"
                      placeholder="Please Enter Project Group Name"
                      value={projectGroupName}
                      onChange={(e) => setProjectGroupName(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      className="create"
                      type="submit"
                      onClick={() => {
                        setAction("CreateProjectGroup");
                        handleCreate();
                      }}
                    >
                      Create
                    </Button>
                  </DialogFooter>
                  {message && <div className="message">{message}</div>}
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="SelectWrapper">
            <Select
              onValueChange={(value) => {
                setSemester(value);
              }}
            >
              <SelectTrigger className="SelectTrigger">
                <SelectValue
                  className="SelectValue"
                  placeholder="Select Semester"
                />
              </SelectTrigger>
              <SelectContent className="SelectContent">
                {semesters.map((sem) => (
                  <SelectItem key={sem} value={sem}>
                    {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Only show project groups when a semester is selected */}
          {semester &&
            projectGroups.length > 0 &&
            projectGroups.map((group, index) => (
              <React.Fragment key={group}>
                <div className="ProjectItem">
                  <div className="ProjectName">{group}</div>

                  <Dialog>
                    <DialogTrigger
                      className="DialogTrigger"
                      onClick={() => setSelectToEditProjectGroup(group)}
                    >
                      <img className="Edit" src={Edit} alt="Edit" />
                    </DialogTrigger>
                    <DialogContent className="DialogContent">
                      <DialogHeader>
                        <DialogTitle className="DialogTitle">
                          Edit Project Group
                        </DialogTitle>
                      </DialogHeader>
                      <div className="newProjAdmin-input">
                        <div className="newSem">New Semester: </div>
                        <input
                          className="newProjAdmin-inputBox"
                          type="text"
                          placeholder="Please follow this format: SS24 / WS2425"
                          value={newSemester}
                          onChange={(e) => setNewSemester(e.target.value)}
                        />
                      </div>
                      <div className="newProjAdmin-input">
                        <div className="newProjGroupName">New Name: </div>
                        <input
                          className="newProjAdmin-inputBox2"
                          type="text"
                          placeholder="Please Enter New Project Group Name"
                          value={newProjectGroupName}
                          onChange={(e) =>
                            setNewProjectGroupName(e.target.value)
                          }
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          className="create"
                          type="submit"
                          onClick={() => {
                            setAction("EditProjectGroup");
                            HandleEdit();
                          }}
                        >
                          Confirm
                        </Button>
                      </DialogFooter>
                      {message && <div className="message">{message}</div>}
                    </DialogContent>
                  </Dialog>
                </div>
                {index < projectGroups.length - 1 && (
                  <hr className="ProjectDivider" />
                )}
              </React.Fragment>
            ))}
        </div>
        <div className="ProjectContainer">
          <div className="ProjectTitle">
            <h3>Project Lists</h3>
            <div className="Add">
              <Dialog>
                <DialogTrigger className="DialogTrigger" data-cy="add-project-button">
                  <img src={Add} alt="Add" />
                </DialogTrigger>
                <DialogContent className="DialogContent">
                  <DialogHeader>
                    <DialogTitle className="DialogTitle">
                      Create New Project
                    </DialogTitle>
                  </DialogHeader>
                  <div className="ProjAdmin-input">
                    <div className="ProjGroup">Project Group: </div>
                    <input
                      className="ProjAdmin-inputBox3"
                      type="text"
                      placeholder="Please Enter Project Group Name"
                      value={projectGroupName}
                      onChange={(e) => setProjectGroupName(e.target.value)}
                    />
                  </div>
                  <div className="ProjAdmin-input">
                    <div className="ProjGroupName">Project Name: </div>
                    <input
                      className="ProjAdmin-inputBox4"
                      type="text"
                      placeholder="Please Enter Project Name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      className="create"
                      type="submit"
                      onClick={() => {
                        setAction("CreateProject");
                        handleCreate();
                      }}
                    >
                      Create
                    </Button>
                  </DialogFooter>
                  {message && <div className="message">{message}</div>}
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="SelectWrapper">
            <Select
              onValueChange={(value) => {
                setSelectedProjectGroup(value);
              }}
            >
              <SelectTrigger className="SelectTrigger">
                <SelectValue
                  className="SelectValue"
                  placeholder="Select Project Group"
                />
              </SelectTrigger>
              <SelectContent className="SelectContent">
                {projectGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {filteredProjects.map((project) => (
            <>
              <div key={project.id} className="ProjectItem">
                <div className="ProjectName">{project.projectName}</div>

                <Dialog>
                  <DialogTrigger
                    className="DialogTrigger"
                    onClick={() => setSelectToEditProject(project)}
                  >
                    <img className="Edit" src={Edit} alt="Edit" />
                  </DialogTrigger>
                  <DialogContent className="DialogContent">
                    <DialogHeader>
                      <DialogTitle className="DialogTitle">
                        Edit Project
                      </DialogTitle>
                    </DialogHeader>
                    <div className="newProjAdmin-input">
                      <div className="newSem">New Project Group: </div>
                      <input
                        className="newProjAdmin-inputBox3"
                        type="text"
                        placeholder="Please Enter New Project Group Name"
                        value={newProjectGroupName}
                        onChange={(e) => setNewProjectGroupName(e.target.value)}
                      />
                    </div>
                    <div className="newProjAdmin-input">
                      <div className="newProjGroupName">New Name: </div>
                      <input
                        className="newProjAdmin-inputBox4"
                        type="text"
                        placeholder="Please Enter New Project Name"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        className="create"
                        type="submit"
                        onClick={() => {
                          setAction("EditProject");
                          HandleEdit();
                        }}
                      >
                        Confirm
                      </Button>
                    </DialogFooter>
                    {message && <div className="message">{message}</div>}
                  </DialogContent>
                </Dialog>
              </div>
              <hr className="ProjectDivider" />
            </>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ProjectAdmin;
