import { Email } from "../email";
import { GitHubRepoURL } from "./GitHubRepoURL";

export class CourseProject {

    public userEmail: Email = new Email("");
    public projectName: string = "";
    public gitHubRepoURL: GitHubRepoURL = new GitHubRepoURL("");

    constructor() {
        // dummy course project for set impl
    }
}