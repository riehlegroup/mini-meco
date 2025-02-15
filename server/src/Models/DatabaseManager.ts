import { Database } from "sqlite";

export class DatabaseManager {
    static async getCourseIdFromName(db: Database, courseName: string): Promise<number> {
        const courseIdObj = await db.get(`SELECT id
            FROM courses
            WHERE courses.courseName = ?`, [courseName]);
        if (courseIdObj === undefined) {
        throw new Error("Unknown Course Name!");
        }
        const courseId = courseIdObj.id;
        return courseId;
    }

    static async getProjectIdFromName(db: Database, projectName: string): Promise<number> {
        const projectIdObj = await db.get(`SELECT id
            FROM projects
            WHERE projects.projectName = ?`, [projectName]);
        if (projectIdObj === undefined) {
        throw new Error("Unknown Course Name!");
        }
        const projectId = projectIdObj.id;
        return projectId;
    }


    static async getUserIdFromName(db: Database, userName: string): Promise<number> {
        const userIdObj = await db.get(`SELECT id
            FROM users
            WHERE users.name = ?`, [userName]);
        if (userIdObj === undefined) {
        throw new Error("Unknown Course Name!");
        }
        const userId = userIdObj.id;
        return userId;
    }

    static async getUserIdFromEmail(db: Database, userEmail: string): Promise<number> {
        const userIdObj = await db.get(`SELECT id
            FROM users
            WHERE users.email = ?`, [userEmail]);
        if (userIdObj === undefined) {
        throw new Error("Unknown Course Name!");
        }
        const userId = userIdObj.id;
        return userId;
    }
}