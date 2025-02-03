import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';

import productRouter from './routers/productRouter.js';
import userRouter from './routers/userRouter.js';
import orderRouter from './routers/orderRouter.js';
import uploadRouter from './routers/uploadRouter.js';

dotenv.config();
console.log("MongoDB URL:", process.env.MONGO_DB_URL);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_DB_URL, { family: 4 })
  .then(() => console.log('DB Connection Successful'))
  .catch((err) => console.error(err));

const __dirname = path.resolve();

// Serve API Routes FIRST
app.use('/api/uploads', uploadRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

// Serve Static Files from React Frontend
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// Catch-All Route (must be AFTER API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

// Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});
