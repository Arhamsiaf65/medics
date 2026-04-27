import { Queue } from "bullmq";
import { Redis } from "ioredis";

let emailQueue: Queue | null = null;

export const getEmailQueue = (): Queue => {
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