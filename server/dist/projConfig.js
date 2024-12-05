"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserGitHubUsername = exports.addGitHubUsername = exports.changeURL = exports.getURL = exports.addURL = exports.ChangePassword = exports.ChangeEmail = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ChangeEmail = async (req, res, db) => {
    const { newEmail, oldEmail } = req.body;
    if (!newEmail) {
        return res.status(400).json({ message: 'Please fill in new email!' });
    }
    else if (!newEmail.includes('@')) {
        return res.status(400).json({ message: 'Invalid email address' });
    }
    try {
        const projects = await db.all(`SELECT projectName FROM user_projects WHERE userEmail = ?`, [oldEmail]);
        await db.run(`UPDATE users SET email = ? WHERE email = ?`, [newEmail, oldEmail]);
        await db.run(`UPDATE user_projects SET userEmail = ? WHERE userEmail = ?`, [newEmail, oldEmail]);
        await db.run(`UPDATE happiness SET userEmail = ? WHERE userEmail = ?`, [newEmail, oldEmail]);
        for (let i = 0; i < projects.length; i++) {
            await db.run(`UPDATE "${projects[i].projectName}" SET memberEmail = ? WHERE memberEmail = ?`, [newEmail, oldEmail]);
        }
        res.status(200).json({ message: "Email updated successfully" });
    }
    catch (error) {
        console.error("Error updating email:", error);
        res.status(500).json({ message: "Failed to update email", error });
    }
};
exports.ChangeEmail = ChangeEmail;
const ChangePassword = async (req, res, db) => {
    const { email, password } = req.body;
    if (!password) {
        return res.status(400).json({ message: 'Please fill in new password!' });
    }
    else if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    try {
        await db.run(`UPDATE users SET password = ? WHERE email = ?`, [hashedPassword, email]);
        res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: "Failed to update password", error });
    }
};
exports.ChangePassword = ChangePassword;
const addURL = async (req, res, db) => {
    const { email, URL, project } = req.body;
    if (!URL) {
        return res.status(400).json({ message: 'Please fill in URL!' });
    }
    else if (!URL.includes('git')) {
        return res.status(400).json({ message: 'Invalid URL' });
    }
    try {
        await db.run(`UPDATE user_projects SET url = ? WHERE userEmail = ? AND projectName = ?`, [URL, email, project]);
        res.status(200).json({ message: "URL added successfully" });
    }
    catch (error) {
        console.error("Error adding URL:", error);
        res.status(500).json({ message: "Failed to add URL", error });
    }
};
exports.addURL = addURL;
const getURL = async (req, res, db) => {
    const { email, project } = req.query;
    try {
        const urlObj = await db.get(`SELECT url FROM user_projects WHERE userEmail = ? AND projectName = ?`, [email, project]);
        const url = urlObj ? urlObj.url : null;
        res.status(200).json({ url });
    }
    catch (error) {
        console.error("Error fetching URL:", error);
        res.status(500).json({ message: "Failed to fetch URL", error });
    }
};
exports.getURL = getURL;
const changeURL = async (req, res, db) => {
    const { email, URL, project } = req.body;
    if (!URL) {
        return res.status(400).json({ message: 'Please fill in URL!' });
    }
    else if (!URL.includes('git')) {
        return res.status(400).json({ message: 'Invalid URL' });
    }
    try {
        await db.run(`UPDATE user_projects SET url = ? WHERE userEmail = ? AND projectName = ?`, [URL, email, project]);
        res.status(200).json({ message: "URL added successfully" });
    }
    catch (error) {
        console.error("Error adding URL:", error);
        res.status(500).json({ message: "Failed to add URL", error });
    }
};
exports.changeURL = changeURL;
const addGitHubUsername = async (req, res, db) => {
    const { email, githubUsername } = req.body;
    if (!githubUsername) {
        return res.status(400).json({ message: 'Please fill in GitHub username!' });
    }
    try {
        await db.run(`UPDATE users SET githubUsername = ? WHERE email = ?`, [githubUsername, email]);
        res.status(200).json({ message: "GitHub username added successfully" });
    }
    catch (error) {
        console.error("Error adding GitHub username:", error);
        res.status(500).json({ message: "Failed to add GitHub username}", error });
    }
};
exports.addGitHubUsername = addGitHubUsername;
const getUserGitHubUsername = async (req, res, db) => {
    const { email } = req.query;
    try {
        const githubUsernameObj = await db.get(`SELECT githubUsername FROM users WHERE email = ?`, [email]);
        const githubUsername = githubUsernameObj ? githubUsernameObj.githubUsername : null;
        res.status(200).json({ githubUsername });
    }
    catch (error) {
        console.error("Error fetching GitHub username:", error);
        res.status(500).json({ message: "Failed to fetch GitHub username", error });
    }
};
exports.getUserGitHubUsername = getUserGitHubUsername;
