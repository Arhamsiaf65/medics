import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

export const getTransporter = (): nodemailer.Transporter => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    return transporter;
};
