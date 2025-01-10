import { Database } from "sqlite";
import { Request, Response } from "express";
import { send } from "process";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const createProjectGroup = async (req: Request, res: Response, db: Database) => {
    const { semester, projectGroupName } = req.body;
    const semesterRegex = /^(SS|WS)\d{2,4}$/; // Format: SS24 or WS2425

    if (!semester || !projectGroupName) {
        return res.status(400).json({ message: "Please fill in semester and project group name" });
    } else if (!semesterRegex.test(semester)) {
        return res.status(400).json({ message: "Invalid semester format. Please use SSYY or WSYYYY format" });
    }
    
    try {
        await db.run("INSERT INTO projectGroup (semester, projectGroupName) VALUES (?, ?)", [semester, projectGroupName]);
        await db.exec(`
            CREATE TABLE IF NOT EXISTS "${projectGroupName}" (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              projectName TEXT UNIQUE
            )
        `);
        res.status(201).json({ message: "Project group created successfully" });
    } catch (error) {
        console.error("Error during project group creation:", error);
        res.status(500).json({ message: "Project group creation failed", error });
    }
}

export const createProject = async (req: Request, res: Response, db: Database) => {
    const { projectGroupName, projectName } = req.body;

    if (!projectGroupName || !projectName) {
        return res.status(400).json({ message: "Please fill in project group name and project name" });
    }

    try {
        const user = await db.get('SELECT * FROM projectGroup WHERE projectGroupName = ?', [projectGroupName]);
        if (!user) {
            return res.status(400).json({ message: 'Project Group Not Found' });
        }

        await db.run(`INSERT INTO ${projectGroupName} (projectName) VALUES (?)`, [projectName]);
        await db.run(`INSERT INTO project (projectName, projectGroupName) VALUES (?, ?)`, [projectName, projectGroupName]);
        await db.exec(`
            CREATE TABLE IF NOT EXISTS "${projectName}" (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                memberName TEXT,
                memberRole TEXT,
                memberEmail TEXT UNIQUE
            )
        `);
        res.status(201).json({ message: "Project created successfully" });
    } catch (error) {
        console.error("Error during project creation:", error);
        res.status(500).json({ message: "Project creation failed", error });
    }
};


export const editProjectGroup = async (req: Request, res: Response, db: Database) => {
    const { projectGroupName, newSemester, newProjectGroupName } = req.body;
    const semesterRegex = /^(SS|WS)\d{2,4}$/; // Format: SS24 or WS2425
 
    if (!newSemester || !newProjectGroupName) {
        return res.status(400).json({ message: "Please fill in semester and project group name" });
    } else if (!semesterRegex.test(newSemester)) {
        return res.status(400).json({ message: "Invalid semester format. Please use SSYY or WSYYYY format" });
    }

    try {
        console.log(`Executing SQL: UPDATE projectGroup SET semester = '${newSemester}', projectGroupName = '${newProjectGroupName}' WHERE projectGroupName = '${projectGroupName}'`);

        await db.run(
            
            `UPDATE projectGroup SET semester = ?, projectGroupName = ? WHERE projectGroupName = ?`, 
            [newSemester, newProjectGroupName, projectGroupName]
        );        

        res.status(201).json({ message: "Project group edited successfully" });
    } catch (error) {
        console.error("Error during project group edition:", error);
        res.status(500).json({ message: "Project group edited failed", error });
    }
}

export const editProject = async (req: Request, res: Response, db: Database) => {
    const { newProjectGroupName, projectName, newProjectName } = req.body;
  
    if (!newProjectGroupName || !newProjectName) {
      return res.status(400).json({ message: "Please fill in project group name and project name" });
    }
  
    try {
      // Check if table names need to be quoted
      const quotedProjectName = `"${projectName}"`;
      const quotedNewProjectName = `"${newProjectName}"`;
  
      //get the old project group name
        const oldProjectGroupName = await db.get('SELECT projectGroupName FROM project WHERE projectName = ?', [projectName]);
      await db.run(`ALTER TABLE ${quotedProjectName} RENAME TO ${quotedNewProjectName}`);
        
      await db.run(
        `UPDATE project SET projectName = ?, projectGroupName = ? WHERE projectName = ?`,
        [newProjectName, newProjectGroupName, projectName]
      );

      // update the table $projectGroupName to $newProjectGroupName
      await db.run(`UPDATE ${oldProjectGroupName.projectGroupName} SET projectName = ? WHERE projectName = ?`, [newProjectName, projectName]);
      
      res.status(201).json({ message: "Project edited successfully" });
    } catch (error) {
      console.error("Error during project edition:", error);
      res.status(500).json({ message: "Project edition failed", error });
    }
  };
  


export const getSemesters = async (req: Request, res: Response, db: Database) => {
    try {
        const semesters = await db.all("SELECT DISTINCT semester FROM projectGroup");
        res.json(semesters);
    } catch (error) {
        console.error("Error during semester retrieval:", error);
        res.status(500).json({ message: "Failed to retrieve semesters", error });
    }
}

export const getProjectGroups = async (req: Request, res: Response, db: Database) => {
    const { semester } = req.query;
    let query = "SELECT * FROM projectGroup";
    let params = [];

    if (semester) {
        query += " WHERE semester = ?";
        params.push(semester);
    }

    try {
        const projectGroups = await db.all(query, params);
        res.json(projectGroups);
    } catch (error) {
        console.error("Error during project group retrieval:", error);
        res.status(500).json({ message: "Failed to retrieve project groups", error });
    }
};

