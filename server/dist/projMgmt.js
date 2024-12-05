"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProjects = exports.leaveProject = exports.joinProject = exports.getProjects = exports.getProjectGroups = exports.getSemesters = exports.createProject = exports.createProjectGroup = void 0;
const createProjectGroup = async (req, res, db) => {
    const { semester, projectGroupName } = req.body;
    const semesterRegex = /^(SS|WS)\d{2,4}$/; // Format: SS24 or WS2425
    if (!semester || !projectGroupName) {
        return res.status(400).json({ message: "Please fill in semester and project group name" });
    }
    else if (!semesterRegex.test(semester)) {
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
    }
    catch (error) {
        console.error("Error during project group creation:", error);
        res.status(500).json({ message: "Project group creation failed", error });
    }
};
exports.createProjectGroup = createProjectGroup;
const createProject = async (req, res, db) => {
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
    }
    catch (error) {
        console.error("Error during project creation:", error);
        res.status(500).json({ message: "Project creation failed", error });
    }
};
exports.createProject = createProject;
const getSemesters = async (req, res, db) => {
    try {
        const semesters = await db.all("SELECT DISTINCT semester FROM projectGroup");
        res.json(semesters);
    }
    catch (error) {
        console.error("Error during semester retrieval:", error);
        res.status(500).json({ message: "Failed to retrieve semesters", error });
    }
};
exports.getSemesters = getSemesters;
const getProjectGroups = async (req, res, db) => {
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
    }
    catch (error) {
        console.error("Error during project group retrieval:", error);
        res.status(500).json({ message: "Failed to retrieve project groups", error });
    }
};
exports.getProjectGroups = getProjectGroups;
const getProjects = async (req, res, db) => {
    const { projectGroupName } = req.query;
    if (!projectGroupName) {
        return res.status(400).json({ message: "Project group name is required" });
    }
    try {
        const projects = await db.all(`SELECT * FROM "${projectGroupName}"`);
        res.json(projects);
    }
    catch (error) {
        console.error("Error during project retrieval:", error);
        res.status(500).json({ message: `Failed to retrieve projects for project group ${projectGroupName}`, error });
    }
};
exports.getProjects = getProjects;
const joinProject = async (req, res, db) => {
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
    }
    catch (error) {
        console.error("Error during joining project:", error);
        res.status(500).json({ message: "Failed to join project", error });
    }
};
exports.joinProject = joinProject;
const leaveProject = async (req, res, db) => {
    const { projectName, memberEmail } = req.body;
    try {
        const isMember = await db.get(`SELECT * FROM "${projectName}" WHERE memberEmail = ?`, [memberEmail]);
        if (!isMember) {
            return res.status(400).json({ message: "You are not a member of this project" });
        }
        await db.run(`DELETE FROM "${projectName}" WHERE memberEmail = ?`, [memberEmail]);
        await db.run('DELETE FROM user_projects WHERE userEmail = ? AND projectName = ?', [memberEmail, projectName]);
        res.status(200).json({ message: "Left project successfully" });
    }
    catch (error) {
        console.error("Error during leaving project:", error);
        res.status(500).json({ message: "Failed to leave project", error });
    }
};
exports.leaveProject = leaveProject;
const getUserProjects = async (req, res, db) => {
    const { userEmail } = req.query;
    try {
        const projects = await db.all('SELECT projectName FROM user_projects WHERE userEmail = ?', [userEmail]);
        res.json(projects);
    }
    catch (error) {
        console.error("Error during retrieving user projects:", error);
        res.status(500).json({ message: "Failed to retrieve user projects", error });
    }
};
exports.getUserProjects = getUserProjects;
