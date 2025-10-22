import { Course, Project } from "./types";
import ApiClient from "@/services/api/client";

const courseApi = {
  getCourses: async (): Promise<Course[]> => {
    try {
      const response = await ApiClient.getInstance().get<{
        success: boolean;
        data: Course[];
      }>("/course");

      if (!response || !response.success || !Array.isArray(response.data)) {
        console.error("Unexpected response format: ", response);
        return [];
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching course projects: ", error);
      return [];
    }
  },

  getCourseProjects: async (courseId: number): Promise<Project[]> => {
    try {
      const response = await ApiClient.getInstance().get<{
        success: boolean;
        data: Project[];
      }>(
        "/course/courseProjects",
        { courseId }
      );

      if (!response || !response.success || !Array.isArray(response.data)) {
        console.error("Unexpected response format: ", response);
        return [];
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching course projects: ", error);
      return [];
    }
  },

  createCourse: (body: {
    semester: string;
    courseName: string;
    studentsCanCreateProject: boolean;
  }): Promise<Response> => {
    console.log("[courseAPI] create: ", body);
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

  addProject: (body: {
    projectName: string;
    courseId: number;
    studentsCanJoinProject: boolean;
  }): Promise<Response> => {
    return ApiClient.getInstance().post<Response>("/courseProject", body);
  },

  updateProject: (
    projectId: number,
    body: {
      projectName: string;
      courseId?: number;
    }
  ): Promise<Response> => {
    return ApiClient.getInstance().put<Response>(
      `/courseProject/${projectId}`,
      body
    );
  },

  deleteProject: (projectId: number): Promise<Response> => {
    return ApiClient.getInstance().delete<Response>(
      `/courseProject/${projectId}`
    );
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

  getSchedule: async (courseId: number): Promise<{
    id: number;
    startDate: string;
    endDate: string;
    submissionDates: string[];
  } | null> => {
    try {
      const response = await ApiClient.getInstance().get<{
        success: boolean;
        data: {
          id: number;
          startDate: string;
          endDate: string;
          submissionDates: string[];
        };
      }>(`course/${courseId}/schedule`);

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
export default courseApi;
