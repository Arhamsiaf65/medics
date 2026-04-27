import { Worker } from "bullmq";
import { getTransporter } from "../utils/mailer.js";
import { Appointment } from "../models/appointment.model.js";
import { getRedis } from "../config/redis.js";
const statusMessages = {
    approved: {
        subject: "Appointment Approved ✅",
        heading: "Your appointment has been approved!",
        color: "#16a34a",
    },
    rejected: {
        subject: "Appointment Rejected ❌",
        heading: "Your appointment has been rejected.",
        color: "#dc2626",
    },
    cancelled: {
        subject: "Appointment Cancelled",
        heading: "Your appointment has been cancelled.",
        color: "#ea580c",
    },
    completed: {
        subject: "Appointment Completed ✔️",
        heading: "Your appointment has been marked as completed.",
        color: "#2563eb",
    },
};
const buildEmailHtml = (heading, color, appointment) => {
    const dateStr = new Date(appointment.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
        <div style="background: ${color}; padding: 28px 32px;">
            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600;">${heading}</h1>
        </div>
        <div style="padding: 28px 32px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Date</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 14px;">${dateStr}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #f3f4f6;">Time Slot</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 14px; border-top: 1px solid #f3f4f6;">${appointment.timeSlot}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #f3f4f6;">Status</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 14px; border-top: 1px solid #f3f4f6;">
                        <span style="background: ${color}15; color: ${color}; padding: 4px 12px; border-radius: 20px; text-transform: capitalize;">${appointment.status}</span>
                    </td>
                </tr>
            </table>
            <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                Medics Health Platform &mdash; This is an automated notification.
            </p>
        </div>
    </div>
    `;
};
export const startEmailWorker = () => {
    const worker = new Worker("emailQueue", async (job) => {
        console.log("[EmailWorker] Processing job:", job.data);
        const { appointmentId, status, email } = job.data;
        if (!email) {
            console.warn(`[EmailWorker] No email for appointment ${appointmentId}, skipping.`);
            return;
        }
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            console.warn(`[EmailWorker] Appointment ${appointmentId} not found, skipping.`);
            return;
        }
        const meta = statusMessages[status] || {
            subject: "Appointment Update",
            heading: `Your appointment status has been updated to: ${status}`,
            color: "#6b7280",
        };
        const transporter = getTransporter();
        await transporter.sendMail({
            from: `"Medics" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: meta.subject,
            html: buildEmailHtml(meta.heading, meta.color, appointment),
        });
        console.log(`[EmailWorker] Email sent to ${email} for appointment ${appointmentId} (${status})`);
    }, {
        connection: getRedis().options, // Use the same Redis connection as Socket.io
    });
    worker.on("failed", (job, err) => {
        console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
    });
    console.log("[EmailWorker] Worker started, listening for jobs...");
    return worker;
};
//# sourceMappingURL=email.worker.js.map