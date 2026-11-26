import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'dms-api' }));
app.use('/api', routes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Something went wrong' });
});

export default app;
