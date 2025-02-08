import { Database } from "sqlite";
import { Response, Request } from "express";
import { User } from "./Models/User";
import { CourseProject } from "./Models/CourseProject";
import { CourseSchedule, DeliveryDate } from "./Models/CourseSchedule";
import { Course } from "./Models/Course";
import assert from "assert";

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


    public async getUser(id: string, db: Database): Promise<User | null> {
        const userRow = await db.get('SELECT * FROM users WHERE id = ?', [id]);
        if (!userRow) {
            return null;
        }
        return new User(userRow.name); // fill user object with data from row, e.g. userRow.id;
    }

    public async getUserByMail(email: string, db: Database): Promise<User | null> {
        const userRow = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!userRow) {
            return null;
        }
        return new User(userRow.name); // fill user object with data from row, e.g. userRow.id;
    }

    public async getCourseProject(id: string, db: Database): Promise<CourseProject | null> {
        const projectRow = await db.get('SELECT * FROM project WHERE id = ?', [id]);
        if (!projectRow) {
            return null;
        }
        return new CourseProject(); // fill project object with data from row, e.g. projectRow.id;
    }

    public async getCourseSchedule(id: number, db: Database): Promise<CourseSchedule | null> {
        interface ScheduleRow {
            id: number;
            startDate: number;
            endDate: number;
        }

        interface DeliveryRow {
            id: number;
            scheduleId: number;
            deliveryDate: number;
        }

        const scheduleRow: ScheduleRow | undefined = await db.get('SELECT * FROM schedules WHERE id = ?', [id]);
        if (!scheduleRow) {
            return null;
        }
        const dates: DeliveryRow[] = await db.all('SELECT * FROM deliveries WHERE scheduleId = ? ORDER BY deliveryDate ASC', [id]);

        return new CourseSchedule(
            id,
            new Date(scheduleRow.startDate * 1000),
            new Date(scheduleRow.endDate * 1000),
            dates.map(date => new DeliveryDate(date.id, new Date(date.deliveryDate * 1000)))
        );
    }

    public async saveCourseSchedule(schedule: CourseSchedule, db: Database): Promise<void> {
        if (schedule.getId()) {
            await updateSchedule(schedule, db);
        } else {
            await insertSchedule(schedule, db);
        }
        
        const scheduleId = schedule.getId();
        if (!scheduleId) {
            throw new Error("Failed to persist CourseSchedule");
        }

        for (const deliveryDate of schedule.getDeliveryDates()) {
            if (deliveryDate.getId()) {
                await updateDeliveryDate(deliveryDate, db);
            } else {
                await insertDeliveryDate(deliveryDate, scheduleId, db);
            }
        }
    }

    public async getCourse(id: string, db: Database): Promise<Course | null> {
        const courseRow = await db.get('SELECT * FROM projectGroup WHERE id = ?', [id]);
        if (!courseRow) {
            return null;
        }
        return new Course(); // fill course object with data from row, e.g. courseRow.id;
    }

    
}


async function updateDeliveryDate(deliveryDate: DeliveryDate, db: Database): Promise<void> {
    assert(deliveryDate.getId())

    await db.run(
        'UPDATE deliveries SET deliveryDate = ? WHERE id = ?',
        [deliveryDate.getDeliveryDate().getTime() / 1000, deliveryDate.getId()]
    )
}

async function insertDeliveryDate(deliveryDate: DeliveryDate, scheduleId: number, db: Database): Promise<void> {
    assert(!deliveryDate.getId())

    const rowId = await db.run(
        'INSERT INTO deliveries (scheduleId, deliveryDate) VALUES (?, ?)',
        [scheduleId, deliveryDate.getDeliveryDate().getTime() / 1000]
    ).then((res) => res.lastID);

    if (rowId == null) {
        throw new Error("Failed to persist DeliveryDate");
    }

    deliveryDate.setId(rowId);
}

async function updateSchedule(schedule: CourseSchedule, db: Database): Promise<void> {
    assert(schedule.getId())

    await db.run(
        'UPDATE schedules SET startDate = ?, endDate = ? WHERE id = ?',
        [schedule.getStartDate().getTime() / 1000, schedule.getEndDate().getTime() / 1000, schedule.getId()]
    );
}

async function insertSchedule(schedule: CourseSchedule, db: Database): Promise<void> {
    assert(!schedule.getId())

    const rowId = await db.run(
        'INSERT INTO schedules (startDate, endDate) VALUES (?, ?)',
        [schedule.getStartDate().getTime() / 1000, schedule.getEndDate().getTime() / 1000]
    ).then((res) => res.lastID);

    if (rowId == null) {
        throw new Error("Failed to persist CourseSchedule");
    }

    schedule.setId(rowId);
}