// D:\E learning\server\test_email.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Explicitly tell dotenv where to find the .env file
// This assumes .env is in the same directory as this script (D:\E learning\server)
dotenv.config({ path: '.env' }); // <--- ADDED THIS

async function testEmail() {
    console.log('Testing email sending...');
    console.log('User:', process.env.EMAIL_USER);
    console.log('Pass:', process.env.EMAIL_PASS ? '******** (set)' : 'NOT SET');
    console.log('Host:', process.env.EMAIL_HOST); // <--- Check this output carefully!
    console.log('Port:', process.env.EMAIL_PORT);
    console.log('Secure:', process.env.EMAIL_SECURE);

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, // This should now be 'smtp.gmail.com'
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'janvierbraver2001@gmail.com', // Replace with an email you can check!
        subject: 'Test Email from Node.js Nodemailer',
        html: '<b>Hello from your Node.js server!</b>'
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        console.log('Message ID: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        console.error('Nodemailer Error Details:', error.response);
        console.error('Nodemailer Error Code:', error.code);
    }
}

testEmail();