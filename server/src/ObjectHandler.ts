import { Database } from "sqlite";
import { Response, Request } from "express";
import { User } from "./Models/User";
import { CourseProject } from "./Models/CourseProject";
import { CourseSchedule } from "./Models/CourseSchedule";
import { Course } from "./Models/Course";
import { DatabaseResultSetReader } from "./Serializer/DatabaseResultSetReader";
import { Serializable } from "./Serializer/Serializable";

export class ObjectHandler { 

    public async invokeOnUser(functionName: string, req: Request, res: Response, db: Database): Promise<void> {
        const userEmail = req.body.userEmail;

        const args = req.body.args || [];
        const user = await this.getUserByMail(userEmail, db);
        if (!user) {
            res.status(400).json({ message: 'User not found' });
            return;
        }

        if (!(functionName in user) || typeof user[functionName as keyof User] !== 'function') {
            res.status(400).json({ message: `Function ${functionName} not found on User` });
            return;
        }

        try {
            const result = await (user[functionName as keyof User] as Function).apply(user, args);
            res.status(200).json({ result });
        } catch (error) {
            res.status(500).json({ message: `Error invoking function ${functionName}`, error });
        }
    }

    public async invokeOnCourseProject(functionName: string, req: Request, res: Response, db: Database): Promise<void> {
        const courseProjectId = req.body.courseProjectId;

        const args = req.body.args || [];
        const courseProject = await this.getCourseProject(courseProjectId, db);
        if (!courseProject) {
            res.status(400).json({ message: 'Course Project not found' });
            return;
        }

        if (!(functionName in courseProject) || typeof courseProject[functionName as keyof CourseProject] !== 'function') {
            res.status(400).json({ message: `Function ${functionName} not found on Course Project` });
            return;
        }

        try {
            const result = await (courseProject[functionName as keyof CourseProject] as unknown as Function).apply(courseProject, args);
            res.status(200).json({ result });
        } catch (error) {
            res.status(500).json({ message: `Error invoking function ${functionName}`, error });
        }
    }

    public async invokeOnCourse(functionName: string, req: Request, res: Response, db: Database): Promise<void> {
        const courseId = req.body.courseId;

        const args = req.body.args || [];
        const course = await this.getCourse(courseId, db);
        if (!course) {
            res.status(400).json({ message: 'Course not found' });
            return;
        }

        if (!(functionName in course) || typeof course[functionName as keyof Course] !== 'function') {
            res.status(400).json({ message: `Function ${functionName} not found on Course` });
            return;
        }

        try {
            const result = await (course[functionName as keyof Course] as Function).apply(course, args);
            res.status(200).json({ result });
        } catch (error) {
            res.status(500).json({ message: `Error invoking function ${functionName}`, error });
        }
    }

    public async getUserCount(db: Database): Promise<number | undefined> {
        return (await db.get('SELECT COUNT(*) AS count FROM users')).count;
    }


    public async getUser(id: number, db: Database): Promise<User | null> {
        const userRow = await db.get('SELECT * FROM users WHERE id = ?', [id]);
        if (!userRow) {
            return null;
        }
        // Creates a User instance and fills it with attribute values.
        return (new DatabaseResultSetReader(userRow, db)).readRoot<User>(User) as Promise<User>; 
    }

    public async getUserByMail(email: string, db: Database): Promise<User | null> {
        const userRow = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!userRow) {
            return null;
        }
        // Creates a User instance and fills it with attribute values.
        return (new DatabaseResultSetReader(userRow, db)).readRoot<User>(User) as Promise<User>; 
    }

    public async getCourseProject(id: number, db: Database): Promise<CourseProject | null> {
        const projectRow = await db.get('SELECT * FROM projects WHERE id = ?', [id]);
        if (!projectRow) {
            return null;
        }
        // Creates a CourseProject instance and fills it with attribute values.
        return (new DatabaseResultSetReader(projectRow, db)).readRoot<CourseProject>(CourseProject) as Promise<CourseProject>; 
    }

    public async getCourseSchedule(id: number, db: Database): Promise<CourseSchedule | null> {
        const scheduleRow = await db.get('SELECT * FROM schedules WHERE id = ?', [id]);
        if (!scheduleRow) {
            return null;
        }
        return new CourseSchedule(); // fill schedule object with data from row, e.g. scheduleRow.id;
    }

    public async getCourse(id: number, db: Database): Promise<Course | null> {
        const courseRow = await db.get('SELECT * FROM courses WHERE id = ?', [id]);
        if (!courseRow) {
            return null;
        }
        // Creates a Course instance and fills it with attribute values.
        return (new DatabaseResultSetReader(courseRow, db)).readRoot<Course>(Course) as Promise<Course>; 
    }

    async getSerializableFromId(id: number, className: string, db: Database): Promise<Serializable | null> {
        switch (className) {
            case "User":
                return this.getUser(id, db);
            case "Course":
                return this.getCourse(id, db);
            case "CourseProject":
                return this.getCourseProject(id, db);
            default:
                return null;
        }
    }
}