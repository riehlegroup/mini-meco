import { Database } from "sqlite";
import { Request, Response } from "express";;
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { DatabaseManager } from "./Models/DatabaseManager";
import { Email } from './email';

import { Semester } from "./Models/Semester";

dotenv.config();

export const createCourse = async (req: Request, res: Response, db: Database) => {
  const { semester, courseName } = req.body;
  if (!semester || !courseName) {
    return res.status(400).json({ message: "Please fill in semester and course name" });
  }

  let semesterInput = semester; // Raw input from the request
  try {
    const semester = Semester.create(semesterInput); // Uses the Semester's internal validation
    await db.run("INSERT INTO courses (semester, courseName) VALUES (?, ?)", [semester.toString(), courseName]);
    res.status(201).json({ message: "Course created successfully" });
  } catch (error) {
    console.error("Error during project group creation:", error);
    res.status(500).json({ message: "Course creation failed", error });
  }
}

export const createProject = async (req: Request, res: Response, db: Database) => {
  const { courseName, projectName } = req.body;

  if (!courseName || !projectName) {
    return res.status(400).json({ message: "Please fill in project group name and project name" });
  }

  try {
    const courseId = DatabaseManager.getCourseIdFromName(db, courseName);
    const user = await db.get('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (!user) {
      return res.status(400).json({ message: 'Course Not Found' });
    }

    await db.run(`INSERT INTO project (projectName, courseId) VALUES (?, ?)`, [projectName, courseId]);

    res.status(201).json({ message: "Project created successfully" });
  } catch (error) {
    console.error("Error during project creation:", error);
    res.status(500).json({ message: "Project creation failed", error });
  }
};


export const editCourse = async (req: Request, res: Response, db: Database) => {
  const { courseName, newSemester, newCourseName } = req.body;

  if (!newSemester || !newCourseName) {
    return res.status(400).json({ message: "Please fill in semester and project group name" });
  } 

  try {
    const semester = Semester.create(newSemester); // @todo Shared ValueType method?
    const courseId = DatabaseManager.getCourseIdFromName(db, courseName);
    console.log(`Executing SQL: UPDATE courses SET semester = '${semester.toString()}', courseName = '${newCourseName}' WHERE id = '${courseId}'`);

    await db.run(
      `UPDATE courses SET semester = ?, courseName = ? WHERE id = ?`,
      [semester.toString(), newCourseName, courseId]
    );

    res.status(201).json({ message: "Course edited successfully" });
  } catch (error) {
    console.error("Error during Course edition:", error);
    res.status(500).json({ message: "Course edited failed", error });
  }
}

export const editProject = async (req: Request, res: Response, db: Database) => {
  const { newCourseName, projectName, newProjectName } = req.body;

  if (!newCourseName || !newProjectName) {
    return res.status(400).json({ message: "Please fill in project group name and project name" });
  }

  try {
    const newCourseId = DatabaseManager.getCourseIdFromName(db, newCourseName);
    const projectId = DatabaseManager.getProjectIdFromName(db, projectName);
    await db.run(
      `UPDATE projects SET projectName = ?, courseId = ? WHERE id = ?`,
      [newProjectName, newCourseId, projectId]
    );
        res.status(201).json({ message: "Project edited successfully" });
    } catch (error) {
        console.error("Error during project edition:", error);
        res.status(500).json({ message: "Project edition failed", error });
    }
};



export const getSemesters = async (req: Request, res: Response, db: Database) => {
  try {
    const semesters = await db.all("SELECT DISTINCT semester FROM courses");
    res.json(semesters);
  } catch (error) {
    console.error("Error during semester retrieval:", error);
    res.status(500).json({ message: "Failed to retrieve semesters", error });
  }
}

export const getCourses = async (req: Request, res: Response, db: Database) => {
  const { semester } = req.query;
  let query = "SELECT * FROM courses";
  let params = [];

  if (semester) {
    query += " WHERE semester = ?";
    params.push(semester);
  }

  try {
    const projectGroups = await db.all(query, params);
    res.json(projectGroups);
  } catch (error) {
    console.error("Error during course retrieval:", error);
    res.status(500).json({ message: "Failed to retrieve courses", error });
  }
};

export const getProjects = async (req: Request, res: Response, db: Database) => {
  const { courseName } = req.query;

  if (!courseName) {
    return res.status(400).json({ message: "Course id is required" });
  }

  try {
    const courseId = DatabaseManager.getCourseIdFromName(db, courseName.toString());
    const projects = await db.all("SELECT * FROM projects WHERE courseId = ?", [courseId]);
    res.json(projects);
  } catch (error) {
    console.error("Error during project retrieval:", error);
    res.status(500).json({ message: `Failed to retrieve projects for course ${courseName}`, error });
  }
};

