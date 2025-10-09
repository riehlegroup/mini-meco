import { useState } from "react";
import { Course, Project } from "@/components/Administration/Course/types";
import courseApi from "@/components/Administration/Course/api";
import { Message } from "@/components/Administration/Course/components/CourseMessage";

const DEFAULT: Course = {
  id: 0,
  semester: "",
  courseName: "",
  projects: [],
  studentsCanCreateProject: false,
};

/**
 * Course hook `useCourse` manages related operations in a Course components.
 * It provides functionality to get, create, update, and delete courses, as well as
 * manage course projects. It also handles user feedback messages.
 */
export const useCourse = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState<Message | null>(null);

  const showMessage = (
    text: string,
    type: "success" | "error" | "info",
    hide = true
  ) => {
    setMessage({ text, type });
    if (hide) {
      setTimeout(() => {
        setMessage(null);
      }, 3000); // delay
    };
  };

  const getCourses = async (): Promise<Course[]> => {
    try {
      const response = await courseApi.getCourses();
      if (!response) return [];

      const validCourses = response.map((course) => ({
        id: course.id ?? 0,
        semester: course.semester ?? "",
        courseName: course.courseName ?? "",
        projects: course.projects ?? [],
        studentsCanCreateProject: course.studentsCanCreateProject ?? false,
      }));

      setCourses(validCourses);
      return validCourses;
    } catch (error) {
      console.error("Error fetching courses:", error);
      return [];
    }
  };

  const createCourse = async (course: Course) => {
    setMessage(null);

    const body = {
      semester: course.semester,
      courseName: course.courseName,
      studentsCanCreateProject: course.studentsCanCreateProject,
    };

    try {
      await courseApi.createCourse(body);
      showMessage(
        `Course: "${course.courseName}" created successfully`,
        "success"
      );
    } catch (error) {
      showMessage(
        `Fail to create Course: "${course.courseName}" for Semester: "${course.semester}, Error: ${error}"`,
        "error"
      );
    }
  };

  // This method is not implemented yet
  const updateCourse = async (course: Course) => {
    if (!course) return;
    setMessage(null);

    const body = {
      id: course.id,
      semester: course.semester,
      courseName: course.courseName,
      studentsCanCreateProject: course.studentsCanCreateProject,
    };

    try {
      await courseApi.updateCourse(body);
      showMessage(
        `Course: ${course.courseName} editing successfully`,
        "success"
      );
    } catch (error) {
      showMessage(`Course: ${course.courseName} Error: ${error}`, "error");
    }
  };

  // This method is not implemented yet
  const deleteCourse = async (course: Course) => {
    if (!course) return;
    setMessage(null);

    try {
      await courseApi.deleteCourse(course.id);
      showMessage(
        `Course: ${course.courseName} delete successfully`,
        "success"
      );
    } catch (error) {
      showMessage(`Course: ${course.courseName} Error: ${error}`, "error");
    }
  };

  const getCourseProjects = async (course: Course): Promise<Project[]> => {
    try {
      const response = await courseApi.getCourseProjects(course.id);
      if (!response) return [];

      const projects: Project[] = response.map((proj) => ({
        id: proj.id,
        projectName: proj.projectName,
        courseId: proj.courseId,
        studentsCanJoinProject: proj.studentsCanJoinProject ?? false,
      }));

      // Correctly update state without mutating existing state directly using spread operator to expand iterable elements
      setCourses((prevCourses) =>
        prevCourses.map((c) =>
          c.id === course.id
            ? { ...c, projects: [...c.projects, ...projects] }
            : c
        )
      );

      return projects;
    } catch (error) {
      throw error;
    }
  };

  const addProject = async (project: Project) => {
    setMessage(null);

    const body = {
      courseId: project.courseId,
      projectName: project.projectName,
      studentsCanJoinProject: project.studentsCanJoinProject,
    };

    try {
      await courseApi.addProject(body);
      showMessage(
        `Project: "${project.projectName}" created successfully`,
        "success"
      );
    } catch (error) {
      showMessage(
        `Fail to create Project: "${project.projectName}" for courseId: "${project.courseId}, Error: ${error}"`,
        "error"
      );
    }
  };

  const updateProject = async (project: Project) => {
    if (!project) return;
    setMessage(null);

    const body = {
      projectName: project.projectName,
      courseId: project.courseId,
    };

    try {
      await courseApi.updateProject(project.id, body);
      showMessage(
        `Project: "${project.projectName}" updated successfully`,
        "success"
      );
    } catch (error) {
      showMessage(
        `Failed to update Project: "${project.projectName}". Error: ${error}`,
        "error"
      );
    }
  };

  const deleteProject = async (project: Project) => {
    if (!project) return;
    setMessage(null);

    try {
      await courseApi.deleteProject(project.id);
      showMessage(
        `Project: "${project.projectName}" deleted successfully`,
        "success"
      );
    } catch (error) {
      showMessage(
        `Failed to delete Project: "${project.projectName}". Error: ${error}`,
        "error"
      );
    }
  };

  return {
    message,
    DEFAULT,
    courses,
    setCourses,
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseProjects,
    addProject,
    updateProject,
    deleteProject,
  };
};
