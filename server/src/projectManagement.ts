import { Database } from "sqlite";
import { Request, Response } from "express";;
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { DatabaseManager } from "./Models/DatabaseManager";
import { Email } from './email';

dotenv.config();


export const createProject = async (req: Request, res: Response, db: Database) => {
  const { courseName, projectName } = req.body;

  if (!courseName || !projectName) {
    return res.status(400).json({ message: "Please fill in project group name and project name" });
  }

  try {
    const courseId = await DatabaseManager.getCourseIdFromName(db, courseName);
    const user = await db.get('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (!user) {
      return res.status(400).json({ message: 'Course Not Found' });
    }

    await db.run(`INSERT INTO projects (projectName, courseId) VALUES (?, ?)`, [projectName, courseId]);

    res.status(201).json({ message: "Project created successfully" });
  } catch (error) {
    console.error("Error during project creation:", error);
    res.status(500).json({ message: "Project creation failed", error });
  }
};

export const editProject = async (req: Request, res: Response, db: Database) => {
  const { newCourseName, projectName, newProjectName } = req.body;

  if (!newCourseName || !newProjectName) {
    return res.status(400).json({ message: "Please fill in project group name and project name" });
  }

  try {
    const newCourseId = await DatabaseManager.getCourseIdFromName(db, newCourseName);
    const projectId = await DatabaseManager.getProjectIdFromName(db, projectName);
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

export const getProjects = async (req: Request, res: Response, db: Database) => {
  const { courseName } = req.query;

  if (!courseName) {
    return res.status(400).json({ message: "Course id is required" });
  }

  try {
    const courseId = await DatabaseManager.getCourseIdFromName(db, courseName.toString());
    const projects = await db.all("SELECT * FROM projects WHERE courseId = ?", [courseId]);
    res.json(projects);
  } catch (error) {
    console.error("Error during project retrieval:", error);
    res.status(500).json({ message: `Failed to retrieve projects for course ${courseName}`, error });
  }
};

export const joinProject = async (req: Request, res: Response, db: Database) => {
  const { projectName, memberRole, memberEmail: memberEmailStr } = req.body;

  let memberEmail: Email;
  if (!memberEmailStr || typeof memberEmailStr !== 'string') {
      return res.status(400).json({ message: 'User email is required' });
  }
  try {
      memberEmail = new Email(memberEmailStr);
  } catch {
      return res.status(400).json({ message: 'Invalid email address' });
  }

  if (!memberRole) {
    return res.status(400).json({ message: "Please fill in your role" });
  }

  try {
    const projectId = await DatabaseManager.getProjectIdFromName(db, projectName);
    const userId = await DatabaseManager.getUserIdFromEmail(db, memberEmail.toString());
    const isMember = await db.get(`SELECT * FROM user_projects WHERE userId = ? AND projectId = ?`, [userId, projectId]);
    if (isMember) {
      return res.status(400).json({ message: "You have already joined this project" });
    }

    await db.run('INSERT INTO user_projects (userId, projectId, role) VALUES (?, ?, ?)', [userId, projectId, memberRole]);
    res.status(201).json({ message: "Joined project successfully" });

  } catch (error) {
    console.error("Error during joining project:", error);
    res.status(500).json({ message: "Failed to join project", error });
  }
};

export const leaveProject = async (req: Request, res: Response, db: Database) => {
  const { userEmail, projectName } = req.body;

  try {
    const projectId = await DatabaseManager.getProjectIdFromName(db, projectName);
    const userId = await DatabaseManager.getUserIdFromEmail(db, userEmail);
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
      userEmail = new Email(req.query.userEmail as string);
  } catch {
      return res.status(400).json({ message: 'Invalid email address' });
  }

  try {
    const userId = await DatabaseManager.getUserIdFromEmail(db, userEmail.toString());
    const projects = await db.all(
      `SELECT p.id, p.projectName
       FROM user_projects up
       INNER JOIN projects p ON up.projectId = p.id
       WHERE up.userId = ?`,
      [userId]
    );
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
    const projectId = await DatabaseManager.getProjectIdFromName(db, projectName?.toString());
    const allCourse = await db.get('SELECT DISTINCT courseId FROM projects WHERE id = ?', [projectId]);
    if (allCourse) {
      res.json(allCourse);
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _transporter = nodemailer.createTransport({
    host: 'smtp-auth.fau.de',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER_FAU,
      pass: process.env.EMAIL_PASS_FAU,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _mailOptions = {
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _transporter = nodemailer.createTransport({
    host: 'smtp-auth.fau.de',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER_FAU,
      pass: process.env.EMAIL_PASS_FAU,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _mailOptions = {
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
  if (!req.query.userEmail || typeof req.query.userEmail !== 'string') {
      return res.status(400).json({ message: 'User email is required' });
    }
  try {
      userEmail = new Email(req.query.userEmail as string);
  } catch {
      return res.status(400).json({ message: 'Invalid email address' });
  }

  try {
    const userId = await DatabaseManager.getUserIdFromEmail(db, userEmail.toString());
    const courses = await db.all(
      `SELECT DISTINCT c.id, c.courseName
         FROM user_projects up
         INNER JOIN projects p ON up.projectId = p.id
         INNER JOIN courses c ON p.courseId = c.id
         WHERE up.userId = ?`,
      [userId]
    );
    res.json(courses);
  } catch (error) {
    console.error("Error during retrieving courses of user:", error);
    res.status(500).json({ message: "Failed to retrieve courses of user", error });
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
    } catch {
        return res.status(400).json({ message: 'Invalid email address' });
    }

  if (!projectName) {
    return res.status(400).json({ message: "Project name and user email are required" });
  }

  try {
    const projectId = await DatabaseManager.getProjectIdFromName(db, projectName.toString());
    const userId = await DatabaseManager.getUserIdFromEmail(db, userEmail.toString());
    const role = await db.get(
      `SELECT role
             FROM user_projects
             WHERE userId = ? AND projectId = ?`,
      [userId, projectId]
    );

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.json({ role: role.role });
  } catch (error) {
    console.error("Error retrieving project role", error);
    res.status(500).json({ message: "Failed to retrieve project role", error });
  }
}

export const getCourseForProject = async (req: Request, res: Response, db: Database) => {
  const { projectName } = req.query;

  if (!projectName) {
    return res.status(400).json({ message: 'Project name is required' });
  }

  try {
    const course = await db.get(
      `SELECT c.courseName FROM courses c
       INNER JOIN projects p ON p.courseId = c.id
       WHERE p.projectName = ?`,
      [projectName]
    );

    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found for this project' });
    }
  } catch (error) {
    console.error('Error fetching course for project:', error);
    res.status(500).json({ message: 'Failed to fetch course', error });
  }
}
