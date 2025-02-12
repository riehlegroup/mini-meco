import { describe, it, expect } from "vitest";
import { initializeDB } from "../databaseInitializer";
import { Database } from "sqlite";
import { ObjectHandler } from "../ObjectHandler";
import { User } from "../Models/User";
import { DatabaseSerializableFactory } from "../Serializer/DatabaseSerializableFactory";
import { Course } from "../Models/Course";
import { DatabaseWriter } from "../Serializer/DatabaseWriter";
import { DatabaseResultSetReader } from "../Serializer/DatabaseResultSetReader";
import { CourseProject } from "../Models/CourseProject";
import { CourseManager } from "../CourseManager";
import { getProjectsForCourse } from "../projectManagement";

/** You need to delete the DB each time before running tests, unfortunately! */

describe('Basic serializer read/write test', async () => {
  const db: Database = await initializeDB();
  const oh = new ObjectHandler();
  const dbsf = new DatabaseSerializableFactory(db);
  it('Default Admin User created properly', async () => {
    const nameObj = await db.get(`SELECT name FROM users WHERE email = ?`, "sys@admin.org");
    expect(!nameObj).toBe(false);
    const name: string = nameObj.name;
    expect(name).toBe("admin");
  });

  it('Reading default Admin User', async () => {
    const u: User | null = await oh.getUser(1, db);
    expect(u !== null).toBe(true);
    expect(u?.getName()).toBe("admin");
  });

  it('Create new Course and Project', async () => {
    const c: Course = await dbsf.create("Course") as Course;
    c.setName("ADAP");
    c.setSemester("WS2425");
    (new DatabaseWriter(db)).writeRoot(c);
    const result = db.all(`SELECT * FROM courses`);
    const courses = await (new DatabaseResultSetReader(result, db)).readRoot<Course>(Course) as Course[];
    // expect(courses.length).toBe(1);
    expect(courses[0].getName()).toBe("ADAP");
    const c2 = await oh.getCourse(c.getId(), db) as Course;
    expect(c2 !== null).toBe(true);
    expect(c2.getName()).toBe(c.getName());
    const c3 = await oh.getSerializableFromId(c.getId(), "Course", db) as Course;
    expect(c3.getName()).toBe(c.getName());

    const p: CourseProject = await dbsf.create("CourseProject") as CourseProject;
    p.setCourse(c);
    p.setName("proj");
    (new DatabaseWriter(db)).writeRoot(p);
    const res = db.get(`SELECT * FROM projects WHERE projectName = "proj"`);
    let p3 = await (new DatabaseResultSetReader(res, db).readRoot<CourseProject>(CourseProject)) as CourseProject;
    console.log(JSON.stringify(p3));
    expect(p3.getName()).toBe(p.getName());
    expect(p3.getCourse() === null).toBe(false);
    expect(p3.getCourse()?.getName()).toBe(p.getCourse()?.getName());
    const p2 = await oh.getCourseProject(p.getId(), db) as CourseProject;
    expect(p2.getName()).toBe(p.getName());
    expect(p2.getCourse()?.getName()).toBe(c.getName());

    const cm: CourseManager = new CourseManager(db);
    const ps = await cm.getProjectsForCourse(c);
    expect(ps.length).toBe(1);
    expect(ps[0].getId()).toBe(1);

  });

});
