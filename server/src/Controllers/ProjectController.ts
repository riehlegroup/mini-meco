import { Application, Request, Response } from "express";
import { Database } from "sqlite";
import nodemailer from "nodemailer";
import { DatabaseManager } from "../Models/DatabaseManager";
import { Email } from "../email";
import { IAppController } from "./IAppController";

/**
 * Controller for handling project-related HTTP requests.
 * Manages project CRUD, user-project relationships, and project features
 * (happiness metrics, sprints, standups).
 */
export class ProjectController implements IAppController {
  constructor(private db: Database) {}

  /**
   * Initializes API routes for project management.
   * @param app Express application instance
   */
  init(app: Application): void {
    // Project management
    app.get("/courseProject", this.getProjects.bind(this));
    app.put("/courseProject", this.editProject.bind(this));
    app.get("/courseProject/course", this.getCourseForProject.bind(this));
    app.get("/courseProject/user/role", this.getRoleForProject.bind(this));

    // User-project relationships
    app.post("/user/project", this.joinProject.bind(this));
    app.delete("/user/project", this.leaveProject.bind(this));
    app.get("/user/projects", this.getUserProjects.bind(this));
    app.get("/user/courses", this.getEnrolledCourses.bind(this));

    // Project features: Sprints
    app.post("/courseProject/sprints", this.createSprints.bind(this));
    app.get("/courseProject/sprints", this.getSprints.bind(this));
    app.get("/courseProject/currentSprint", this.getProjectCurrentSprint.bind(this));

    // Project features: Happiness
    app.post("/courseProject/happiness", this.saveHappinessMetric.bind(this));
    app.get("/courseProject/happiness", this.getProjectHappinessMetrics.bind(this));

    // Project features: Standups
    app.post("/courseProject/standupsEmail", this.sendStandupEmails.bind(this));
  }

  async getProjects(req: Request, res: Response): Promise<void> {
    const { courseName } = req.query;

    if (!courseName) {
      res.status(400).json({ message: "Course id is required" });
      return;
    }

    try {
      let courseId;
      try {
        courseId = await DatabaseManager.getCourseIdFromName(this.db, courseName.toString());
      } catch (error) {
        if (error instanceof Error && error.message.includes("Unknown Course Name!")) {
          res.status(404).json({ message: "Course not found" });
          return;
        }
        throw error;
      }

      const projects = await this.db.all("SELECT * FROM projects WHERE courseId = ?", [courseId]);
      res.json(projects);
    } catch (error) {
      console.error("Error during project retrieval:", error);
      res
        .status(500)
        .json({ message: `Failed to retrieve projects for course ${courseName}`, error });
    }
  }

  async editProject(req: Request, res: Response): Promise<void> {
    const { newCourseName, projectName, newProjectName } = req.body;

    if (!newCourseName || !newProjectName) {
      res.status(400).json({ message: "Please fill in project group name and project name" });
      return;
    }

    try {
      const newCourseId = await DatabaseManager.getCourseIdFromName(this.db, newCourseName);
      const projectId = await DatabaseManager.getProjectIdFromName(this.db, projectName);
      await this.db.run(`UPDATE projects SET projectName = ?, courseId = ? WHERE id = ?`, [
        newProjectName,
        newCourseId,
        projectId,
      ]);
      res.status(201).json({ message: "Project edited successfully" });
    } catch (error) {
      console.error("Error during project edition:", error);
      res.status(500).json({ message: "Project edition failed", error });
    }
  }

  async getCourseForProject(req: Request, res: Response): Promise<void> {
    const { projectName } = req.query;

    if (!projectName) {
      res.status(400).json({ message: "Project name is required" });
      return;
    }

    try {
      const course = await this.db.get(
        `SELECT c.courseName FROM courses c
         INNER JOIN projects p ON p.courseId = c.id
         WHERE p.projectName = ?`,
        [projectName]
      );

      if (course) {
        res.json(course);
      } else {
        res.status(404).json({ message: "Course not found for this project" });
      }
    } catch (error) {
      console.error("Error fetching course for project:", error);
      res.status(500).json({ message: "Failed to fetch course", error });
    }
  }

  async getRoleForProject(req: Request, res: Response): Promise<void> {
    const { projectName } = req.query;

    let userEmail: Email;
    if (!req.query.email || typeof req.query.email !== "string") {
      res.status(400).json({ message: "User email is required" });
      return;
    }
    try {
      userEmail = new Email(req.query.email as string);
    } catch {
      res.status(400).json({ message: "Invalid email address" });
      return;
    }

    if (!projectName) {
      res.status(400).json({ message: "Project name and user email are required" });
      return;
    }

    try {
      const projectId = await DatabaseManager.getProjectIdFromName(this.db, projectName.toString());
      const userId = await DatabaseManager.getUserIdFromEmail(this.db, userEmail.toString());
      const role = await this.db.get(
        `SELECT role
         FROM user_projects
         WHERE userId = ? AND projectId = ?`,
        [userId, projectId]
      );

      if (!role) {
        res.status(404).json({ message: "Role not found" });
        return;
      }
      res.json({ role: role.role });
    } catch (error) {
      console.error("Error retrieving project role", error);
      res.status(500).json({ message: "Failed to retrieve project role", error });
    }
  }

