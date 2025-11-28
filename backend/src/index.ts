
import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import cors from 'cors'; // Import cors

// Import routes
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import questionRoutes from './routes/question.routes';
import examRoutes from './routes/exam.routes';
import aiRoutes from './routes/ai.routes';
import metadataRoutes from './routes/metadata.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001; // Changed to 3001 to avoid potential conflicts

// --- Database Connection ---
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aiyamiddun_digital',
};

// Export the connection so it can be used in services
export let connection: mysql.Connection;

async function connectToDatabase() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL Database!');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1); // Exit if the database connection fails
  }
}

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON bodies

// --- API Routes ---

// Basic test route
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Aiyamiddun Digital API - Now with a modular structure!' });
});

// Use the modular routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/metadata', metadataRoutes);

// --- Centralized Error Handling Middleware ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log the full error
  res.status(500).json({ error: 'Something broke on the server!' });
});

// --- Not Found Handler ---
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

// --- Start Server ---
connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
