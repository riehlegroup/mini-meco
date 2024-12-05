"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectGitHubURL = exports.getCurrentSprint = exports.getSprints = exports.getHappinessData = exports.saveHappiness = exports.createSprints = exports.sendStandupsEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendStandupsEmail = async (req, res, db) => {
    const { projectName, userName, doneText, plansText, challengesText } = req.body;
    try {
        const query = `SELECT memberEmail FROM "${projectName}"`;
        const members = await db.all(query);
        if (members.length === 0) {
            return res.status(400).json({ message: "No members in the project group" });
        }
        const recipientEmails = members.map(member => member.memberEmail).join(",");
        const transporter = nodemailer_1.default.createTransport({
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
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Standup email sent successfully" });
    }
    catch (error) {
        console.error("Error sending standup email:", error);
        res.status(500).json({ message: "Failed to send standup email", error });
    }
};
exports.sendStandupsEmail = sendStandupsEmail;
const createSprints = async (req, res, db) => {
    const { projectGroupName, dates } = req.body;
    try {
        const existingSprints = await db.all(`SELECT endDate FROM sprints WHERE projectGroupName = ?`, [projectGroupName]);
        /*
            for (let i = 0; i < dates.length; i++) {
              const endDate = dates[i];
        
              // Check if endDate already exists in existingSprints
              const isDuplicate = existingSprints.some(sprint => sprint.endDate === endDate);
              if (isDuplicate) {
                return res.status(400).json({ message: "Duplicate sprint date found" });
              }
            }
              */
        const latestSprint = await db.get(`SELECT sprintName FROM sprints WHERE projectGroupName = ? ORDER BY sprintName DESC LIMIT 1`, [projectGroupName]);
        let newSprintNumber = 0;
        if (latestSprint && latestSprint.sprintName) {
            newSprintNumber = parseInt(latestSprint.sprintName.replace("sprint", "")) + 1;
        }
        for (let i = 0; i < dates.length; i++) {
            const endDate = dates[i];
            const sprintName = `sprint${newSprintNumber + i}`;
            await db.run(`INSERT INTO sprints (projectGroupName, sprintName, endDate) VALUES (?, ?, ?)`, [projectGroupName, sprintName, endDate], (err) => {
                if (err) {
                    console.error("Error inserting sprint:", err);
                    throw err;
                }
            });
        }
        res.status(201).json({ message: "Sprints created successfully" });
    }
    catch (error) {
        console.error("Error creating sprints:", error);
        res.status(500).json({ message: "Failed to create sprints", error });
    }
};
exports.createSprints = createSprints;
const saveHappiness = async (req, res, db) => {
    const { projectName, userEmail, happiness, sprintName } = req.body;
    const timestamp = new Date().toISOString();
    try {
        //this return { projectGroupName: "AMOSXX" } [object Object], so we need to change it into string
        const projectGroupNameObj = await db.get(`SELECT projectGroupName FROM project WHERE projectName = ?`, [projectName]);
        const projectGroupName = projectGroupNameObj === null || projectGroupNameObj === void 0 ? void 0 : projectGroupNameObj.projectGroupName;
        if (!projectGroupName) {
            return res.status(404).json({ message: "Project group not found" });
        }
        await db.run(`INSERT INTO happiness (projectGroupName, projectName, userEmail, happiness, sprintName, timestamp ) VALUES (?, ?, ?, ?, ?, ? )`, [projectGroupName, projectName, userEmail, happiness, sprintName, timestamp]);
        res.status(200).json({ message: "Happiness updated successfully" });
    }
    catch (error) {
        console.error("Error updating happiness:", error);
        res.status(500).json({ message: "Failed to update happiness", error });
    }
};
exports.saveHappiness = saveHappiness;
const getHappinessData = async (req, res, db) => {
    const { projectName } = req.query;
    try {
        const happinessData = await db.all(`SELECT * FROM happiness WHERE projectName = ? ORDER BY sprintName ASC, timestamp ASC`, [projectName]);
        res.json(happinessData);
    }
    catch (error) {
        console.error("Error fetching happiness data:", error);
        res.status(500).json({ message: "Failed to fetch happiness data", error });
    }
};
exports.getHappinessData = getHappinessData;
const getSprints = async (req, res, db) => {
    const { projectGroupName } = req.query;
    try {
        const sprints = await db.all(`SELECT * FROM sprints WHERE projectGroupName = ? ORDER BY endDate ASC`, [projectGroupName]);
        res.json(sprints);
    }
    catch (error) {
        console.error('Error fetching sprints:', error);
        res.status(500).json({ message: 'Failed to fetch sprints', error });
    }
};
exports.getSprints = getSprints;
const getCurrentSprint = async (req, res, db) => {
    const { projectName } = req.query;
    try {
        const projectGroupNameObj = await db.get(`SELECT projectGroupName FROM project WHERE projectName = ?`, [projectName]);
        const projectGroupName = projectGroupNameObj === null || projectGroupNameObj === void 0 ? void 0 : projectGroupNameObj.projectGroupName;
        const sprints = await db.all(`SELECT * FROM sprints WHERE projectGroupName = ? ORDER BY endDate ASC`, [projectGroupName]);
        res.json(sprints);
    }
    catch (error) {
        console.error('Error fetching sprints:', error);
        res.status(500).json({ message: 'Failed to fetch sprints', error });
    }
};
exports.getCurrentSprint = getCurrentSprint;
const getProjectGitHubURL = async (req, res, db) => {
    const { projectName, email } = req.query;
    try {
        const projectURL = await db.get(`SELECT url FROM user_projects WHERE projectName = ? AND userEmail = ?`, [projectName, email]);
        if (projectURL) {
            res.json(projectURL);
        }
        else {
            console.warn(`No URL found for project: ${projectName} and email: ${email}`);
            res.status(404).json({ message: 'Project URL not found' });
        }
    }
    catch (error) {
        console.error('Error fetching project URL:', error);
        res.status(500).json({ message: 'Failed to fetch project URL', error });
    }
};
exports.getProjectGitHubURL = getProjectGitHubURL;
