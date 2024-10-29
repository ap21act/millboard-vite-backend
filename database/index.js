import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        // Remove the deprecated options
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, {

        });
        console.log('MongoDb connection successful');
    } catch (error) {
        console.error("MongoDB connection failed: Error ", error);
    }
}

export default connectDB;
