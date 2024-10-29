import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Define allowed origins
const allowedOrigins = [process.env.CORS_ORIGIN, 'http://localhost:5173/']; // Add any other allowed origins here

// Configure CORS to allow multiple origins
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin, like mobile apps or curl requests
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ extended: true, limit: '16mb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Routes
import productRoutes from './routes/product.route.js';
import emailRoutes from './routes/email.route.js';

app.use('/api/v1/product', productRoutes);
app.use('/api/v1/email', emailRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

export default app;
