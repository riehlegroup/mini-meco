import { CourseProject } from "./CourseProject";


export class ProjectParticipation {
    constructor(
        protected readonly project: CourseProject,
        protected readonly role: string | null = null,
        protected readonly userProjectUrl: string | null = null,
    ) { }
    

    public getProject(): CourseProject {
        return this.project;
    }

    public getRole(): string | null {
        return this.role;
    }

    public getUrl(): string | null {
        return this.userProjectUrl;
    }
}