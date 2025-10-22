import nodemailer from "nodemailer";
import { IEmailService } from "./IEmailService";

/**
 * Production email service that uses local Mail Transfer Agent (sendmail/postfix).
 * Does not require SMTP credentials - relies on system-installed MTA like sendmail, postfix, or exim.
 * Fallback option when SMTP credentials are not available in production.
 */
export class LocalMtaEmailService implements IEmailService {
  private senderName: string;
  private senderAddress: string;

  constructor(senderName: string, senderAddress: string) {
    this.senderName = senderName;
    this.senderAddress = senderAddress;
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      sendmail: true,
      newline: 'unix',
      path: '/usr/sbin/sendmail',
    });

    const mailOptions = {
      from: `"${this.senderName}" <${this.senderAddress}>`,
      to,
      subject,
      text,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent via local MTA: %s", info.messageId);
    } catch (error) {
      console.error("Error sending email via local MTA:", error);
      throw new Error("There was an error sending the email via local MTA");
    }
  }
}
