import nodemailer from "nodemailer";
let transporter = null;
export const getTransporter = () => {
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
        }
        else {
            // Gmail with SSL on port 465 (more secure and sometimes more reliable)
            console.log("[Mailer] Using Gmail SMTP (SSL)");
            transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // use SSL
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                // Additional options for Railway compatibility
                tls: {
                    rejectUnauthorized: false,
                    minVersion: 'TLSv1.2'
                },
                // Connection timeout and retry options
                connectionTimeout: 60000,
                greetingTimeout: 30000,
                socketTimeout: 60000
            });
        }
        // Test the connection
        transporter.verify((error, success) => {
            if (error) {
                console.error("[Mailer] SMTP connection failed:", error.message);
            }
            else {
                console.log("[Mailer] SMTP connection successful");
            }
        });
    }
    return transporter;
};
//# sourceMappingURL=mailer.js.map