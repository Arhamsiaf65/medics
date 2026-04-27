import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

export const getTransporter = (): nodemailer.Transporter => {
    if (!transporter) {
        // Use SendGrid or similar service for production
        // Gmail SMTP is blocked by most cloud platforms
        transporter = nodemailer.createTransport({
            host: "smtp.sendgrid.net",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "apikey", // SendGrid uses 'apikey' as username
                pass: process.env.SENDGRID_API_KEY || process.env.EMAIL_PASS,
            },
        });

        // Fallback to Gmail if SendGrid not configured (for local development)
        if (!process.env.SENDGRID_API_KEY) {
            console.warn("⚠️  SENDGRID_API_KEY not found, falling back to Gmail (may not work in production)");
            transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        }
    }
    return transporter;
};