export const joinProject = async (req: Request, res: Response, db: Database) => {
  const { projectName, memberName, memberRole } = req.body;

  let memberEmail: Email;
  if (!req.query.memberEmail || typeof req.query.memberEmail !== 'string') {
      return res.status(400).json({ message: 'User email is required' });
  }
  try {
      memberEmail = new Email(req.query.memberEmail as string);
  } catch (IllegalArgumentException) {
      return res.status(400).json({ message: 'Invalid email address' });
  }

  if (!memberRole) {
    return res.status(400).json({ message: "Please fill in your role" });
  }

  try {
    const projectId = DatabaseManager.getProjectIdFromName(db, projectName);
    const userId = DatabaseManager.getUserIdFromEmail(db, memberEmail.toString());
    const isMember = await db.get(`SELECT * FROM user_projects WHERE userId = ? AND projectId = ?`, [userId, projectId]);
    if (isMember) {
      return res.status(400).json({ message: "You have already joined this project" });
    }

    await db.run('INSERT INTO user_projects (userId, projectId, memberRole ) VALUES (?, ?, ?)', [userId, projectId, memberRole]);
    res.status(201).json({ message: "Joined project successfully" });

  } catch (error) {
    console.error("Error during joining project:", error);
    res.status(500).json({ message: "Failed to join project", error });
  }
};

export const leaveProject = async (req: Request, res: Response, db: Database) => {
  const { userEmail, projectName } = req.body;

  try {
    const projectId = DatabaseManager.getProjectIdFromName(db, projectName);
    const userId = DatabaseManager.getUserIdFromEmail(db, userEmail);
    const isMember = await db.get(`SELECT * FROM user_projects WHERE userId = ? AND projectId = ?`, [userId, projectId]);
    if (!isMember) {
      return res.status(400).json({ message: "You are not a member of this project" });
    }
    await db.run('DELETE FROM user_projects WHERE userId = ? AND projectId = ?', [userId, projectId]);

    res.status(200).json({ message: "Left project successfully" });
  } catch (error) {
    console.error("Error during leaving project:", error);
    res.status(500).json({ message: "Failed to leave project", error });
  }
}

export const getUserProjects = async (req: Request, res: Response, db: Database) => {
  let userEmail : Email;
  if (!req.query.userEmail || typeof req.query.userEmail !== 'string') {
      return res.status(400).json({ message: 'User email is required' });
  }
  try {
      userEmail = new Email(req.query.email as string);
  } catch (IllegalArgumentException) {
      return res.status(400).json({ message: 'Invalid email address' });
  }

  try {
    const userId = DatabaseManager.getUserIdFromEmail(db, userEmail.toString());
    const projects = await db.all('SELECT projectId FROM user_projects WHERE userId = ?', [userId]);
    res.json(projects);
  } catch (error) {
    console.error("Error during retrieving user projects:", error);
    res.status(500).json({ message: "Failed to retrieve user projects", error });
  }
};

export const getUserCourses = async (req: Request, res: Response, db: Database) => {
  const { projectName } = req.query;

  if (!projectName) {
    return res.status(400).json({ message: "Project Name is required" });
  }


  try {
    const projectId = DatabaseManager.getProjectIdFromName(db, projectName?.toString());
    const projectGroups = await db.get('SELECT DISTINCT courseId FROM projects WHERE id = ?', [projectId]);
    if (projectGroups) {
      res.json(projectGroups);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    console.error("Error during retrieving user courses:", error);
    res.status(500).json({ message: "Failed to retrieve user courses", error });
  }
};

export const getUsers = async (req: Request, res: Response, db: Database) => {
  try {
    const user = await db.all('SELECT * FROM users');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error during retrieving user status:", error);
    res.status(500).json({ message: "Failed to retrieve user status", error });
  }
}

export const getUsersByStatus = async (req: Request, res: Response, db: Database) => {
  const { status } = req.query;

  try {
    const user = await db.all('SELECT * FROM users WHERE status = ?', [status]);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error during retrieving user status:", error);
    res.status(500).json({ message: "Failed to retrieve user status", error });
  }
}

export const updateUserStatus = async (req: Request, res: Response, db: Database) => {
  const { userEmail, status } = req.body;

  if (!userEmail || !status) {
    return res.status(400).json({ message: "Please provide email and status" });
  }

  if (status == "suspended") {
    sendSuspendedEmail(userEmail);
  } else if (status == "removed") {
    sendRemovedEmail(userEmail);
  }

  try {
    await db.run('UPDATE users SET status = ? WHERE email = ?', [status, userEmail]);
    res.status(200).json({ message: "User status updated successfully" });
  } catch (error) {
    console.error("Error during updating user status:", error);
    res.status(500).json({ message: "Failed to update user status", error });
  }
}

export const updateAllConfirmedUsers = async (req: Request, res: Response, db: Database) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const result = await db.run(
      'UPDATE users SET status = ? WHERE status = "confirmed"',
      [status]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: 'No confirmed users found to update' });
    }

    res.status(200).json({ message: `All confirmed users have been updated to ${status}` });
  } catch (error) {
    console.error('Error updating confirmed users:', error);
    res.status(500).json({ message: 'Failed to update confirmed users' });
  }
};

