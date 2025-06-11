// D:\E learning\server\middlewares\sendmail.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'; // Make sure dotenv is imported to load environment variables
import { compile } from 'html-to-text';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables immediately in this module
dotenv.config(); // CRITICAL: Ensures process.env variables are available

// Configure HTML to text converter
const htmlToText = compile();

// Get current directory for template paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- HTML Template (Moved to before sendMail for proper scope) ---
const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        /* Base styles */
        body { font-family: 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; padding: 25px; text-align: center; }
        .header img { max-width: 150px; height: auto; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .otp-code { font-size: 2rem; letter-spacing: 0.5rem; color: #4CAF50; margin: 2rem 0; text-align: center; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 24px;
                  text-decoration: none; border-radius: 4px; font-weight: bold; }
        .footer { margin-top: 2rem; font-size: 0.8rem; color: #777; text-align: center; }

        /* Responsive */
        @media only screen and (max-width: 600px) {
            .container { padding: 10px; }
            .content { padding: 20px; }
            .otp-code { font-size: 1.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="cid:logo" alt="Braver connect Logo">
            <h2>Verify Your Email Address</h2>
        </div>
        <div class="content">
            <p>Hello {{name}},</p>
            <p>Thank you for registering with Braver Connect E-Learning Platform.</p>

            <p>Your verification code is:</p>
            <div class="otp-code">{{otp}}</div>

            <p class="note">This code expires in {{expiryMinutes}} minutes.</p>

            <p style="text-align: center;">
                <a href="{{verificationUrl}}" class="button">Verify Email Now</a>
            </p>

            <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>© {{currentYear}} Braver Connect E-Learning Platform</p>
            <p>Contact: support@braverconnect.com</p>
        </div>
    </div>
</body>
</html>`;

// Centralized Nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 465,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});


const sendMail = async (email, subject, data) => {
    try {
        if (!email || !subject) {
            throw new Error('Email and subject are required');
        }

        const verificationUrl = data.verificationUrl ||
            `${process.env.BASE_URL}/verify?token=${data.token}`;

        let populatedHtml = htmlTemplate
            .replace(/{{name}}/g, data.name || 'User')
            .replace(/{{otp}}/g, data.otp || '')
            .replace(/{{expiryMinutes}}/g, data.expiryMinutes || '10')
            .replace(/{{verificationUrl}}/g, verificationUrl)
            .replace(/{{subject}}/g, subject)
            .replace(/{{currentYear}}/g, new Date().getFullYear());

        const mailOptions = {
            from: `"Braver connect E-Learning" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: populatedHtml,
            text: htmlToText(populatedHtml),
            attachments: [{
                filename: 'logo.png',
                // CORRECTED PATH: If sendmail.js is in 'middlewares' and assets is in 'middlewares/assets'
                path: path.join(__dirname, 'assets/logo.png'), // <--- ONLY CHANGE IS HERE
                cid: 'logo'
            }]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}: ${info.messageId}`);

        return {
            success: true,
            messageId: info.messageId,
            previewUrl: nodemailer.getTestMessageUrl(info)
        };

    } catch (error) {
        console.error(`❌ Failed to send email to ${email}:`, error);
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

export default sendMail;