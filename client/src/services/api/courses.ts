import ApiClient from "./client";
import { Course, Project, CourseSchedule } from "@/types/models";
import { ApiResponse } from "@/types/api";

/**
 * Course API methods
 */
const coursesApi = {
  getCourses: async (): Promise<Course[]> => {
    try {
      const response = await ApiClient.getInstance().get<
        ApiResponse<Course[]>
      >("/course");

      if (!response || !response.success || !Array.isArray(response.data)) {
        console.error("Unexpected response format:", response);
        return [];
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching courses:", error);
      return [];
    }
  },

  getCourseProjects: async (courseId: number): Promise<Project[]> => {
    try {
      const response = await ApiClient.getInstance().get<
        ApiResponse<Project[]>
      >("/course/courseProjects", { courseId });

      if (!response || !response.success || !Array.isArray(response.data)) {
        console.error("Unexpected response format:", response);
        return [];
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching course projects:", error);
      return [];
    }
  },

  createCourse: (body: {
    semester: string;
    courseName: string;
    studentsCanCreateProject: boolean;
  }): Promise<Response> => {
    return ApiClient.getInstance().post<Response>("/course", body);
  },

  updateCourse: (body: {
    semester: string;
    courseName: string;
    studentsCanCreateProject: boolean;
  }): Promise<Response> => {
    return ApiClient.getInstance().post<Response>("/course", body);
  },

  deleteCourse: (id: number): Promise<Response> => {
    return ApiClient.getInstance().delete<Response>(`/course/${id}`);
  },

  saveSchedule: (
    courseId: number,
    body: {
      startDate: string;
      endDate: string;
      submissionDates: string[];
    }
  ): Promise<Response> => {
    return ApiClient.getInstance().post<Response>(
      `/course/${courseId}/schedule`,
      body
    );
  },

  getSchedule: async (courseId: number): Promise<CourseSchedule | null> => {
    try {
      const response = await ApiClient.getInstance().get<
        ApiResponse<CourseSchedule>
      >(`/course/${courseId}/schedule`);

      if (!response || !response.success) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching schedule:", error);
      return null;
    }
  },
};

export default coursesApi;
