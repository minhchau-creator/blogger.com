import { createTransport } from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
    return createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your Gmail address
            pass: process.env.EMAIL_PASSWORD // Your Gmail App Password
        }
    });
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP - Blogger.com',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>You requested to reset your password. Use the OTP code below:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="color: #666;">This code will expire in 10 minutes.</p>
                    <p style="color: #666;">If you didn't request this, please ignore this email.</p>
                    <hr style="margin-top: 20px; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">Blogger.com - Your Blogging Platform</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return { success: false, error: error.message };
    }
};

// Send welcome email
export const sendWelcomeEmail = async (email, fullname) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Blogger.com!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome, ${fullname}!</h2>
                    <p>Thank you for joining Blogger.com. We're excited to have you as part of our community!</p>
                    <p>Start exploring amazing blogs and share your own stories with the world.</p>
                    <a href="${process.env.CLIENT_URL}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                        Get Started
                    </a>
                    <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">Blogger.com - Your Blogging Platform</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
};
