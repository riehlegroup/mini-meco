import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { hashPassword } from './hash';
import { ObjectHandler } from './ObjectHandler';
import { DatabaseSerializableFactory } from './Serializer/DatabaseSerializableFactory';
import { User } from './Models/User';
import { DatabaseWriter } from './Serializer/DatabaseWriter';
import { Email } from './email';

const DEFAULT_USER = {
  name: "admin",
  email: "sys@admin.org",
  password: "helloworld"
};

export async function initializeDB() {
  const db = await open({
    filename: './myDatabase.db',
    driver: sqlite3.Database,
  });

  const oh = new ObjectHandler();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      githubUsername TEXT,
      email TEXT UNIQUE,
      status TEXT DEFAULT "unconfirmed" NOT NULL,
      password TEXT,
      resetPasswordToken TEXT,
      resetPasswordExpire INTEGER,
      confirmEmailToken TEXT,
      confirmEmailExpire INTEGER,
      userRole TEXT DEFAULT "USER" NOT NULL
    )
  `);

  const userCount = await oh.getUserCount(db);
  if (!userCount || userCount === 0) {
    const { name, email, password } = DEFAULT_USER;
    const dbsf = new DatabaseSerializableFactory(db);
    const writer = new DatabaseWriter(db);
    const admin = await dbsf.create("User") as User;
    admin.setName(name);
    admin.setEmail(new Email(email));
    admin.setPassword(await hashPassword(password));
    admin.setStatus('confirmed');
    writer.writeRoot(admin);
    console.log(`Default admin user created: (email: '${email}', password: '${password}')`);
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectName TEXT UNIQUE,
      courseId INTEGER,
      FOREIGN KEY (courseId) REFERENCES courses(id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      semester TEXT,
      courseName TEXT UNIQUE
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_projects (
      userId INTEGER,
      projectId INTEGER,
      role TEXT,
      url TEXT,
      PRIMARY KEY (userId, projectId),
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (projectId) REFERENCES projects(id)
    )
    `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS sprints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      sprintName TEXT NOT NULL,
      endDate DATETIME NOT NULL,
      FOREIGN KEY (courseId) REFERENCES courses(id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS happiness (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER,
      userId INTEGER,
      happiness INTEGER,
      sprintId INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (projectId) REFERENCES projects(id)
    )
  `);

  return db;
}
