export interface Course {
  id: number;
  termId: number;
  courseName: string;
  projects: Project[];
  studentsCanCreateProject: boolean;
}

export interface Project {
  id: number;
  projectName: string;
  courseId: number;
  studentsCanJoinProject: boolean;
}
