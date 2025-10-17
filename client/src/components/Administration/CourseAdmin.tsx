import { useState, useEffect, useMemo, useCallback } from "react";
import ReturnButton from "../common/ReturnButton";
import Table from "../common/Table";
import CourseWidget from "./Course/CourseWidget";
import { useCourse } from "@/hooks/useCourse";
import { Course, Project } from "./Course/types";

/**
 * Course Admin panel for managing courses and their projects.
 * Handles course or project fetching, and table rendering.
 */
const CourseAdmin: React.FC = () => {
  const { courses, getCourses, getCourseProjects } = useCourse();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchCourseProjects = useCallback(
    async (courses: Course[]) => {
      try {
        const projPromises = courses.map(async (course) => {
          const cp = await getCourseProjects(course);
          return cp;
        });

        // fetch projects concurrently
        const result = await Promise.all(projPromises);
        const projects = result.flat();
        setProjects(projects);
      } catch (err) {
        console.error(err);
      }
    },
    [getCourseProjects]
  );

  const fetchCourse = useCallback(async () => {
    setLoading(true);

    try {
      const course = await getCourses();
      await fetchCourseProjects(course);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getCourses, fetchCourseProjects]);

  const tableCourse = useMemo(() => {
    return courses.map((course) => [
      course.id,
      course.semester,
      course.courseName,
      <div key={course.id} className="flex">
        <CourseWidget type="project" label="add" action="add" course={course} />
        <CourseWidget
          type="schedule"
          label="schedule"
          action="schedule"
          course={course}
        />
      </div>,
    ]);
  }, [courses]);

  const tableProjects = useMemo(() => {
    return projects.map((prj) => {
      const parentCourse = courses.find((c) => c.id === prj.courseId);
      return [
        prj.id,
        prj.projectName,
        prj.courseId,
        <div key={prj.id} className="flex">
          <CourseWidget
            type="project"
            label="edit"
            action="edit"
            course={parentCourse}
            project={prj}
            onFetch={fetchCourse}
          />
          <CourseWidget
            type="project"
            label="delete"
            action="delete"
            course={parentCourse}
            project={prj}
            onFetch={fetchCourse}
          />
        </div>,
      ];
    });
  }, [projects, courses, fetchCourse]);

  useEffect(() => {
    fetchCourse();
  }, []); // fetch courses only on mount

  return (
    <div className="flex">
      <div className="flex-1">
        <ReturnButton />
        <div className="DashboardContainer">
          <h1>Manage Courses</h1>
        </div>

        {/* Course Section */}
        <div className="mt-4 flex bg-gray-500 p-3">
          <h2 className="text-start text-2xl font-bold">
            Course: {courses.length}
          </h2>
        </div>
        <div className="w-full bg-white p-3">
          <Table
            headings={["id", "semester", "name", "action"]}
            loading={isLoading}
            loadData={() => {
              fetchCourse();
            }}
            data={tableCourse}
            rowsPerPage={9}
          >
            <CourseWidget label="create" action="add" onFetch={fetchCourse} />
          </Table>
        </div>

        {/* Project Section */}
        <h2 className="mt-4 bg-gray-500 p-3 text-start text-2xl font-bold">
          Projects: {projects.length}
        </h2>
        <div className="w-full bg-white p-3">
          {projects && projects.length > 0 ? (
            <Table
              headings={["id", "projectName", "courseId", "actions"]}
              loading={isLoading}
              loadData={() => {
                fetchCourseProjects(courses);
              }}
              data={tableProjects}
              rowsPerPage={9}
            />
          ) : (
            <p className="p-4 text-gray-500">No projects found</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default CourseAdmin;
