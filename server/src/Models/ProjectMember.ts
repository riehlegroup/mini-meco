import { CourseProject } from "./CourseProject";
import { User } from "./User";

export class ProjectMember {
  constructor(
    protected project: CourseProject,
    protected user: User,
    protected role: string,
    protected userProjectUrl: string
  ) { }


  // Getters
  public getProject(): CourseProject {
    return this.project;
  }

  public getUser(): User {
    return this.user;
  }

  public getRole(): string {
    return this.role;
  }

  public getUserProjectUrl(): string {
    return this.userProjectUrl;
  }

  // Setters
  public setRole(role: string) {
    this.role = role;
  }

  public setUserProjectUrl(url: string) {
    this.userProjectUrl = url;
  }
}
