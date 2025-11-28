
import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// --- Database Connection ---
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

let connection: mysql.Connection;

async function connectToDatabase() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL Database!');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
}

// --- Gemini AI Client ---
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set.');
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Middleware ---
app.use(express.json()); // To parse JSON bodies

// --- API Routes ---

// Basic test route
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Aiyamiddun Digital API' });
});

// AI Content Generation Route
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ generatedText: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// --- Auth Routes ---
app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        const [rows]: any = await connection.execute('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (rows.length > 0) {
            const user = rows[0];
            if (user.disabled) {
                return res.status(403).json({ error: 'Account disabled' });
            }
            res.json(user);
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/api/auth/register', async (req: Request, res: Response) => {
    const { name, username, password, role } = req.body;
    if (!name || !username || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        const [existingUsers]: any = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'Username taken' });
        }
        const [result]: any = await connection.execute('INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)', [name, username, password, role]);
        const newUser = { id: result.insertId, name, username, role, disabled: false };
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// --- User Management Routes ---
app.get('/api/users', async (req: Request, res: Response) => {
    try {
        const [rows] = await connection.execute('SELECT id, name, username, role, disabled FROM users');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/users', async (req: Request, res: Response) => {
    const { name, username, password, role } = req.body;
    // Simple validation
    if (!name || !username || !password || !role) {
        return res.status(400).json({ error: 'All user fields are required.' });
    }
    try {
        const [result]: any = await connection.execute(
            'INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)',
            [name, username, password, role]
        );
        res.status(201).json({ id: result.insertId, name, username, role, disabled: false });
    } catch (error) {
        console.error('Error creating user:', error);
        // Check for duplicate username error
        if ((error as any).code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Username already exists.' });
        }
        res.status(500).json({ error: 'Failed to create user.' });
    }
});

app.put('/api/users/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, username, password, role } = req.body;
    if (!name || !username || !password || !role) {
        return res.status(400).json({ error: 'All user fields are required.' });
    }
    try {
        await connection.execute(
            'UPDATE users SET name = ?, username = ?, password = ?, role = ? WHERE id = ?',
            [name, username, password, role, id]
        );
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error(`Error updating user ${id}:`, error);
        if ((error as any).code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Username already exists.' });
        }
        res.status(500).json({ error: 'Failed to update user.' });
    }
});

app.patch('/api/users/:id/toggle-disable', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // First, get the current disabled state
        const [rows]: any = await connection.execute('SELECT disabled FROM users WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const currentStatus = rows[0].disabled;

        // Toggle the status
        await connection.execute('UPDATE users SET disabled = ? WHERE id = ?', [!currentStatus, id]);
        res.json({ message: `User ${!currentStatus ? 'disabled' : 'enabled'} successfully` });
    } catch (error) {
        console.error(`Error toggling user ${id} status:`, error);
        res.status(500).json({ error: 'Failed to update user status.' });
    }
});

app.delete('/api/users/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [result]: any = await connection.execute('DELETE FROM users WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(204).send(); // No content
    } catch (error) {
        console.error(`Error deleting user ${id}:`, error);
        res.status(500).json({ error: 'Failed to delete user.' });
    }
});

// --- Question Bank Routes ---
app.get('/api/questions', async (req: Request, res: Response) => {
    // Filters from query parameters
    const { classLevel, subject, status, authorUsername } = req.query;

    let query = 'SELECT * FROM questions';
    const params: (string | undefined)[] = [];
    const conditions: string[] = [];

    if (classLevel) { conditions.push('classLevel = ?'); params.push(classLevel as string); }
    if (subject) { conditions.push('subject = ?'); params.push(subject as string); }
    if (status) { conditions.push('status = ?'); params.push(status as string); }
    if (authorUsername) { conditions.push('authorUsername = ?'); params.push(authorUsername as string); }

    if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY createdAt DESC';

    try {
        const [rows] = await connection.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/questions', async (req: Request, res: Response) => {
    const q = req.body;
    // Basic validation
    if (!q.text || !q.classLevel || !q.subject || !q.section) {
        return res.status(400).json({ error: 'Required question fields are missing.' });
    }

    const query = `
        INSERT INTO questions 
        (text, category, difficulty, answer, answerDetail, imageUrl, options, status, subject, classLevel, section, marks, authorUsername, authorRole)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    try {
        const [result]: any = await connection.execute(query, [
            q.text, q.category, q.difficulty, q.answer,
            q.answerDetail, q.imageUrl, JSON.stringify(q.options),
            q.status || 'pending', q.subject, q.classLevel, q.section, q.marks,
            q.authorUsername, q.authorRole
        ]);
        res.status(201).json({ id: result.insertId, ...q });
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ error: 'Failed to create question.' });
    }
});

app.put('/api/questions/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const q = req.body;
    const query = `
        UPDATE questions SET
        text = ?, category = ?, difficulty = ?, answer = ?, answerDetail = ?, 
        imageUrl = ?, options = ?, status = ?, subject = ?, classLevel = ?, 
        section = ?, marks = ? WHERE id = ?
    `;
    try {
        await connection.execute(query, [
            q.text, q.category, q.difficulty, q.answer, q.answerDetail,
            q.imageUrl, JSON.stringify(q.options), q.status, q.subject, 
            q.classLevel, q.section, q.marks, id
        ]);
        res.json({ message: 'Question updated successfully' });
    } catch (error) {
        console.error(`Error updating question ${id}:`, error);
        res.status(500).json({ error: 'Failed to update question.' });
    }
});

app.patch('/api/questions/:id/status', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body; // e.g., 'approved', 'rejected'
    if (!['approved', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    try {
        await connection.execute('UPDATE questions SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Question status updated to ${status}` });
    } catch (error) {
        console.error(`Error updating question ${id} status:`, error);
        res.status(500).json({ error: 'Failed to update status.' });
    }
});

