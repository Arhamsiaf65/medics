import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

export const getTransporter = (): nodemailer.Transporter => {
    if (!transporter) {
  {
            // Gmail with SSL on port 465 (more secure and sometimes more reliable)
            console.log("[Mailer] Using Gmail SMTP (SSL)");
           transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // FIXED
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
    connectionTimeout: 60000,
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
