import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Database } from "sqlite";
import { UserStatus, UserStatusEnum } from "./userStatus";
import { Request, Response, NextFunction } from "express";
import { ObjectHandler } from "./ObjectHandler";
import { comparePassword, hashPassword } from "./hash";
import { Password } from "./Models/Password";
import { DatabaseSerializableFactory } from './Serializer/DatabaseSerializableFactory';
import { DatabaseWriter } from './Serializer/DatabaseWriter';
import { DatabaseResultSetReader } from './Serializer/DatabaseResultSetReader';
import { User } from "./Models/User";
import { Email } from './email';

dotenv.config();

const secret = process.env.JWT_SECRET || "your_jwt_secret";


export const sendConfirmEmail = async (email: Email, token: string) => {

  const transporter = nodemailer.createTransport({
    host: "smtp-auth.fau.de",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER_FAU,
      pass: process.env.EMAIL_PASS_FAU,
    },
  });
  const confirmedLink = `http://localhost:5173/confirmedEmail?token=${token}`;

  const mailOptions = {
    from: '"Mini-Meco" <shu-man.cheng@fau.de>',
    to: email.toString(),
    subject: 'Confirm Email',
    text: `You registered for Mini-Meco. Click the link to confirm your email: ${confirmedLink}`,
  };

  try {
    // @todo: Uncomment the following lines to send email
    // const info = await transporter.sendMail(mailOptions);
    // console.log('Confirm email sent: %s', info.messageId);
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending confirm email:", error);
    throw new Error("There was an error sending the email");
  }
};

export const register = async (req: Request, res: Response, db: Database) => {
  const { name, email, password } = req.body;
  const passwordObj = Password.create(password);

  if (!name || !email || !passwordObj) {
    return res
      .status(400)
      .json({ message: "Please fill in username, email and password!" });
  } else if (passwordObj.getStrength() < 3) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and should contain upper and lower case letters as well as numbers or special characters",
    });
  } else if(typeof email !== 'string') {
    return res.status(400).json({ message: 'email has not the right format' });
  } else if (name.length < 3) {
    return res
      .status(400)
      .json({ message: "Name must be at least 3 characters long" })
    };
    let validatedEmail: Email;
    try {
      validatedEmail = new Email(email as string);
    } catch (IllegalArgumentException) {
      return res.status(400).json({ message: 'Invalid email address' });
  }

  const hashedPassword = await hashPassword(passwordObj.toString());

  try {
    const writer = new DatabaseWriter(db);
    const dbsf = new DatabaseSerializableFactory(db);
    const oh = new ObjectHandler();
    
    const u = await dbsf.create("User") as User;
    u.setName(name);
    u.setEmail(new Email(email));
    u.setPassword(hashedPassword);
    writer.writeRoot(u);
    res.status(201).json({ message: 'User registered successfully' });

    // Generate confirm email TOKEN
    if (!oh.getUserByMail(email, db)) {
      console.error('Email not found after registration');
      return;
    }

    const token = crypto.randomBytes(20).toString("hex");
    const expire = Date.now() + 3600000; // 1 hour

    console.log(`Generated token: ${token}, Expiry time: ${expire}`);

    u.setConfirmEmailToken(token);
    u.setConfirmEmailExpire(expire);
    writer.writeRoot(u);

    await sendConfirmEmail(validatedEmail, token);

    console.log("Confirmation email sent");
  } catch (error) {
    console.error("Error during user registration:", error);
  }
};