  async joinProject(req: Request, res: Response): Promise<void> {
    const { projectName, memberRole, memberEmail: memberEmailStr } = req.body;

    let memberEmail: Email;
    if (!memberEmailStr || typeof memberEmailStr !== "string") {
      res.status(400).json({ message: "User email is required" });
      return;
    }
    try {
      memberEmail = new Email(memberEmailStr);
    } catch {
      res.status(400).json({ message: "Invalid email address" });
      return;
    }

    if (!memberRole) {
      res.status(400).json({ message: "Please fill in your role" });
      return;
    }

    try {
      let projectId;
      try {
        projectId = await DatabaseManager.getProjectIdFromName(this.db, projectName);
      } catch (error) {
        if (error instanceof Error && error.message.includes("Unknown Course Name!")) {
          res.status(404).json({ message: "Project not found" });
          return;
        }
        throw error;
      }

      const userId = await DatabaseManager.getUserIdFromEmail(this.db, memberEmail.toString());
      const isMember = await this.db.get(
        `SELECT * FROM user_projects WHERE userId = ? AND projectId = ?`,
        [userId, projectId]
      );
      if (isMember) {
        res.status(400).json({ message: "You have already joined this project" });
        return;
      }

      await this.db.run("INSERT INTO user_projects (userId, projectId, role) VALUES (?, ?, ?)", [
        userId,
        projectId,
        memberRole,
      ]);
      res.status(201).json({ message: "Joined project successfully" });
    } catch (error) {
      console.error("Error during joining project:", error);
      res.status(500).json({ message: "Failed to join project", error });
    }
  }

  async leaveProject(req: Request, res: Response): Promise<void> {
    const { userEmail, projectName } = req.body;

    try {
      let projectId;
      try {
        projectId = await DatabaseManager.getProjectIdFromName(this.db, projectName);
      } catch (error) {
        if (error instanceof Error && error.message.includes("Unknown Course Name!")) {
          res.status(404).json({ message: "Project not found" });
          return;
        }
        throw error;
      }

      const userId = await DatabaseManager.getUserIdFromEmail(this.db, userEmail);
      const isMember = await this.db.get(
        `SELECT * FROM user_projects WHERE userId = ? AND projectId = ?`,
        [userId, projectId]
      );
      if (!isMember) {
        res.status(400).json({ message: "You are not a member of this project" });
        return;
      }
      await this.db.run("DELETE FROM user_projects WHERE userId = ? AND projectId = ?", [
        userId,
        projectId,
      ]);

      res.status(200).json({ message: "Left project successfully" });
    } catch (error) {
      console.error("Error during leaving project:", error);
      res.status(500).json({ message: "Failed to leave project", error });
    }
  }

