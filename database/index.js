import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        // Remove the deprecated options
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, {
            serverSelectionTimeoutMS: 30000, // Increase server selection timeout
            socketTimeoutMS: 45000, // Increase socket timeout

        });
        console.log('MongoDb connection successful');
    } catch (error) {
        console.error("MongoDB connection failed: Error ", error);
    }
}

export default connectDB;
