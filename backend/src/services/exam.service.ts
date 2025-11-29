import { connection } from '../database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

interface AuthenticatedUser {
    id: number;
    role: 'student' | 'teacher' | 'admin' | 'owner';
}

// Get all exams with joins for readable data
export const getAllExams = async (filters: any) => {
    let query = `
        SELECT 
            e.id, e.title, e.description, e.duration_minutes, e.start_time, e.end_time, e.createdAt,
            s.name AS subject_name,
            g.name AS grade_name,
            u.username AS author_username
        FROM exams e
        LEFT JOIN subjects s ON e.subject_id = s.id
        LEFT JOIN grades g ON e.grade_id = g.id
        LEFT JOIN users u ON e.created_by = u.id
    `;
    const params: (string | number)[] = [];
    // Add filters if necessary
    query += ' ORDER BY e.createdAt DESC';
    const [rows] = await connection.execute(query, params);
    return rows;
};

// Get a single exam by its ID, parsing the snapshot
export const getExamById = async (id: number) => {
    const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM exams WHERE id = ?', [id]);
    if (rows.length === 0) {
        throw new Error('Exam not found');
    }
    const exam = rows[0];
    // Parse the snapshot to be used by the frontend
    exam.questions = JSON.parse(exam.questions_snapshot || '[]');
    delete exam.questions_snapshot; // Clean up the raw field
    return exam;
};

/**
 * The core exam building algorithm.
 * Fetches questions based on criteria and saves a snapshot.
 */
export const createExam = async (examConfig: any, user: AuthenticatedUser) => {
    const { 
        title, description, subject_id, grade_id, duration_minutes, 
        start_time, end_time, questionRequirements 
    } = examConfig;

    if (!title || !subject_id || !grade_id || !questionRequirements) {
        throw new Error('Missing required exam configuration fields.');
    }

    await connection.beginTransaction();

    try {
        const snapshotQuestions: any[] = [];
        // This loop builds the question set based on requirements
        for (const req of questionRequirements) {
            const { topic, question_type, count } = req;
            
            const query = `
                SELECT * FROM questions 
                WHERE subject_id = ? AND grade_id = ? AND approval_status = 'approved' AND disabled = FALSE
                AND topic = ? AND question_type = ?
                ORDER BY RAND() 
                LIMIT ?
            `;
            
            const [questions] = await connection.execute<RowDataPacket[]>(query, [subject_id, grade_id, topic, question_type, count]);
            
            if (questions.length < count) {
                await connection.rollback();
                throw new Error(`Not enough approved questions found for topic '${topic}' and type '${question_type}'. Found ${questions.length}, needed ${count}.`);
            }
            snapshotQuestions.push(...questions);
        }

        if (snapshotQuestions.length === 0) {
            await connection.rollback();
            throw new Error('No questions could be found for the specified criteria. The exam cannot be created.');
        }

        const questionsSnapshot = JSON.stringify(snapshotQuestions);

        const insertQuery = `
            INSERT INTO exams (title, description, subject_id, grade_id, duration_minutes, start_time, end_time, questions_snapshot, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.execute<ResultSetHeader>(insertQuery, [
            title, description, subject_id, grade_id, duration_minutes, start_time || null, end_time || null, questionsSnapshot, user.id
        ]);
        
        await connection.commit();
        return { id: result.insertId, ...examConfig };

    } catch (error) {
        await connection.rollback();
        console.error("Error creating exam:", error);
        throw error; // Re-throw the error to be handled by the controller
    }
};

// Update an exam's metadata (but not its questions)
export const updateExam = async (id: number, examData: any) => {
    const {
        title, description, subject_id, grade_id, 
        duration_minutes, start_time, end_time
    } = examData;

    const query = `
        UPDATE exams SET 
        title = ?, description = ?, subject_id = ?, grade_id = ?, 
        duration_minutes = ?, start_time = ?, end_time = ?
        WHERE id = ?
    `;
    await connection.execute(query, [title, description, subject_id, grade_id, duration_minutes, start_time, end_time, id]);
    return getExamById(id);
};

// Delete an exam
export const deleteExam = async (id: number) => {
    const [result] = await connection.execute<ResultSetHeader>('DELETE FROM exams WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
        throw new Error('Exam not found or already deleted.');
    }
    return { message: 'Exam deleted successfully' };
};

/**
 * Handles student submission for a quiz.
 * Calculates score based on the immutable exam snapshot.
 */
export const submitExam = async (examId: number, studentId: number, answers: { [key: number]: any }) => {
    const exam = await getExamById(examId);
    if (!exam) throw new Error('Exam not found.');

    const questions = exam.questions;
    let score = 0;
    let totalMarks = 0;

    questions.forEach((q: any) => {
        totalMarks += (q.marks || 1);
        const correctAnswer = q.options.find((opt: any) => opt.is_correct).option_text;
        const userAnswer = answers[q.id];
        if (userAnswer === correctAnswer) {
            score += (q.marks || 1);
        }
    });

    const query = `
        INSERT INTO quiz_results (exam_id, student_id, score, total_marks, answers)
        VALUES (?, ?, ?, ?, ?)
    `;
    await connection.execute(query, [examId, studentId, score, totalMarks, JSON.stringify(answers)]);
    return { score, totalMarks };
};

// Get all results for a specific exam for analytics
export const getExamResults = async (examId: number) => {
    const query = `
        SELECT 
            qr.score, qr.total_marks, qr.submittedAt,
            u.name as student_name
        FROM quiz_results qr
        JOIN users u ON qr.student_id = u.id
        WHERE qr.exam_id = ?
        ORDER BY qr.score DESC, qr.submittedAt ASC
    `;
    const [results] = await connection.execute(query, [examId]);
    return results;
};

export const getExamAnalytics = async (examId: number) => {
    const results = await getExamResults(examId) as RowDataPacket[];
    if (!results || results.length === 0) {
        return {
            examId,
            averageScore: 0,
            submissionCount: 0,
            questionStats: [],
        };
    }

    const submissionCount = results.length;
    const totalScore = results.reduce((acc: any, r: any) => acc + r.score, 0);
    const averageScore = totalScore / submissionCount;

    // This is a simplified version; real analytics would be more complex
    return {
        examId,
        averageScore,
        submissionCount,
        questionStats: [], // Placeholder for more detailed stats
    };
};
