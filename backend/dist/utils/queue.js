import { Queue } from "bullmq";
import { Redis } from "ioredis";
let emailQueue = null;
export const getEmailQueue = () => {
    if (!emailQueue) {
        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl) {
            throw new Error("❌ REDIS_URL is not defined");
        }
        const redis = new Redis(redisUrl);
        emailQueue = new Queue("emailQueue", {
            connection: redis,
        });
    }
    return emailQueue;
};
//# sourceMappingURL=queue.js.map