/**
 * Project storage service for managing selected project state
 */
class ProjectStorage {
  private static instance: ProjectStorage;
  private readonly SELECTED_PROJECT_KEY = "selectedProject";

  private constructor() {}

  static getInstance(): ProjectStorage {
    if (!ProjectStorage.instance) {
      ProjectStorage.instance = new ProjectStorage();
    }
    return ProjectStorage.instance;
  }

  getSelectedProject(): string | null {
    return localStorage.getItem(this.SELECTED_PROJECT_KEY);
  }

  setSelectedProject(projectName: string): void {
    localStorage.setItem(this.SELECTED_PROJECT_KEY, projectName);
  }

  clearSelectedProject(): void {
    localStorage.removeItem(this.SELECTED_PROJECT_KEY);
  }
}

export default ProjectStorage;
