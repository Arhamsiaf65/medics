import mongoose from "mongoose";
import { log } from "node:console";
const connectDB = async () => {
    try {
        log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");
    }
    catch (error) {
        console.log(error);
    }
};
export default connectDB;
//# sourceMappingURL=connectDb.js.map