app.patch('/api/questions/:id/toggle-disable', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [rows]: any = await connection.execute('SELECT disabled FROM questions WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Question not found' });
        
        const currentStatus = rows[0].disabled;
        await connection.execute('UPDATE questions SET disabled = ? WHERE id = ?', [!currentStatus, id]);
        res.json({ message: `Question ${!currentStatus ? 'disabled' : 'enabled'} successfully` });
    } catch (error) {
        console.error(`Error toggling question ${id} status:`, error);
        res.status(500).json({ error: 'Failed to update status.' });
    }
});

app.delete('/api/questions/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [result]: any = await connection.execute('DELETE FROM questions WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.status(204).send(); // No content
    } catch (error) {
        console.error(`Error deleting question ${id}:`, error);
        res.status(500).json({ error: 'Failed to delete question.' });
    }
});

// --- Exam Management Routes ---
app.get('/api/exams', async (req: Request, res: Response) => {
    const { classLevel, subject } = req.query;
    let query = 'SELECT * FROM exams';
    const params: (string | undefined)[] = [];
    const conditions: string[] = [];

    if (classLevel) { conditions.push('classLevel = ?'); params.push(classLevel as string); }
    if (subject) { conditions.push('subject = ?'); params.push(subject as string); }

    if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY createdAt DESC';

    try {
        const [rows] = await connection.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/exams', async (req: Request, res: Response) => {
    const exam = req.body;
    if (!exam.title || !exam.questionsSnapshot) {
        return res.status(400).json({ error: 'Title and questions are required.' });
    }

    const query = `
        INSERT INTO exams (title, classLevel, subject, difficulty, duration, scheduledStart, scheduledEnd, isQuiz, questionsSnapshot, createdBy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    try {
        const [result]: any = await connection.execute(query, [
            exam.title, exam.classLevel, exam.subject, exam.difficulty, exam.duration,
            exam.scheduledStart || null, exam.scheduledEnd || null, exam.isQuiz || false,
            JSON.stringify(exam.questionsSnapshot), exam.createdBy
        ]);
        res.status(201).json({ id: result.insertId, ...exam });
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ error: 'Failed to create exam.' });
    }
});

app.delete('/api/exams/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [result]: any = await connection.execute('DELETE FROM exams WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting exam ${id}:`, error);
        res.status(500).json({ error: 'Failed to delete exam.' });
    }
});

// --- Student-Facing Exam Routes ---
app.post('/api/exams/:id/submit', async (req: Request, res: Response) => {
    const { id: examId } = req.params;
    const { studentName, studentUsername, answers } = req.body;

    if (!studentUsername || !answers) {
        return res.status(400).json({ error: 'Student info and answers are required.' });
    }

    try {
        // 1. Fetch the exam to get the correct answers from the snapshot
        const [examRows]: any = await connection.execute('SELECT questionsSnapshot FROM exams WHERE id = ?', [examId]);
        if (examRows.length === 0) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        const exam = examRows[0];
        const questions = exam.questionsSnapshot; // This is a JSON string
        const questionsParsed = JSON.parse(questions);

        // 2. Calculate the score
        let score = 0;
        const total = questionsParsed.length;
        questionsParsed.forEach((q: any) => {
            // Ensure answers are trimmed and compared consistently
            if ((answers[q.id]?.trim() || '') === (q.answer?.trim() || '')) {
                score++;
            }
        });

        // 3. Save the result to the database
        const query = `
            INSERT INTO quiz_results (examId, studentName, studentUsername, score, total, answers)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(query, [
            examId, studentName, studentUsername, score, total, JSON.stringify(answers)
        ]);

        res.status(201).json({ score, total });

    } catch (error) {
        console.error(`Error submitting exam ${examId}:`, error);
        res.status(500).json({ error: 'Failed to submit exam.' });
    }
});

// --- Analytics Route ---
app.get('/api/exams/:id/analytics', async (req: Request, res: Response) => {
    const { id: examId } = req.params;
    try {
        const [results] = await connection.execute('SELECT studentName, score, total, submittedAt FROM quiz_results WHERE examId = ? ORDER BY score DESC', [examId]);
        res.json(results);
    } catch (error) {
        console.error(`Error fetching analytics for exam ${examId}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- Metadata Routes ---

// Get all metadata at once
app.get('/api/metadata', async (req: Request, res: Response) => {
    try {
        const [rows]: any = await connection.execute('SELECT setting_key, setting_value FROM metadata');
        const metadata = rows.reduce((acc: any, row: any) => {
            acc[row.setting_key] = JSON.parse(row.setting_value);
            return acc;
        }, {});
        res.json(metadata);
    } catch (error) {
        console.error('Error fetching metadata:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a specific metadata key
app.put('/api/metadata/:key', async (req: Request, res: Response) => {
    const { key } = req.params;
    const { value } = req.body; // Expects the full JSON array

    if (!value) {
        return res.status(400).json({ error: 'A `value` array is required.' });
    }

    try {
        const query = `
            INSERT INTO metadata (setting_key, setting_value) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE setting_value = ?;
        `;
        await connection.execute(query, [key, JSON.stringify(value), JSON.stringify(value)]);
        res.json({ message: `Metadata for '${key}' updated successfully.` });
    } catch (error) {
        console.error(`Error updating metadata for ${key}:`, error);
        res.status(500).json({ error: 'Failed to update metadata.' });
    }
});


// --- Error Handling Middleware ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// --- Start Server ---
connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
