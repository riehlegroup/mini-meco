import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/esm/Button";
import { useNavigate } from "react-router-dom";
import "./ProjectAdmin.css";
import Add from "./../../assets/Add.png";
import Edit from "./../../assets/Edit.png";
import ReturnButton from "../Components/return";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

const ProjectAdmin: React.FC = () => {
  const navigate = useNavigate();

  const server = "http://localhost:3000/";

  const handleNavigation = () => {
    navigate("/project-admin");
  };

  /* Helper method for fetching all projects of a course */
  interface Project {
    id: string;
    projectName: string;
    studentsCanJoinProject: boolean;
  }

  interface Course {
    semester: string;
    courseName: string;
    projects: Project[];
    studentsCanCreateProject: boolean;
  }

  const [message, setMessage] = useState("");
  const [selectedCourseEdit, setSelectedCourseEdit] = useState<Course>({ semester: "", courseName: "", projects: [], studentsCanCreateProject: false });
  const [selectedCourse, setSelectedCourse] = useState<Course>();

  const [selectedProjectEdit, setSelectedProjectEdit] = useState<Project>({ id: "", projectName: "", studentsCanJoinProject: false });
  const [selectedProject, setSelectedProject] = useState<Project>();

  const [courses, setCourses] = useState<Course[]>([]);

  const get = (endpoint: string) => {
    return fetch(`${server}${endpoint}`)
      .then(async (response) => {
        if (response.status < 200 || response.status > 299) {
          const data = await response.json()
          throw new Error(data.message || "Unknown error occurred");

        }
        return response.json();
      })
  };

  const post = (endpoint: string, body: { [x: string]: string | boolean; }) => {
    return fetch(
      `${server}${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    )
      .then(async (response) => {
        if (response.status < 200 || response.status > 299) {
          const data = await response.json()
          throw new Error(data.message || "Unknown error occurred");

        }
        return response.json();
      })
  };

  /* Helper method for fetching all projects of a course */
  const getProjectsForCourse = (course: string): Promise<Project[]> => {
    return get(`courseProject?courseName=${course}`)
      .then(projects => projects.map((project: { id: string; projectName: string; studentsCanJoinProject: boolean; }) => ({
        id: project.id,
        projectName: project.projectName,
        studentsCanJoinProject: project?.studentsCanJoinProject || false,
      })))
      .catch((error) => {
        if (error instanceof Error) {
          console.error("Error fetching projects:", error.message);
        }
        return [];
      });
  };

  /* Fetch courses and projects on page reload */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await get("course");

        const coursesWithProjects: Course[] = await Promise.all(
          coursesData.map(async (course: { courseName: string; semester: string; studentsCanCreateProject: boolean; }) => {
            const projects = await getProjectsForCourse(course.courseName);
            return {
              semester: course.semester,
              courseName: course.courseName,
              projects: projects,
              studentsCanCreateProject: course?.studentsCanCreateProject || false,
            };
          })
        );
        setCourses(coursesWithProjects);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching data:", error.message);
        }
      }
    }

    fetchData();
  }, []);

  /* Method for creating a course */
  const handleCreateCourse = async (semester: string, courseName: string,) => {
    const body: { [key: string]: string } = { semester, courseName: courseName };

    const data = await post("course", body).catch((error) => {
      console.error("Error fetching data:", error.message);
      return error;
    });

    setMessage(data.message || "Success!");
    if (data.message.includes("successfully")) {
      window.location.reload(); // Refresh the page
    }
  };

  /* Method for creating a project */
  const handleCreateProject = async (projectName: string) => {
    if (!selectedCourse) return;

    const body: { [key: string]: string } = { semester: selectedCourse.semester, courseName: selectedCourse.courseName, projectName };

    const data = await post("courseProject", body).catch((error) => {
      console.error("Error fetching data:", error.message);
      return error;
    });

    setMessage(data.message || "Success!");
    if (data.message.includes("successfully")) {
      window.location.reload(); // Refresh the page
    }
  };

  /* Method for editing a project */
  const handleEditProject = async (projectName: string, courseName: string) => {
    if (!selectedCourse || !selectedProject) return;

    const body: { [key: string]: string } = {
      courseName: selectedCourse.courseName,
      newSemester: selectedCourse.semester, // ToDo remove
      newCourseName: courseName,
      projectName: selectedProject.projectName,
      newProjectName: projectName,
    };

    const data = await post("courseProject", body).catch((error) => {
      console.error("Error fetching data:", error.message);
      return error;
    });

    setMessage(data.message || "Success!");
    if (data.message.includes("successfully")) {
      window.location.reload(); // Refresh the page
    }
  };

  /* Method for editing a course */
  const handleEditCourse = async (editedCourse: Course) => {
    if (!selectedCourse) return;

    const body: { [key: string]: string | boolean } = {
      courseName: selectedCourse.courseName,
      newSemester: editedCourse.semester,
      newCourseName: editedCourse.courseName,
      studentsCanCreateProject: editedCourse.studentsCanCreateProject,
    };

    const data = await post("course", body).catch((error) => {
      console.error("Error fetching data:", error.message);
      return error;
    });


    setMessage(data.message || "Success!");
    if (data.message.includes("successfully")) {
      window.location.reload(); // Refresh the page
    }
  };

  const onOpenEditCourseDialog = (course: Course) => {
    setSelectedCourse(course);
    setSelectedCourseEdit(structuredClone(course));
  };

  const onOpenCreateCourseDialog = () => {
    console.log("dialog open ");
    setSelectedCourse(undefined);
    setSelectedCourseEdit({ semester: "", courseName: "", projects: [], studentsCanCreateProject: false });
  };

  const onOpenCreateProjectDialog = (course: Course) => {
    setSelectedCourse(course);
    setSelectedProjectEdit({ id: "", projectName: "", studentsCanJoinProject: false });
  };

  const onOpenEditProjectDialog = (course: Course, project: Project) => {
    setSelectedCourse(course);
    setSelectedProject(project);
    setSelectedProjectEdit(structuredClone(project));
  };

  const onOpenChangeDialog = () => {
    setMessage("");
  }

  return (
    <div onClick={handleNavigation} className="text-black">
      <ReturnButton />
      <div className="ProjAdminPanel-DashboardContainer">
        <h1>Course Admin Panel</h1>
      </div>
      <div className="ProjAdminPanel-BigContainer">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-300 text-lg text-black">
              <tr>
                <th className="px-6 py-3">Semester</th>
                <th className="px-6 py-3">Course</th>
                <th className="flex items-center justify-center px-6 py-4">
                  {/* Create course dialog */}
                  <Dialog onOpenChange={onOpenChangeDialog}>
                    <DialogTrigger className="ProjAdminPanel-DialogTrigger" onClick={() => onOpenCreateCourseDialog()} data-cy="add-project-group-button">
                      <img className="ProjAdminPanel-Add" src={Add} alt="Add" />
                    </DialogTrigger>
                    <DialogContent className="ProjAdminPanel-DialogContent">
                      <DialogHeader>
                        <DialogTitle className="ProjAdminPanel-DialogTitle">Create New Course</DialogTitle>
                      </DialogHeader>
                      <div className="flex items-center justify-between">
                        <div className="ProjAdminPanel-Sem">Semester: </div>
                        <input
                          className="ProjAdminPanel-inputBox bg-gray-50"
                          type="text"
                          value={selectedCourseEdit?.semester || ""}
                          onChange={(e) =>
                            setSelectedCourseEdit({
                              ...selectedCourseEdit,
                              semester: e.target.value
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="ProjAdminPanel-ProjGroupName">Course Name: </div>
                        <input
                          className="ProjAdminPanel-inputBox bg-gray-50"
                          type="text"
                          value={selectedCourseEdit?.courseName || ""}
                          onChange={(e) => {
                            console.log(selectedCourseEdit);
                            setSelectedCourseEdit({
                              ...selectedCourseEdit,
                              courseName: e.target.value
                            })
                          }
                          }
                        />
                      </div>
                      <div className="flex items-center space-x-3 text-black">
                        <input
                          className="mr-4 size-8 cursor-pointer appearance-none rounded border-2 border-gray-400 bg-gray-300 text-blue-600 checked:border-blue-600 checked:bg-blue-600"
                          type="checkbox"
                          checked={selectedCourseEdit?.studentsCanCreateProject || false}
                          onChange={(e) =>
                            setSelectedCourseEdit({
                              ...selectedCourseEdit,
                              studentsCanCreateProject: e.target.checked
                            })
                          }
                        />
                        <label className="text-lg font-medium">Students can create their own project</label>
                      </div>
                      <DialogFooter>
                        <Button className="ProjAdminPanel-create" onClick={() => handleCreateCourse(selectedCourseEdit.semester, selectedCourseEdit.courseName)}>
                          Create
                        </Button>
                      </DialogFooter>
                      {message && <div className="ProjAdminPanel-message">{message}</div>}
                    </DialogContent>
                  </Dialog>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Iterate over all courses and add them to the table */}
              {courses.map((course, i) => (
                <React.Fragment key={i}>
                  <tr className="bg-gray-100 text-black">
                    <td className="px-6 py-4 text-lg">{course.semester}</td>
                    <td className="px-6 py-4 text-lg">{course.courseName}</td>
                    <td className="flex items-center justify-center px-6 py-4">
                      <div>
                        {/* Edit course dialog */}
                        <Dialog onOpenChange={onOpenChangeDialog}>
                          <DialogTrigger className="ProjAdminPanel-DialogTrigger" onClick={() => onOpenEditCourseDialog(course)} data-cy="add-project-group-button">
                            <img className="ProjAdminPanel-Edit" src={Edit} alt="Edit" />
                          </DialogTrigger>
                          <DialogContent className="ProjAdminPanel-DialogContent">
                            <DialogHeader>
                              <DialogTitle className="ProjAdminPanel-DialogTitle">Edit Course</DialogTitle>
                            </DialogHeader>
                            <div className="flex items-center justify-between">
                              <div className="ProjAdminPanel-Sem">Semester: </div>
                              <input
                                className="ProjAdminPanel-inputBox bg-gray-50"
                                type="text"
                                value={selectedCourseEdit?.semester || ""}
                                onChange={(e) =>
                                  setSelectedCourseEdit({
                                    ...selectedCourseEdit,
                                    semester: e.target.value
                                  })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="ProjAdminPanel-ProjGroupName">Course Name: </div>
                              <input
                                className="ProjAdminPanel-inputBox bg-gray-50"
                                type="text"
                                value={selectedCourseEdit?.courseName || ""}
                                onChange={(e) => {
                                  console.log(selectedCourseEdit);
                                  setSelectedCourseEdit({
                                    ...selectedCourseEdit,
                                    courseName: e.target.value
                                  })
                                }
                                }
                              />
                            </div>
                            <div className="flex items-center space-x-3 text-black">
                              <input
                                className="mr-4 size-8 cursor-pointer appearance-none rounded border-2 border-gray-400 bg-gray-300 text-blue-600 checked:border-blue-600 checked:bg-blue-600"
                                type="checkbox"
                                checked={selectedCourseEdit?.studentsCanCreateProject || false}
                                onChange={(e) =>
                                  setSelectedCourseEdit({
                                    ...selectedCourseEdit,
                                    studentsCanCreateProject: e.target.checked
                                  })
                                }
                              />
                              <div className="text-lg font-medium">Students can create their own project</div>
                            </div>
                            <DialogFooter>
                              <Button className="ProjAdminPanel-create" onClick={() => handleEditCourse(selectedCourseEdit)}>
                                Save
                              </Button>
                            </DialogFooter>
                            {message && <div className="ProjAdminPanel-message">{message}</div>}
                          </DialogContent>
                        </Dialog>

                        {/* Add Project dialog */}
                        <Dialog onOpenChange={onOpenChangeDialog}>
                          <DialogTrigger className="ProjAdminPanel-DialogTrigger" onClick={() => onOpenCreateProjectDialog(course)} data-cy="add-project-group-button">
                            <img className="ProjAdminPanel-Add" src={Add} alt="Add" />
                          </DialogTrigger>
                          <DialogContent className="ProjAdminPanel-DialogContent">
                            <DialogHeader>
                              <DialogTitle className="ProjAdminPanel-DialogTitle">Add Project</DialogTitle>
                            </DialogHeader>
                            <div className="flex items-center justify-between">
                              <div className="ProjAdminPanel-Sem">Project Name: </div>
                              <input
                                className="ProjAdminPanel-inputBox bg-gray-50"
                                type="text"
                                value={selectedProjectEdit?.projectName || ""}
                                onChange={(e) =>
                                  setSelectedProjectEdit({
                                    ...selectedProjectEdit,
                                    projectName: e.target.value
                                  })
                                }
                              />
                            </div>
                            <div className="flex items-center space-x-3 text-black">
                              <input
                                className="mr-4 size-8 cursor-pointer appearance-none rounded border-2 border-gray-400 bg-gray-300 text-blue-600 checked:border-blue-600 checked:bg-blue-600"
                                type="checkbox"
                                checked={selectedProjectEdit?.studentsCanJoinProject || false}
                                onChange={(e) =>
                                  setSelectedProjectEdit({
                                    ...selectedProjectEdit,
                                    studentsCanJoinProject: e.target.checked
                                  })
                                }
                              />
                              <label className="text-lg font-medium">Students can join this project</label>
                            </div>
                            <DialogFooter>
                              <Button className="ProjAdminPanel-create" onClick={() => handleCreateProject(selectedProjectEdit.projectName)}>
                                Create
                              </Button>
                            </DialogFooter>
                            {message && <div className="ProjAdminPanel-message">{message}</div>}
                          </DialogContent>
                        </Dialog>
                      </div>

                    </td>
                  </tr>

                  {/* Display projects for a course */}
                  {course.projects.length > 0 && (
                    <tr className="">
                      <td colSpan={3} className="pl-16">
                        <div className="bg-stone-200 pl-10">
                          <ul className="m-0 flex list-none gap-5 py-3 pl-6 text-black">
                            {/* Iterate over all projects of a course and add them to the row below the course */}
                            {course.projects.map((project, i) => (
                              <React.Fragment key={i}>

                                <li key={project.id} className="flex items-center space-x-2">
                                  <span className="text-base">{project.projectName}</span>

                                  {/* Edit Project dialog */}
                                  <Dialog onOpenChange={onOpenChangeDialog}>
                                    <DialogTrigger className="ProjAdminPanel-DialogTrigger" onClick={() => onOpenEditProjectDialog(course, project)} data-cy="add-project-group-button">
                                      <img className="ProjAdminPanel-SmallEdit" src={Edit} alt="Edit" />
                                    </DialogTrigger>
                                    <DialogContent className="ProjAdminPanel-DialogContent">
                                      <DialogHeader>
                                        <DialogTitle className="ProjAdminPanel-DialogTitle">Edit Project</DialogTitle>
                                      </DialogHeader>
                                      <div className="flex items-center justify-between">
                                        <div className="ProjAdminPanel-Sem">Project Name: </div>
                                        <input
                                          className="ProjAdminPanel-inputBox bg-gray-50"
                                          type="text"
                                          value={selectedProjectEdit?.projectName || ""}
                                          onChange={(e) =>
                                            setSelectedProjectEdit({
                                              ...selectedProjectEdit,
                                              projectName: e.target.value
                                            })
                                          }
                                        />
                                      </div>
                                      <div className="flex items-center space-x-3 text-black">
                                        <input
                                          className="mr-4 size-8 cursor-pointer appearance-none rounded border-2 border-gray-400 bg-gray-300 text-blue-600 checked:border-blue-600 checked:bg-blue-600"
                                          type="checkbox"
                                          checked={selectedProjectEdit?.studentsCanJoinProject || false}
                                          onChange={(e) =>
                                            setSelectedProjectEdit({
                                              ...selectedProjectEdit,
                                              studentsCanJoinProject: e.target.checked
                                            })
                                          }
                                        />
                                        <label className="text-lg font-medium">Students can join this project</label>
                                      </div>
                                      <DialogFooter>
                                        <Button className="ProjAdminPanel-create" onClick={() => handleEditProject(selectedProjectEdit.projectName, course.courseName)}>
                                          Save
                                        </Button>
                                      </DialogFooter>
                                      {message && <div className="ProjAdminPanel-message">{message}</div>}
                                    </DialogContent>
                                  </Dialog>
                                </li>
                              </React.Fragment>

                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
};
export default ProjectAdmin;
