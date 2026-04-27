import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

export const getTransporter = (): nodemailer.Transporter => {
    if (!transporter) {
        // Try Outlook SMTP first (more reliable than Gmail in cloud environments)
        if (process.env.EMAIL_SERVICE === 'outlook' || !process.env.EMAIL_USER?.includes('gmail')) {
            console.log("[Mailer] Using Outlook SMTP");
            transporter = nodemailer.createTransport({
                service: "outlook",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        } else {
            // Gmail with manual SMTP settings (sometimes more reliable)
            console.log("[Mailer] Using Gmail SMTP");
            transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                tls: {
                    ciphers: 'SSLv3'
                }
            });
        }

        // Test the connection
        transporter.verify((error, success) => {
            if (error) {
                console.error("[Mailer] SMTP connection failed:", error.message);
            } else {
                console.log("[Mailer] SMTP connection successful");
            }
        });
    }
    return transporter;
};
