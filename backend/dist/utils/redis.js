import { Redis } from "ioredis";
let redisInstance = null;
export const getRedis = () => {
    if (!redisInstance) {
        redisInstance = new Redis({
            host: process.env.REDIS_HOST || "127.0.0.1",
            port: Number(process.env.REDIS_PORT) || 6379,
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