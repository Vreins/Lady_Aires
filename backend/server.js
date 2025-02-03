import express from 'express';
import productRouter from './routers/productRouter.js';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose';
import userRouter from './routers/userRouter.js';
import orderRouter from './routers/orderRouter.js';
import uploadRouter from './routers/uploadRouter.js';

dotenv.config();
console.log("MongoDB URL:", process.env.MONGO_DB_URL);

// 

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*"}))
// app.disable("x-powered-by")
mongoose.connect(
  process.env.MONGO_DB_URL,
  {'family':4,}
  )
  .then(() => console.log('DB Connection Successfull'))
  .catch((err) => {console.error(err)});

  
  

//  This (the app.use) instead of the
// app.get('/', (req, res) => {
//   res.send('Server is ready');
// });
  // app.use(express.static(path.join(__dirname, '/frontend/build')));
  // app.get('*', (req, res) =>
  //   res.sendFile(path.join(__dirname, '/frontend/build/index.html'))
  // );

app.use('/api/uploads', uploadRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.get('/', (req, res) => {
  res.send('Server is ready');
});

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '/frontend/build/index.html'))
  );


app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});