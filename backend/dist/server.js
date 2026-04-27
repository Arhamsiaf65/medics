import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/connectDb.js";
// import { initializeRootAdmin } from "./utils/seedDb.js";
import { startEmailWorker } from "./workers/email.worker.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import appointmentRoutes from "./routes/appointments.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import { initializeSocketServer } from "./config/connectSocket.js";
import { initializeChatSocket } from "./chat/chat.js";
import http from "http";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initializeSocketServer(server);
initializeChatSocket();
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        process.env.FRONTEND_URL || "http://localhost:5173"
    ],
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
connectDB().then(async () => {
    // await initializeRootAdmin();
    startEmailWorker();
});
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/chat", chatRoutes);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map