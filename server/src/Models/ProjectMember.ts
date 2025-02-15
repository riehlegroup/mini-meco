import { User } from "./User";


export class ProjectMember {
    constructor(
        protected readonly user: User,
        protected readonly role: string | null = null,
        protected readonly userProjectUrl: string | null = null,
    ) { }

    public getUser(): User {
        return this.user;
    }

    public getRole(): string | null {
        return this.role;
    }

    public getUrl(): string | null {
        return this.userProjectUrl;
    }

}
