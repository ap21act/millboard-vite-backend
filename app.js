import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import productRoutes from './Routes/product.route.js';
import emailRoutes from './Routes/email.route.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ extended: true, limit: '16mb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Use routes
app.use('/api/v1/product', productRoutes); // This should match your route path
app.use('/api/v1/email', emailRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

export default app;
