import { Database } from "sqlite";
import { Request, Response } from "express";
import nodemailer from "nodemailer";
import { Email } from './email';

export const sendStandupEmails = async (req: Request, res: Response, db: Database) => {
  const { projectName, userName, doneText, plansText, challengesText } = req.body;


  try {
    const members = await db.all(
      `SELECT users.email FROM users
              INNER JOIN user_projects ON user_projects.userId = users.id
              INNER JOIN projects ON user_projects.projectId = projects.id
              WHERE projects.projectName = ?`,
      [projectName]);


    if (members.length === 0) {
      return res.status(400).json({ message: "No members in the project group" });
    }
  
      const recipientEmails = members.map(member => member.memberEmail).join(",");
  
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
        to: recipientEmails,
        subject: `Standup Update for ${projectName}`,
        text: `Standup report from ${userName}\n\nDone: ${doneText}\nPlans: ${plansText}\nChallenges: ${challengesText}`,
      };
  
      // @todo: Uncomment the following lines to send email
      // await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: "Standup email sent successfully" });
    } catch (error) {
      console.error("Error sending standup email:", error);
      res.status(500).json({ message: "Failed to send standup email", error });
    }
};


export const createSprints = async (req: Request, res: Response, db: Database) => {

  const { courseName, dates } = req.body;


  try {
    const courseIdObj = await db.get(`SELECT id
      FROM courses
      WHERE courses.courseName = ?`, [courseName]);
    if (courseIdObj === undefined) {
      throw new Error("Unknown Course Name!");
    }
    const courseId = courseIdObj.id;

    const existingSprints = await db.all(`SELECT endDate 
      FROM sprints 
      WHERE courseId = ?`, [courseId]);
    
    const latestSprint = await db.get(`SELECT sprintName 
      FROM sprints 
      WHERE courseId = ? 
      ORDER BY sprintName DESC LIMIT 1`, [courseId]);
    let newSprintNumber = 0;
    if (latestSprint && latestSprint.sprintName) {
      newSprintNumber = parseInt(latestSprint.sprintName.replace("sprint", "")) + 1;
    }

    for (let i = 0; i < dates.length; i++) {
      const endDate = dates[i];
      const sprintName = `sprint${newSprintNumber + i}`;
      try {
        await db.run(`INSERT INTO sprints (courseId, sprintName, endDate) VALUES (?, ?, ?)`, [courseId, sprintName, endDate]);
      } catch (error) {
        console.error("Error inserting sprint:", error);
        throw error;
      }
    }

    res.status(201).json({ message: "Sprints created successfully" });
  } catch (error) {
    console.error("Error creating sprints:", error);
    res.status(500).json({ message: "Failed to create sprints", error });
  }
};

export const saveHappinessMetric = async (req: Request, res: Response, db: Database) => {
  const { projectName, userEmail, happiness, sprintName } = req.body;
  const timestamp = new Date().toISOString();

  try {
    //this return { projectGroupName: "AMOSXX" } [object Object], so we need to change it into string
    await db.run(`INSERT INTO happiness (projectId, userId, happiness, sprintId, timestamp) 
      SELECT 
        (SELECT id AS projectId FROM projects WHERE projectName = ?),
        (SELECT id AS userId FROM users WHERE userEmail = ?),
        ?,
        (SELECT id AS sprintId FROM sprints WHERE sprintName = ?),
        ?
      `,
      [projectName, userEmail, happiness, sprintName, timestamp]);
    res.status(200).json({ message: "Happiness updated successfully" });
  } catch (error) {
    console.error("Error updating happiness:", error);
    res.status(500).json({ message: "Failed to update happiness", error });
  }
}

export const getProjectHappinessMetrics = async (req: Request, res: Response, db: Database) => {
  const { projectName } = req.query;
  try {
    const happinessData = await db.all(
      `SELECT * FROM happiness
      WHERE projectId = (SELECT id FROM projects WHERE projectName = ?)
      ORDER BY sprintName ASC, timestamp ASC`,
      [projectName]
    );
    res.json(happinessData);
  } catch (error) {
    console.error("Error fetching happiness data:", error);
    res.status(500).json({ message: "Failed to fetch happiness data", error });
  }
};

export const getSprints = async (req: Request, res: Response, db: Database) => {
  const { courseName } = req.query;

  try {
    const sprints = await db.all(
      `SELECT * FROM sprints 
      WHERE courseId = (SELECT id FROM courses WHERE courseName = ?) ORDER BY endDate ASC`,
      [courseName]
    );
    res.json(sprints);
  } catch (error) {
    console.error('Error fetching sprints:', error);
    res.status(500).json({ message: 'Failed to fetch sprints', error });
  }
};

export const getProjectCurrentSprint = async (req: Request, res: Response, db: Database) => {
  const { projectName } = req.query;

  try {
    const sprints = await db.all(
      `SELECT * 
      FROM sprints 
      WHERE courseId = (SELECT courseId FROM projects WHERE projectName = ?)
      ORDER BY endDate ASC`,
      [projectName]
    );

    res.json(sprints);
  } catch (error) {
    console.error('Error fetching sprints:', error);
    res.status(500).json({ message: 'Failed to fetch sprints', error });
  }
};

export const getProjectURL = async (req: Request, res: Response, db: Database) => {
  const { projectName, userEmail } = req.query;

  try {
    const projectURL = await db.get(`SELECT url 
      FROM user_projects 
      WHERE projectId = (SELECT id FROM projects WHERE projectName = ?) 
      AND userId = (SELECT id FROM users WHERE email = ?)`, [projectName, userEmail]);
    if (projectURL) {
      res.json(projectURL);
    } else {
      console.warn(`No URL found for project: ${projectName} and user: ${userEmail}`);
      res.status(404).json({ message: 'Project URL not found' });
    }
  } catch (error) {
    console.error('Error fetching project URL:', error);
    res.status(500).json({ message: 'Failed to fetch project URL', error });
  }
};

