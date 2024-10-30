import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose'; // Import Mongoose for MongoDB connection

dotenv.config();

const app = express();

// Define allowed origins for CORS
const allowedOrigins = [process.env.CORS_ORIGIN, 'https://thelivingoutdoors.com', 'https://www.thelivingoutdoors.com'];


// Configure CORS middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin, like mobile apps or curl requests
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            const msg = 'The CORS policy for this site does not allow access from the specified origin.';
            callback(new Error(msg), false);
        }
    },
    credentials: true
}));


// Middleware for Content Security Policy (CSP)
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' blob:; style-src 'self' 'unsafe-inline'; connect-src 'self' https://www.google-analytics.com;"
    );
    next();
});

// Body parsing middleware
app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ extended: true, limit: '16mb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Import routes
import productRoutes from './routes/product.route.js';
import emailRoutes from './routes/email.route.js';

app.use('/api/v1/product', productRoutes);
app.use('/api/v1/email', emailRoutes);

// Test database connection route
app.get('/api/v1/test-db', async (req, res) => {
    if (mongoose.connection.readyState !== 1) { // 1 means connected
        console.error("Database connection not established.");
        return res.status(500).send("Database connection not established.");
    }

    try {
        const dbStatus = await mongoose.connection.db.admin().ping();
        if (dbStatus.ok) {
            res.status(200).send('Database connected successfully');
        } else {
            throw new Error("Ping failed");
        }
    } catch (error) {
        console.error("Database connection error:", error);
        res.status(500).send(`Database connection failed: ${error.message}`);
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.message);
    if (err instanceof Error && err.message.includes("CORS")) {
        res.status(403).json({ message: "CORS Error: Access denied from this origin." });
    } else {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default app;
