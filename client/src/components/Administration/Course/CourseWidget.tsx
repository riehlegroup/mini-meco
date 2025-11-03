import { useState } from "react";
import { Course, Project } from "./types";
import { CourseDialog } from "./components/CourseDialog";
import { CourseForm } from "./components/CourseForm";
import { CourseAction } from "./components/CourseAction";
import { useCourse } from "@/hooks/useCourse";
import { useDialog } from "@/hooks/useDialog";
import CourseSchedule from "./components/CourseSchedule";

interface CourseProps {
  label?: string;
  action: "add" | "edit" | "delete" | "schedule";
  type?: "course" | "project" | "schedule";
  course?: Course | null;
  project?: Project | null;
  onFetch?: () => void;
}

/**
 * Container Component - A flexible UI widget for course management operations.
 *
 * Act as a container while delegating rendering to presentational components (CourseDialog, CourseAction) and
 * leverages custom hooks (useCourse, useDialog) for state and business logic dafür sind the handler.
 */
const CourseWidget: React.FC<CourseProps> = ({
  label = undefined,
  action,
  type = "course",
  course = null,
  project = null,
  onFetch,
}: CourseProps) => {
  const { message, DEFAULT, createCourse, updateCourse, addProject, updateProject, deleteProject } = useCourse();
  const [showSchedule, setShowSchedule] = useState(false);
  const {
    dialogState,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    updateDialogData,
  } = useDialog<Course | Project>(DEFAULT);

  // Handles dialog state changes based on the action type
  const handleStateDialog = () => {
    switch (action) {
      case "schedule":
        setShowSchedule((prev) => !prev);
        break;
      case "edit":
        if (type === "project" && project) {
          openEditDialog(project);
        } else if (type === "course" && course) {
          openEditDialog(course);
        } else {
          console.error("Edit action requires a course or project!");
          return;
        }
        break;
      case "add":
        openCreateDialog();
        break;
      case "delete":
        if (type === "project" && project) {
          handleDelete();
        } else if (type === "course" && course) {
          handleDelete();
        } else {
          console.error("Delete action requires a course or project!");
          return;
        }
        break;
      default:
        console.warn(`Unhandled action type: ${action}`);
    }
  };

  const handleDelete = async () => {
    if (type === "project" && project) {
      if (window.confirm(`Are you sure you want to delete project "${project.projectName}"?`)) {
        await deleteProject(project);
        onFetch?.();
      }
    } else if (type === "course" && course) {
      // Course delete functionality (not implemented yet)
      console.warn("Course delete not implemented");
    }
  };

  const handleSubmit = async () => {
    if (!dialogState.data) return;

    try {
      if (type === "project") {
        const projectData = dialogState.data as Project;

        if (dialogState.mode === "create") {
          if (!course) return;
          await addProject({
            ...projectData,
            courseId: course.id, // Ensure courseId is set
          });
          onFetch?.(); // Callback for updating table
        } else if (dialogState.mode === "edit") {
          await updateProject(projectData);
          onFetch?.();
        }
      } else {
        const courseData = dialogState.data as Course;
        if (dialogState.mode === "create") {
          await createCourse(courseData);
          onFetch?.();
        } else if (dialogState.mode === "edit") {
          await updateCourse(courseData);
          onFetch?.();
        }
      }
      closeDialog(); // Close dialog after successful submission
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  // Early condidtional rendering
  if (action === "schedule" && course) {
    return (
      <>
        <CourseAction
          label={label}
          type="schedule"
          action="schedule"
          onClick={handleStateDialog}
          dataCy="schedule-course-trigger"
        />
        {showSchedule && (
          <CourseSchedule
            course={course}
            onClose={() => setShowSchedule(false)}
          />
        )}
      </>
    );
  }

  /**
   * Main Dialog-based UI for course/project operations
   * Compound Component with CourseDialog, CourseAction and CourseForm
   */
  return (
    <CourseDialog
      isOpen={dialogState.isOpen}
      title={`${action === "edit" ? "Edit" : "Create"} ${
        type === "project" ? "Project" : "Course"
      }`}
      trigger={
        <CourseAction
          label={label}
          type={type}
          action={action}
          onClick={handleStateDialog}
          dataCy={`${action ? "edit" : "add"}-course-trigger`}
        />
      }
      onClick={handleStateDialog}
      onClose={closeDialog}
      message={message || undefined}
    >
      <CourseForm
        type={type}
        label={["Term", "Course Name", "Students Can Create Project"]}
        data={dialogState.data || undefined}
        message={message || undefined}
        onChange={updateDialogData}
        onSubmit={handleSubmit}
      />
    </CourseDialog>
  );
};
export default CourseWidget;