export const sendSuspendedEmail = async (email: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp-auth.fau.de',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER_FAU,
      pass: process.env.EMAIL_PASS_FAU,
    },
  });

  const mailOptions = {
    from: '"Mini-Meco" <shu-man.cheng@fau.de>',
    to: email,
    subject: 'Account Suspended',
    text: `Your account has been suspended. Please contact the administrator for more information.`,
  };

  try {
    // @todo: Uncomment the following lines to send email
    // const info = await transporter.sendMail(mailOptions);
    // console.log('Account suspended email sent: %s', info.messageId);
  } catch (error) {
    console.error('error sending suspended email:', error);
    throw new Error('There was an error sending the email');
  }
}

export const sendRemovedEmail = async (email: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp-auth.fau.de',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER_FAU,
      pass: process.env.EMAIL_PASS_FAU,
    },
  });

  const mailOptions = {
    from: '"Mini-Meco" <shu-man.cheng@fau.de>',
    to: email,
    subject: 'Account Removed',
    text: `Your account has been removed. Please contact the administrator for more information.`,
  };

  try {
    // @todo: Uncomment the following lines to send email
    // const info = await transporter.sendMail(mailOptions);
    // console.log('Account removed email sent: %s', info.messageId);
  } catch (error) {
    console.error('error sending removed email:', error);
    throw new Error('There was an error sending the email');
  }
}


export const getEnrolledCourses = async (req: Request, res: Response, db: Database) => {
  let userEmail : Email;
  if (!req.query.email || typeof req.query.email !== 'string') {
      return res.status(400).json({ message: 'User email is required' });
    }
  try {
      userEmail = new Email(req.query.email as string);
  } catch (IllegalArgumentException) {
      return res.status(400).json({ message: 'Invalid email address' });
  }

  try {
    const userId = DatabaseManager.getUserIdFromEmail(db, userEmail.toString());
    const courses = await db.all(
      `SELECT DISTINCT projects.courseId 
         FROM user_projects 
         INNER JOIN projects ON user_projects.projectId = projects.id
         WHERE user_projects.userId = ?`,
      [userId]
    );
    res.json(courses);
  } catch (error) {
    console.error("Error during retrieving courses of user:", error);
    res.status(500).json({ message: "Failed to retrieve courses of user", error });
  }
};

export const getProjectsForCourse = async (req: Request, res: Response, db: Database) => {
  const { courseName} = req.query;

  let userEmail : Email;
  if (!req.query.email || typeof req.query.email !== 'string') {
      return res.status(400).json({ message: 'User email is required' });
    }
  try {
      userEmail = new Email(req.query.email as string);
  } catch (IllegalArgumentException) {
      return res.status(400).json({ message: 'Invalid email address' });
  }

  if (!courseName) {
    return res.status(400).json({ message: "Course Name and user Email are required" });
  }

  try {
    const courseId = DatabaseManager.getCourseIdFromName(db, courseName.toString());
    const userId = DatabaseManager.getUserIdFromEmail(db, userEmail.toString());

    const enrolledProjects = await db.all(
      `SELECT projects.id
             FROM user_projects
             INNER JOIN projects ON user_projects.prjectId = projects.id
             WHERE courseId = ? AND userId = ?`,
      [courseId, userId]
    );

    const availableProjects = await db.all(
      `SELECT p.id
             FROM projects p
             LEFT JOIN user_projects up ON (p.id = up.projectId) AND (up.userId = ?)
             WHERE p.courseId = ? AND up.userid IS NULL`,
      [userId, courseId]
    );

    res.json({ enrolledProjects, availableProjects });
  } catch (error) {
    console.error("Error retrieving projects for course:", error);
    res.status(500).json({ message: "Failed to retrieve projects for course", error });
  }
};

export const getRoleForProject = async (req: Request, res: Response, db: Database) => {
  const { projectName } = req.query;

    let userEmail : Email;
    if (!req.query.email || typeof req.query.email !== 'string') {
        return res.status(400).json({ message: 'User email is required' });
      }
    try {
        userEmail = new Email(req.query.email as string);
    } catch (IllegalArgumentException) {
        return res.status(400).json({ message: 'Invalid email address' });
    }

  if (!projectName) {
    return res.status(400).json({ message: "Project name and user email are required" });
  }

  try {
    const projectId = DatabaseManager.getProjectIdFromName(db, projectName.toString());
    const userId = DatabaseManager.getUserIdFromEmail(db, userEmail.toString());
    const role = await db.get(
      `SELECT memberRole
             FROM user_projects
             WHERE userId = ? AND projectId = ?`,
      [userId, projectId]
    );

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.json({ role: role.memberRole });
  } catch (error) {
    console.error("Error retrieving project role", error);
    res.status(500).json({ message: "Failed to retrieve project role", error });
  }
}
