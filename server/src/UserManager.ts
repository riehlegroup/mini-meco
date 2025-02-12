import { Database } from "sqlite";
import { ObjectHandler } from "./ObjectHandler";
import { DatabaseSerializableFactory } from "./Serializer/DatabaseSerializableFactory";
import { User } from "./Models/User";

export class UserManager {
    protected db: Database;
    protected oh: ObjectHandler;

    constructor (db: Database) {
        this.db = db;
        this.oh = new ObjectHandler();
    }

    public async createUser (): Promise<User> {
        const dbsf = new DatabaseSerializableFactory(this.db);
        const proj = await dbsf.create("User") as User;
        return proj;
    }
}