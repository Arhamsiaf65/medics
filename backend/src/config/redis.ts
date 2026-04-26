import { Redis } from "ioredis";

let redisInstance: Redis | null = null;

export const getRedis = (): Redis => {
    if (!redisInstance) {
        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
            throw new Error("❌ REDIS_URL is not defined");
        }

        redisInstance = new Redis(redisUrl, {
            maxRetriesPerRequest: null,
        });

        redisInstance.on("connect", () => {
            console.log("✅ Redis connected");
        });

        redisInstance.on("error", (err) => {
            console.error("❌ Redis error:", err);
        });
    }

    return redisInstance;
};