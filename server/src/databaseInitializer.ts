import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function initializeDB() {
  const db = await open({
    filename: './myDatabase.db',
    driver: sqlite3.Database,
  });

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
      confirmEmailExpire INTEGER
    )
  `);

  const userCount = await db.get('SELECT COUNT(*) AS count FROM users');
  if (userCount.count === 0) {
    await db.run(
      `INSERT INTO users (name, email, password, status) VALUES (?, ?, ?, ?)`,
      ['admin', 'sys@admin.org', 'helloworld', 'confirmed']
    );
    console.log('Default admin user created');
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS project (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectName TEXT,
      projectGroupName TEXT
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS projectGroup (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      semester TEXT,
      projectGroupName TEXT UNIQUE
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_projects (
      userEmail TEXT,
      projectName TEXT,
      url TEXT,
      PRIMARY KEY (userEmail, projectName),
      FOREIGN KEY (userEmail) REFERENCES users(email)
    )
    `);

  await db.exec(`
CREATE TABLE IF NOT EXISTS sprints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  projectGroupName TEXT NOT NULL,
  sprintName TEXT NOT NULL,
  endDate DATETIME NOT NULL
)
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS happiness (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectGroupName TEXT,
      projectName TEXT,
      userEmail TEXT,
      happiness INTEGER,
      sprintName TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)
      `);

  return db;
}