  async getUserProjects(req: Request, res: Response): Promise<void> {
    let userEmail: Email;
    if (!req.query.userEmail || typeof req.query.userEmail !== "string") {
      res.status(400).json({ message: "User email is required" });
      return;
    }
    try {
      userEmail = new Email(req.query.userEmail as string);
    } catch {
      res.status(400).json({ message: "Invalid email address" });
      return;
    }

    try {
      const userId = await DatabaseManager.getUserIdFromEmail(this.db, userEmail.toString());
      const projects = await this.db.all(
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
  }

  async getEnrolledCourses(req: Request, res: Response): Promise<void> {
    let userEmail: Email;
    if (!req.query.userEmail || typeof req.query.userEmail !== "string") {
      res.status(400).json({ message: "User email is required" });
      return;
    }
    try {
      userEmail = new Email(req.query.userEmail as string);
    } catch {
      res.status(400).json({ message: "Invalid email address" });
      return;
    }

    try {
      const userId = await DatabaseManager.getUserIdFromEmail(this.db, userEmail.toString());
      const courses = await this.db.all(
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
  }

  async createSprints(req: Request, res: Response): Promise<void> {
    const { courseName, dates } = req.body;

    if (!courseName) {
      res.status(400).json({ message: "Course name is required" });
      return;
    }

    if (!dates || !Array.isArray(dates)) {
      res.status(400).json({ message: "Dates array is required" });
      return;
    }

    try {
      const courseIdObj = await this.db.get(
        `SELECT id
        FROM courses
        WHERE courses.courseName = ?`,
        [courseName]
      );
      if (courseIdObj === undefined) {
        res.status(404).json({ message: "Course not found" });
        return;
      }
      const courseId = courseIdObj.id;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _existingSprints = await this.db.all(
        `SELECT endDate
        FROM sprints
        WHERE courseId = ?`,
        [courseId]
      );

      const latestSprint = await this.db.get(
        `SELECT sprintName
        FROM sprints
        WHERE courseId = ?
        ORDER BY sprintName DESC LIMIT 1`,
        [courseId]
      );
      let newSprintNumber = 0;
      if (latestSprint && latestSprint.sprintName) {
        newSprintNumber = parseInt(latestSprint.sprintName.replace("sprint", "")) + 1;
      }

      for (let i = 0; i < dates.length; i++) {
        const endDate = dates[i];
        const sprintName = `sprint${newSprintNumber + i}`;
        try {
          await this.db.run(
            `INSERT INTO sprints (courseId, sprintName, endDate) VALUES (?, ?, ?)`,
            [courseId, sprintName, endDate]
          );
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
  }

  async getSprints(req: Request, res: Response): Promise<void> {
    const { courseName } = req.query;

    try {
      const sprints = await this.db.all(
        `SELECT * FROM sprints
        WHERE courseId = (SELECT id FROM courses WHERE courseName = ?) ORDER BY endDate ASC`,
        [courseName]
      );
      res.json(sprints);
    } catch (error) {
      console.error("Error fetching sprints:", error);
      res.status(500).json({ message: "Failed to fetch sprints", error });
    }
  }

  async getProjectCurrentSprint(req: Request, res: Response): Promise<void> {
    const { projectName } = req.query;

    try {
      const sprints = await this.db.all(
        `SELECT *
        FROM sprints
        WHERE courseId = (SELECT courseId FROM projects WHERE projectName = ?)
        ORDER BY endDate ASC`,
        [projectName]
      );

      res.json(sprints);
    } catch (error) {
      console.error("Error fetching sprints:", error);
      res.status(500).json({ message: "Failed to fetch sprints", error });
    }
  }

  async saveHappinessMetric(req: Request, res: Response): Promise<void> {
    const { projectName, userEmail, happiness, sprintName } = req.body;
    const timestamp = new Date().toISOString();

    try {
      await this.db.run(
        `INSERT INTO happiness (projectId, userId, happiness, sprintId, timestamp)
        SELECT
          (SELECT id AS projectId FROM projects WHERE projectName = ?),
          (SELECT id AS userId FROM users WHERE email = ?),
          ?,
          (SELECT id AS sprintId FROM sprints WHERE sprintName = ?),
          ?
        `,
        [projectName, userEmail, happiness, sprintName, timestamp]
      );
      res.status(200).json({ message: "Happiness updated successfully" });
    } catch (error) {
      console.error("Error updating happiness:", error);
      res.status(500).json({ message: "Failed to update happiness", error });
    }
  }

  async getProjectHappinessMetrics(req: Request, res: Response): Promise<void> {
    const { projectName } = req.query;
    try {
      const happinessData = await this.db.all(
        `SELECT happiness.*, sprints.sprintName, users.email as userEmail
        FROM happiness
        LEFT JOIN sprints ON happiness.sprintId = sprints.id
        LEFT JOIN users ON happiness.userId = users.id
        WHERE happiness.projectId = (SELECT id FROM projects WHERE projectName = ?)
        ORDER BY sprints.sprintName ASC, happiness.timestamp ASC`,
        [projectName]
      );
      res.json(happinessData);
    } catch (error) {
      console.error("Error fetching happiness data:", error);
      res.status(500).json({ message: "Failed to fetch happiness data", error });
    }
  }

  async sendStandupEmails(req: Request, res: Response): Promise<void> {
    const { projectName, userName, doneText, plansText, challengesText } = req.body;

    try {
      const members = await this.db.all(
        `SELECT users.email FROM users
                INNER JOIN user_projects ON user_projects.userId = users.id
                INNER JOIN projects ON user_projects.projectId = projects.id
                WHERE projects.projectName = ?`,
        [projectName]
      );

      console.log(`Found ${members.length} members for project "${projectName}":`, members);

      if (members.length === 0) {
        res.status(400).json({ message: "No members in the project group" });
        return;
      }

      const recipientEmails = members.map((member) => member.email).join(",");

      const mailOptions = {
        from: '"Mini-Meco" <shu-man.cheng@fau.de>',
        to: recipientEmails,
        subject: `Standup Update for ${projectName}`,
        text: `Standup report from ${userName}\n\nDone: ${doneText}\nPlans: ${plansText}\nChallenges: ${challengesText}`,
      };

      if (process.env.NODE_ENV === "production") {
        const transporter = nodemailer.createTransport({
          host: "smtp-auth.fau.de",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER_FAU,
            pass: process.env.EMAIL_PASS_FAU,
          },
        });

        await transporter.sendMail(mailOptions);
        console.log("Standup email sent successfully");
      } else {
        console.log("Email would have been sent with the following options:");
        console.log(JSON.stringify(mailOptions, null, 2));
      }

      res.status(200).json({ message: "Standup email sent successfully" });
    } catch (error) {
      console.error("Error sending standup email:", error);
      res.status(500).json({ message: "Failed to send standup email", error });
    }
  }
}