export const getProjects = async (req: Request, res: Response, db: Database) => {
    const { projectGroupName } = req.query;

    if (!projectGroupName) {
        return res.status(400).json({ message: "Project group name is required" });
    }

    try {
        const projects = await db.all(`SELECT * FROM "${projectGroupName}"`);
        res.json(projects);
    } catch (error) {
        console.error("Error during project retrieval:", error);
        res.status(500).json({ message: `Failed to retrieve projects for project group ${projectGroupName}`, error });
    }
};

export const joinProject = async (req: Request, res: Response, db: Database) => {
    const { projectName, memberName, memberRole, memberEmail } = req.body;

    if (!memberRole) {
        return res.status(400).json({ message: "Please fill in your role" });
    }

    try {
        const user = await db.get(`SELECT * FROM "${projectName}" WHERE memberName = ?`, [memberName]);
        if (user) {
            return res.status(400).json({ message: "You have already joined this project" });
        }
        const email = await db.get(`SELECT * FROM "${projectName}" WHERE memberEmail = ?`, [memberEmail]);
        if (user) {
            return res.status(400).json({ message: "You have already joined this project" });
        }

        await db.run(`INSERT INTO "${projectName}" (memberName, memberRole, memberEmail) VALUES (?, ?, ?)`, [memberName, memberRole, memberEmail]);
        await db.run('INSERT INTO user_projects (userEmail, projectName) VALUES (?, ?)', [memberEmail, projectName]);
        res.status(201).json({ message: "Joined project successfully" });

    } catch (error) {
        console.error("Error during joining project:", error);
        res.status(500).json({ message: "Failed to join project", error });   
    }
};

export const leaveProject = async (req: Request, res: Response, db: Database) => {
    const { projectName, memberEmail } = req.body;

    try {
        const isMember = await db.get(`SELECT * FROM "${projectName}" WHERE memberEmail = ?`, [memberEmail]);
        if (!isMember) {
          return res.status(400).json({ message: "You are not a member of this project" });
        }

        await db.run(`DELETE FROM "${projectName}" WHERE memberEmail = ?`, [memberEmail]);
        await db.run('DELETE FROM user_projects WHERE userEmail = ? AND projectName = ?', [memberEmail, projectName]);

        res.status(200).json({ message: "Left project successfully" });
    } catch (error) {
        console.error("Error during leaving project:", error);
        res.status(500).json({ message: "Failed to leave project", error });
    }
}

export const getUserProjects = async (req: Request, res: Response, db: Database) => {
    const { userEmail } = req.query;
  
    try {
      const projects = await db.all('SELECT projectName FROM user_projects WHERE userEmail = ?', [userEmail]);
      res.json(projects);
    } catch (error) {
      console.error("Error during retrieving user projects:", error);
      res.status(500).json({ message: "Failed to retrieve user projects", error });
    }
  };
  
export const getUserProjectGroups = async (req: Request, res: Response, db: Database) => {
    const { projectName } = req.query;

    try {
        const projectGroups = await db.get('SELECT projectGroupName FROM project WHERE projectName = ?', [projectName]);
        if (projectGroups) {
            res.json(projectGroups);
        } else {
            res.status(404).json({ message: "Project group not found" });
        }
    } catch (error) {
        console.error("Error during retrieving user project groups:", error);
        res.status(500).json({ message: "Failed to retrieve user project groups", error });
    }
};


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
    const { email, status } = req.body;

    if (!email || !status) {
        return res.status(400).json({ message: "Please provide email and status" });
    }

    if (status == "suspended"){
        sendSuspendedEmail(email);
    } else if (status == "removed"){
        sendRemovedEmail(email);
    }

    try {
        await db.run('UPDATE users SET status = ? WHERE email = ?', [status, email]);
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
        
        const confirmedUsers = await db.all('SELECT * FROM users WHERE status = "confirmed"');
        

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
    
    const { userEmail } = req.query;
    
    if (!userEmail) {
        return res.status(400).json({ message: "User email is required" });
    }

    try {
      const courses = await db.all(
        `SELECT DISTINCT projectGroupName 
         FROM user_projects 
         JOIN project USING (projectName)
         WHERE userEmail = ?`,
         [userEmail]
    );
      res.json(courses);
    } catch (error) {
      console.error("Error during retrieving courses of user:", error);
      res.status(500).json({ message: "Failed to retrieve courses of user", error });
    }
};

export const getProjectsForCourse = async (req: Request, res: Response, db: Database) => {
    const { courseName, userEmail } = req.query;

    if (!courseName || !userEmail) {
        return res.status(400).json({ message: "Course name and user email are required" });
    }

    try {
        const enrolledProjects = await db.all(
            `SELECT projectName
             FROM project
             JOIN user_projects USING (projectName)
             WHERE projectGroupName = ? AND userEmail = ?`,
            [courseName, userEmail]
        );

        const availableProjects = await db.all(
            `SELECT p.projectName
             FROM project p
             LEFT JOIN user_projects up ON (p.projectName = up.projectName) AND (up.userEmail = ?)
             WHERE p.projectGroupName = ? AND up.userEmail IS NULL`,
            [userEmail, courseName]
        );

        res.json({ enrolledProjects, availableProjects });
    } catch (error) {
        console.error("Error retrieving projects for course:", error);
        res.status(500).json({ message: "Failed to retrieve projects for course", error });
    }
};

export const getRoleForProject = async (req: Request, res: Response, db: Database) => {
    const { projectName, userEmail } = req.query;
  
    if (!projectName || !userEmail) {
      return res.status(400).json({ message: "Project name and user email are required" });
    }
  
    try {
        const role = await db.get(
            `SELECT memberRole
             FROM ${projectName}
             WHERE memberEmail = ?`,
            [projectName, userEmail]
        );
        res.json(role);
    } catch (error) {
      console.error("Error retrieving project role", error);
      res.status(500).json({ message: "Failed to retrieve project role", error });
    }
}


  