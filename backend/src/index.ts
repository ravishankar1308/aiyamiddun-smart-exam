import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectToDatabase } from './database';

// Import routes
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import questionRoutes from './routes/question.routes';
import examRoutes from './routes/exam.routes';
import aiRoutes from './routes/ai.routes';
import metadataRoutes from './routes/metadata.routes';
import resultsRoutes from './routes/results.routes';

const app: Express = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Aiyamiddun Digital API - Now with a modular structure!' });
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/metadata', metadataRoutes);
app.use('/api/results', resultsRoutes);

// --- Centralized Error Handling Middleware ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke on the server!' });
});

// --- Not Found Handler ---
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

// --- Start Server ---
if (process.env.NODE_ENV !== 'test') {
    connectToDatabase().then(() => {
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    });
}

export default app;
