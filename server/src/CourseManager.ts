import { Database } from "sqlite";
import { ObjectHandler } from "./ObjectHandler";
import { DatabaseSerializableFactory } from "./Serializer/DatabaseSerializableFactory";
import { Course } from "./Models/Course";
import { CourseProject } from "./Models/CourseProject";
import { DatabaseResultSetReader } from "./Serializer/DatabaseResultSetReader";


export class CourseManager {
  protected db: Database;
  protected oh: ObjectHandler;

  constructor(db: Database) {
    this.db = db;
    this.oh = new ObjectHandler();
  }

  public async createCourse(): Promise<Course> {
    const dbsf = new DatabaseSerializableFactory(this.db);
    const proj = await dbsf.create("Course") as Course;
    return proj;
  }

  public async getProjectsForCourse(course: Course): Promise<CourseProject[]> {
    const projectRows = await this.db.all(`
            SELECT *
            FROM projects
            WHERE courseId = ?
        `, course.getId());
    let projects: CourseProject[] = [];
    for (const row of projectRows) {
      const project = await this.oh.getCourseProject(row.id, this.db);
      if (project !== null) {
        project.setCourse(course);
        projects.push(project);
      }
    }

    return projects;
  }
}
