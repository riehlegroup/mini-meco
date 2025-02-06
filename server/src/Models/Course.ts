import { CourseProject } from "./CourseProject";
export class Course {

  constructor(
    protected name: string,
    protected semester: string,
    protected projects: CourseProject[]
  ) { }

  // Getters
  public getName(): string {
    return this.name;
  }

  public getSemester(): string {
    return this.semester;
  }

  public getProjects(): CourseProject[] {
    return this.projects;
  }

  // Setters
  public setName(name: string) {
    // ToDo validate uniqueness of name
    this.name = name;
  }

  public setSemester(semester: string) {
    this.semester = semester;
  }

  public setProjects(projects: CourseProject[]) {
    this.projects = projects;
  }

  // Command methods
  public addProject(project: CourseProject) {
    this.projects = [...this.projects, project];
  }
  public removeProject(project: CourseProject) {
    this.projects = this.projects.filter(courseProject => courseProject !== project);
  }
}