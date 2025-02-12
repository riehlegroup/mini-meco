import { Database } from "sqlite";
import { Admin } from "../Models/Admin";
import { Serializable } from "../Serializer/Serializable";
import { User } from "../Models/User";
import { Writer } from "./Writer";
import { CourseProject } from "../Models/CourseProject";
import { Course } from "../Models/Course";
import { ProjectMember } from "../Models/ProjectMember";
import { ProjectParticipation } from "../Models/ProjectParticipation";

/**
 * Reader Class
 * 
 * Reads/Writes Serializable Entities to SQLite Database
 * 
 */
export class DatabaseWriter implements Writer {
    /**
     * Dictionary to be filled with attributes to be written in a single SQL call.
     */
    protected attributes: {[attributeName: string]: string | number | null} = {};
    protected toHandle: Array<Serializable> = new Array();
    protected wasHandled: Set<{tableName: string, id: number}> = new Set();
    protected db: Database;

    constructor(db: Database) {    
        this.db = db;
    }

    async writeRoot(rootObject: Serializable) {
        /** handle writing referenced objects recursively if required! */
        this.toHandle = new Array();
        this.wasHandled = new Set();
        this.toHandle.push(rootObject);

        let obj: Serializable | undefined; 
        while ((obj = this.toHandle.pop()) !== undefined) {
            // reset attributes dict
            this.attributes = {};
            // get table string based on class.
            const table = this.getTableNameFromClass(obj);
            /* Make object write its attribute values. They are gathered in attributes dictionary. */
            obj.writeTo(this);
            /* Compile SQL query from attributes */
            const assignments = Object.keys(this.attributes)
                .map(key => `${key} = :${key}`)
                .join(", ");
            /* compile parameters map from attributes */
            const params = Object.fromEntries(
                Object.entries(this.attributes).map(([key, value]) => [`:${key}`, value])
            );
            await this.db.run(
                `UPDATE ${table} SET ${assignments} WHERE id = :id`,
                params
            );

            if ('getId' in obj && typeof obj.getId === 'function') {
                this.wasHandled.add({tableName: table, id: obj.getId()})
            }   
        }

    }

    
    writeObject<T extends Serializable>(attributeName: string, objRef: T | null): void {
        //console.log("Writing "+ attributeName);
        // if object is not defined write NULL to db
        if (objRef === null) {
            this.attributes[attributeName] = "NULL";
        } else if ('getId' in objRef && typeof objRef.getId === 'function') { 
            // make sure Object has an ID and a getter.
            this.attributes[attributeName] = objRef.getId();
            if (!this.wasHandled.has({
                tableName: this.getTableNameFromClass(objRef), 
                id: objRef.getId()
            })) {
                this.toHandle.push(objRef);
                // console.log("Object "+ attributeName+ " will be handled");
            }
        } else {
            throw new Error("Serialization for Object of type " + typeof objRef + " failed!");
        }
    }

    writeString(attributeName: string, string: string | null): void {
        this.attributes[attributeName] = string;
    }

    writeNumber(attributeName: string, number: number | null): void {
        this.attributes[attributeName] = number;
    }
    
    getTableNameFromClass(s: Serializable): string {
        if (s instanceof User || s instanceof Admin) {
            return "users";
        } else if (s instanceof Course) {
            return "courses";
        } else if (s instanceof CourseProject) {
            return "projects";
        /** @todo Add further tables/Classes! */
        } else {
            throw new Error("Unknown Serializable! Probably not implemented yet!");
        }
    }
}