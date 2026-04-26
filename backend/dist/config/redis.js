import { Redis } from "ioredis";
let redisInstance = null;
export const getRedis = () => {
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
//# sourceMappingURL=redis.js.map