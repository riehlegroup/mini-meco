import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { Database } from 'sqlite';

dotenv.config();


export const register = async (req: Request, res: Response, db: any) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill in username, email and password!' });
  } else if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  } else if (!email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email address' });
  } else if (name.length < 3) {
    return res.status(400).json({ message: 'Name must be at least 3 characters long' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    res.status(201).json({ message: 'User registered successfully' });

    // Generate confirm email TOKEN
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      console.error('Email not found after registration');
      return;
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expire = Date.now() + 3600000; // 1 hour

    console.log(`Generated token: ${token}, Expiry time: ${expire}`);

    await db.run(
      'UPDATE users SET confirmEmailToken = ?, confirmEmailExpire = ? WHERE email = ?',
      [token, expire, email]
    );

    await sendConfirmEmail(email, token);

    console.log('Confirmation email sent');

  } catch (error) {
    console.error('Error during user registration:', error);
  }
};


export const login = async (req: Request, res: Response, db: Database) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const userStatus = user.status;
    if (userStatus == 'unconfirmed') {
      return res.status(400).json({ message: 'Email not confirmed. Please contact system admin.' });
    } else if (userStatus == 'suspended') {
      return res.status(400).json({ message: 'User account is suspended. Please contact system admin.' }); 
    } else if (userStatus == 'removed') {
      return res.status(400).json({ message: 'User account is removed. Please contact system admin.' });
    }

    


    const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(200).json({ token, name: user.name, email: user.email, githubUsername: user.githubUsername });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};


const sendPasswordResetEmail = async (email: string, token: string) => {

  const transporter = nodemailer.createTransport({
    host: 'smtp-auth.fau.de',
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
    to: email,
    subject: 'Password Reset',
    text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('There was an error sending the email');
  }
};

export const forgotPassword = async (req: Request, res: Response, db: Database) => {
  const { email } = req.body;

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expire = Date.now() + 3600000; // 1000 (1 sec) --> 1000 * 60  (1 min) --> 1000 * 60 * 60 (1 hour)

    console.log(`Generated token: ${token}, Expiry time: ${expire}`);

    await db.run(
      'UPDATE users SET resetPasswordToken = ?, resetPasswordExpire = ? WHERE email = ?',
      [token, expire, email]
    );

    await sendPasswordResetEmail(email, token);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const resetPassword = async (req: Request, res: Response, db: any) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  try {
    const currentTime = Date.now();
    const user = await db.get('SELECT * FROM users WHERE resetPasswordToken = ?', [token]);
    
    console.log('User retrieved from database:', user);

    if (!user || user.resetPasswordExpire < currentTime) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpire = NULL WHERE id = ?', [hashedPassword, user.id]);

    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendConfirmEmail = async (email: string, token: string) => {

  const transporter = nodemailer.createTransport({
    host: 'smtp-auth.fau.de',
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
    to: email,
    subject: 'Confirm Email',
    text: `You registered for Mini-Meco. Click the link to confirm your email: ${confirmedLink}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Confirm email sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending confirm email:', error);
    throw new Error('There was an error sending the email');
  }
}

  
export const confirmEmail = async (req: Request, res: Response, db: any) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  console.log('Token:', token);

  try {
    const currentTime = Date.now();
    const user = await db.get('SELECT * FROM users WHERE confirmEmailToken = ?', [token]);
    
    console.log('User retrieved from database:', user);

    if (!user || user.confirmEmailExpire < currentTime) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    await db.run('UPDATE users SET status = "confirmed", confirmEmailToken = NULL, confirmEmailExpire = NULL WHERE email = ?', [user.email]);

    res.status(200).json({ message: 'Email has been confirmed' });
  } catch (error) {
    console.error('Error in confirmEmail:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const sendConfirmationEmail = async (req: Request, res: Response, db: any) => {
  const { email } = req.body;
  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || user.status !== 'unconfirmed') {
      return res.status(400).json({ message: 'User not found or not unconfirmed' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expire = Date.now() + 3600000;

    await db.run('UPDATE users SET confirmEmailToken = ?, confirmEmailExpire = ? WHERE email = ?', [token, expire, email]);
    await sendConfirmEmail(email, token);

    res.status(200).json({ message: 'Confirmation email sent' });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    res.status(500).json({ message: 'Failed to send confirmation email' });
  }
};