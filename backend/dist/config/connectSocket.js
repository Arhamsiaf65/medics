import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { createAdapter } from "@socket.io/redis-adapter";
import { getRedis } from "./redis.js";
let io = null;
export const initializeSocketServer = (server) => {
    if (!io) {
        io = new Server(server, {
            cors: { origin: "*" },
        });
        // Use Redis adapter to enable a scalable Pub/Sub model
        const pubClient = getRedis();
        const subClient = pubClient.duplicate();
        io.adapter(createAdapter(pubClient, subClient));
        console.log("socket initialized with Redis Pub/Sub Adapter");
    }
    return io;
};
export const getIO = () => {
    if (!io) {
        throw new Error("socket io is not created yet");
    }
    return io;
};
//# sourceMappingURL=connectSocket.js.map