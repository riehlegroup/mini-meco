import { Course, Project } from "./types";
import { API_BASE_URL } from "@/config/api";

class ApiClient {
  private static instnace: ApiClient;
  private BASE_API_URL: string = `${API_BASE_URL}/`;

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instnace) {
      ApiClient.instnace = new ApiClient();
    }
    return ApiClient.instnace;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    params?: Record<string, string | number> | undefined,
    body?: Record<string, string | number | boolean | string[]>
  ): Promise<T> {
    try {
      const url = new URL(this.BASE_API_URL + endpoint);

      // Ensure params are converted to strings and appended correctly
      if (params) {
        Object.entries(params).forEach(([key, value]) =>
          url.searchParams.append(key, String(value))
        );
      }

      const response = await fetch(url.toString(), {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HTTP Error: ${response.status} ${JSON.stringify(errorData)}`
        );
      }

      return (await response.json()) as Promise<T>;
    } catch (error) {
      console.error(`API request failed: ${method} ${endpoint}`, error);
      throw error; // Re-throw to allow caller to handle
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number>
  ): Promise<T> {
    return this.request<T>("GET", endpoint, params);
  }

  async post<T>(
    endpoint: string,
    body: Record<string, string | number | boolean | string[]>
  ): Promise<T> {
    return this.request<T>("POST", endpoint, undefined, body);
  }

  async put<T>(
    endpoint: string,
    body: Record<string, string | number | boolean | string[]>
  ): Promise<T> {
    return this.request<T>("PUT", endpoint, undefined, body);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>("DELETE", endpoint);
  }
}

const courseApi = {
  getCourses: async (): Promise<Course[]> => {
    try {
      const response = await ApiClient.getInstance().get<{
        success: boolean;
        data: Course[];
      }>("course");

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
        "course/courseProjects",
        { courseId } // This will append as a query parameter
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
    return ApiClient.getInstance().post<Response>("course", body);
  },

  updateCourse: (body: {
    semester: string;
    courseName: string;
    studentsCanCreateProject: boolean;
  }): Promise<Response> => {
    return ApiClient.getInstance().post<Response>("course", body);
  },

  deleteCourse: (id: number): Promise<Response> => {
    return ApiClient.getInstance().delete<Response>(`course/${id}`);
  },

  addProject: (body: {
    projectName: string;
    courseId: number;
    studentsCanJoinProject: boolean;
  }): Promise<Response> => {
    return ApiClient.getInstance().post<Response>("courseProject", body);
  },

  updateProject: (
    projectId: number,
    body: {
      projectName: string;
      courseId?: number;
    }
  ): Promise<Response> => {
    return ApiClient.getInstance().put<Response>(
      `courseProject/${projectId}`,
      body
    );
  },

  deleteProject: (projectId: number): Promise<Response> => {
    return ApiClient.getInstance().delete<Response>(
      `courseProject/${projectId}`
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
      `course/${courseId}/schedule`,
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