export const login = async (req: Request, res: Response, db: Database) => {
  const { email, password } = req.body;
  const passwordObj = Password.create(password);
  if (!email || !passwordObj || typeof email !== 'string') {
    return res.status(400).json({ message: "Email and password are required" });
  }

  let validatedEmail: Email;
  try {
    validatedEmail = new Email(email as string);
  } catch (IllegalArgumentException) {
    return res.status(400).json({ message: 'Invalid email address' });
  }


  try {
    const oh = new ObjectHandler();
    const user = await oh.getUserByMail(email, db);
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const userPassword = user.getPassword();
    if (userPassword === null) {
      return res.status(400).json({ message: 'No password set for user' });
    } else {
      const isValidPassword = await comparePassword(
        passwordObj.toString(),
        userPassword
      );
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }
    }

    let st: string = user.getStatus();
    let userStatus: UserStatus = new UserStatus(st as UserStatusEnum);
    if (userStatus.getStatus() == UserStatusEnum.unconfirmed) {
      return res
        .status(400)
        .json({ message: "Email not confirmed. Please contact system admin." });
    } else if (userStatus.getStatus() == UserStatusEnum.suspended) {
      return res.status(400).json({
        message: "User account is suspended. Please contact system admin.",
      });
    } else if (userStatus.getStatus() == UserStatusEnum.removed) {
      return res.status(400).json({
        message: "User account is removed. Please contact system admin.",
      });
    }

    const token = jwt.sign({ id: user.getId() }, "your_jwt_secret", {
      expiresIn: "1h",
    });
    res.status(200).json({
      token,
      name: user.getName(),
      email: user.getEmailString(),
      githubUsername: user.getGithubUsername(),
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

export const checkOwnership = (db: Database, oh: ObjectHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        try {
            const decoded = jwt.verify(token, secret) as { id: string; email: string };
            const userFromTokenId = await oh.getUser(Number(decoded.id), db);
            const userFromParamsId = await oh.getUserByMail(req.body.email, db);

            if(!userFromTokenId || !userFromParamsId) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (userFromTokenId?.getName() !== "admin" && userFromParamsId?.getName() !== userFromTokenId?.getName()) {
                return res.status(403).json({ message: 'Forbidden: You can only edit your own data' });
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    };
};

const sendPasswordResetEmail = async (email: Email, token: string) => {

  const transporter = nodemailer.createTransport({
    host: "smtp-auth.fau.de",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER_FAU,
      pass: process.env.EMAIL_PASS_FAU,
    },
  });

  const resetLink = `http://localhost:5173/resetPassword?token=${token}`;

  const mailOptions = {
    from: '"Mini-Meco" <shu-man.cheng@fau.de>',
    to: email.toString(),
    subject: 'Password Reset',
    text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
  };

  try {
    // @todo: Uncomment the following lines to send email
    // const info = await transporter.sendMail(mailOptions);
    // console.log('Password reset email sent: %s', info.messageId);
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("There was an error sending the email");
  }
};

export const forgotPassword = async (req: Request, res: Response, db: Database) => {
  let email: Email;
  if (!req.body.email || typeof req.body.email !== 'string') {
    return res.status(400).json({ message: 'User email is required' });
  }
  try {
    email = new Email(req.body.email as string); // Validate and construct the Email instance
  } catch (IllegalArgumentException) {
  return res.status(400).json({ message: 'Invalid email address' });
}


  try {
    const oh = new ObjectHandler();
    const writer = new DatabaseWriter(db);
    const user = await oh.getUserByMail(email.toString(), db);
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    const expire = Date.now() + 3600000; // 1000 (1 sec) --> 1000 * 60  (1 min) --> 1000 * 60 * 60 (1 hour)

    console.log(`Generated token: ${token}, Expiry time: ${expire}`);

    user.setResetPasswordToken(token);
    user.setResetPasswordExpire(expire);
    writer.writeRoot(user);

    await sendPasswordResetEmail(email, token);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  db: Database
) => {
  const { token, newPassword } = req.body;
  const newPasswordObj = Password.create(newPassword);

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Token and new password are required" });
  }

  try {
    const writer = new DatabaseWriter(db);

    const currentTime = Date.now();
    const user = await db.get('SELECT * FROM users WHERE resetPasswordToken = ?', [token]);
    const reader = new DatabaseResultSetReader(user, db);
    const u = await reader.readRoot(user) as User;
    
    console.log('User retrieved from database:', user);

    if (!u || u.getResetPasswordExpire() !== null || u.getResetPasswordExpire() as number < currentTime) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    } else if (newPasswordObj.getStrength() < 3) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and should contain upper and lower case letters as well as numbers or special characters",
      });
    }

    const hashedPassword = await hashPassword(newPasswordObj.toString());
    u.setPassword(hashedPassword);
    u.setResetPasswordExpire(null);
    u.setResetPasswordToken(null);
    writer.writeRoot(u);

    res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const confirmEmail = async (
  req: Request,
  res: Response,
  db: Database
) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  console.log("Token:", token);

  try {
    const writer = new DatabaseWriter(db);
    const currentTime = Date.now();
    const user = await db.get(
      "SELECT * FROM users WHERE confirmEmailToken = ?",
      [token]
    );
    const reader = new DatabaseResultSetReader(user, db);
    const u = await reader.readRoot(user) as User;
    
    console.log('User retrieved from database:', user);

    if (!user || user.confirmEmailExpire < currentTime) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    await db.run(
      'UPDATE users SET status = "confirmed", confirmEmailToken = NULL, confirmEmailExpire = NULL WHERE email = ?',
      [user.email.toString()]
    );
    u.setStatus("confirmed");
    u.setConfirmEmailToken(null);
    u.setConfirmEmailExpire(null);
    writer.writeRoot(u);

    res.status(200).json({ message: "Email has been confirmed" });
  } catch (error) {
    console.error("Error in confirmEmail:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendConfirmationEmail = async (
  req: Request, 
  res: Response, 
  db: Database
) => {
  let email: Email;
  if (!req.body.email || typeof req.body.email !== 'string') {
    return res.status(400).json({ message: 'User email is required' });
  } try {
    email = new Email(req.body.email as string);
  } catch (IllegalArgumentException) {
    return res.status(400).json({ message: 'Invalid email address' });
  }
  try {
    const oh = new ObjectHandler();
    const writer = new DatabaseWriter(db);
    const user = await oh.getUserByMail(email.toString(), db);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    let st: string = user.getStatus();
    let userStatus: UserStatus = new UserStatus(st as UserStatusEnum);
    if (userStatus.getStatus() != UserStatusEnum.unconfirmed) {
      return res
        .status(400)
        .json({ message: "User not found or not unconfirmed" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    const expire = Date.now() + 3600000;

    user.setConfirmEmailToken(token);
    user.setConfirmEmailExpire(expire);
    writer.writeRoot(user);
    await sendConfirmEmail(email, token);

    res.status(200).json({ message: "Confirmation email sent" });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    res.status(500).json({ message: "Failed to send confirmation email" });
  }
};
