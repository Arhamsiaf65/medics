import { Queue } from "bullmq";
let emailQueue = null;
export const getEmailQueue = () => {
    if (!emailQueue) {
        emailQueue = new Queue("emailQueue", {
            connection: {
                host: process.env.REDIS_HOST || "127.0.0.1",
                port: Number(process.env.REDIS_PORT) || 6379,
            },
        });
    }
    return emailQueue;
};
//# sourceMappingURL=queue.js.map