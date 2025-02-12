import { Serializable } from "../Serializer/Serializable";
import { SerializableFactory } from "../Serializer/SerializableFactory";
import { Database } from "sqlite";
import { User } from "../Models/User";
import { DatabaseWriter } from "./DatabaseWriter";
import { CourseProject } from "../Models/CourseProject";
import { Course } from "../Models/Course";

/**
 * Factory for creating Serializables in a way specific to the sqlite database.
 */
export class DatabaseSerializableFactory implements SerializableFactory {
    protected db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    async create(className: string): Promise<Serializable> {
        /** @todo extend for all classes. */
        if (className === "User") {
            return await this.createEntityIn(User, "users");
        } else if (className === "CourseProject") {
            return await this.createEntityIn(CourseProject, "projects");
        } else if (className === "Course") {
            return await this.createEntityIn(Course, "courses");
        } else {
            throw new Error("Serializable Creation Failed: Unknown class name: " + className);
        }
    }
    
    /** 
     * Creates a new Serializable entity and its corresponding database entity.
     * Will overwrite the Databases Default Values with any defaults from 
     * entitys class and its constructor!
     * @param EntityClass Class/constructor for the entity (e.g. User).
     * @param tableName Name of the Table to add the entity to.
     */
    protected async createEntityIn<T extends User | CourseProject | Course>(
        EntityClass: new (id: number) => T, tableName: string
    ): Promise<T> {
        // Create new entity row 
        const runResult = await this.db.run(`INSERT INTO ${tableName} DEFAULT VALUES`);
        if (!runResult || runResult.lastID === undefined) {  
            throw new Error("Serializable Creation Failed: Failed to create db entry for new entity!");
        }
 
        const e = new EntityClass(runResult.lastID);
        e.writeTo(new DatabaseWriter(this.db));
        return e;
    }


    /** 
     * Creates a new User object and its corresponding database entity.
     * Will overwrite the Databases Default Values with any defaults from 
     * User class and its constructor!
     */
    /* protected async createUser(): Promise<User> {
        // Create new user row 
        const runResult = await this.db.run('INSERT INTO users DEFAULT VALUES');
        if (!runResult || runResult.lastID === undefined) {  
            throw new Error("Serializable Creation Failed: Failed to create db entry for new user!");
        } else {
            let u = new User(runResult.lastID);
            u.writeTo(new DatabaseWriter(this.db));
            return u;
        }
    } */

    /** 
     * Creates a new CourseProject object and its corresponding database entity.
     * Will overwrite the Databases Default Values with any defaults from 
     * CourseProject class and its constructor!
     */
    /* protected async createCourseProject(): Promise<CourseProject> {
        // Create new user row 
        const runResult = await this.db.run('INSERT INTO projects DEFAULT VALUES');
        if (!runResult || runResult.lastID === undefined) {  
            throw new Error("Serializable Creation Failed: Failed to create db entry for new project!");
        } else {
            let u = new CourseProject(runResult.lastID);
            u.writeTo(new DatabaseWriter(this.db));
            return u;
        }
    } */



}