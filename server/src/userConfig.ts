import { Database } from "sqlite";
import { Request, Response } from "express";
import { hashPassword } from "./hash";
import { DatabaseManager } from "./Models/DatabaseManager";

export const changeEmail = async (req: Request, res: Response, db: Database) => {
  const { newEmail, oldEmail } = req.body;
  if (!newEmail) {
    return res.status(400).json({ message: 'Please fill in new email!' });
  }
  else if (!newEmail.includes('@')) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  try {
    const userId = DatabaseManager.getUserIdFromEmail(db, oldEmail);
    await db.run(`UPDATE users SET email = ? WHERE id = ?`, [newEmail, userId]);
    res.status(200).json({ message: "Email updated successfully" });
  } catch (error) {
    console.error("Error updating email:", error);
    res.status(500).json({ message: "Failed to update email", error });
  }
}

export const changePassword = async (req: Request, res: Response, db: Database) => {
  const { userEmail, password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Please fill in new password!' });
  }
  else if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  const hashedPassword = await hashPassword(password);

  try {
    const userId = DatabaseManager.getUserIdFromEmail(db, userEmail);
    await db.run(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, userId]);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Failed to update password", error });
  }
}

export const setUserProjectURL = async (req: Request, res: Response, db: Database) => {
  const { userEmail, URL, projectName } = req.body;

  if (!URL) {
    return res.status(400).json({ message: 'Please fill in URL!' });
  }
  else if (!URL.includes('git')) {
    return res.status(400).json({ message: 'Invalid URL' });
  }

  try {
    const userId = DatabaseManager.getUserIdFromEmail(db, userEmail);
    const projectId = DatabaseManager.getProjectIdFromName(db, projectName);

    await db.run(`UPDATE user_projects SET url = ? WHERE userId = ? AND projectId = ?`, [URL, userId, projectId]);
    res.status(200).json({ message: "URL added successfully" });
  } catch (error) {
    console.error("Error adding URL:", error);
    res.status(500).json({ message: "Failed to add URL", error });
  }
}

export const getUserProjectURL = async (req: Request, res: Response, db: Database) => {
  const { userEmail, projectName } = req.query;

  if(!userEmail || !projectName) {
    return res.status(400).json({ message: 'User Email and Project Name are mandatory!' });
  }

  try {
    const userId = DatabaseManager.getUserIdFromEmail(db, userEmail.toString());
    const projectId = DatabaseManager.getProjectIdFromName(db, projectName.toString());
    const urlObj = await db.get(`SELECT url FROM user_projects WHERE userId = ? AND projectId = ?`, [userId, projectId]);
    const url = urlObj ? urlObj.url : null;
    res.status(200).json({ url });
  } catch (error) {
    console.error("Error fetching URL:", error);
    res.status(500).json({ message: "Failed to fetch URL", error });
  }
}

export const setUserGitHubUsername = async (req: Request, res: Response, db: Database) => {
  const { userEmail, newGithubUsername } = req.body;
  if (!newGithubUsername) {
    return res.status(400).json({ message: 'Please fill in GitHub username!' });
  }
  try {
    const userId = DatabaseManager.getUserIdFromEmail(db, userEmail);
    await db.run(`UPDATE users SET githubUsername = ? WHERE id = ?`, [newGithubUsername, userId]);
    res.status(200).json({ message: "GitHub username added successfully" });
  } catch (error) {
    console.error("Error adding GitHub username:", error);
    res.status(500).json({ message: "Failed to add GitHub username}", error });
  }
}

export const getUserGitHubUsername = async (req: Request, res: Response, db: Database) => {
  const { userEmail } = req.query;

  if(!userEmail) {
    return res.status(400).json({ message: 'User Email is mandatory!' });
  }

  try {
    const userId = DatabaseManager.getUserIdFromEmail(db, userEmail?.toString());
    const githubUsernameObj = await db.get(`SELECT githubUsername FROM users WHERE id = ?`, [userId]);
    const githubUsername = githubUsernameObj ? githubUsernameObj.githubUsername : null;
    res.status(200).json({ githubUsername });
  } catch (error) {
    console.error("Error fetching GitHub username:", error);
    res.status(500).json({ message: "Failed to fetch GitHub username", error });
  }
}

export const getUserRole = async (req: Request, res: Response, db: Database) => {
  const { userEmail } = req.query;

  try {
      const user = await db.get('SELECT userRole FROM users WHERE email = ?', [userEmail]);
      if (user) {
          res.json(user);
      } else {
          res.status(404).json({ message: "User not found" });
      }
  } catch (error) {
      console.error("Error during retrieving user role:", error);
      res.status(500).json({ message: "Failed to retrieve user role", error });
  }
}

export const updateUserRole = async (req: Request, res: Response, db: Database) => {
  const { email, role } = req.body;

  if (!email || !role) {
      return res.status(400).json({ message: "Please provide email and role" });
  }

  try {
      await db.run('UPDATE users SET userRole = ? WHERE email = ?', [role, email]);
      res.status(200).json({ message: "User role updated successfully" });
  } catch (error) {
      console.error("Error during updating user role:", error);
      res.status(500).json({ message: "Failed to update user role", error });
  }
}

