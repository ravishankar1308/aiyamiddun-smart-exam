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
    const [rows] = await connection.execute<RowDataPacket[]>(`
        SELECT e.*, g.name as classLevel, s.name as subjectName
        FROM exams e 
        LEFT JOIN grades g ON e.grade_id = g.id
        LEFT JOIN subjects s ON e.subject_id = s.id
        WHERE e.id = ?
    `, [id]);
    if (rows.length === 0) {
        throw new Error('Exam not found');
    }
    const exam = rows[0];
    exam.questions = JSON.parse(exam.questions_snapshot || '[]');
    delete exam.questions_snapshot; 
    return exam;
};


export const createExam = async (examConfig: any, user: AuthenticatedUser) => {
    const { 
        title, description, subject_id, duration_minutes, 
        scheduledStart, scheduledEnd, question_ids, classLevel, difficulty
    } = examConfig;

    if (!title || !subject_id || !question_ids || question_ids.length === 0) {
        throw new Error('Missing required exam configuration fields.');
    }

    await connection.beginTransaction();

    try {
        const [questions] = await connection.execute<RowDataPacket[]>(
            `SELECT * FROM questions WHERE id IN (?)`,
            [question_ids]
        );

        if (questions.length !== question_ids.length) {
             throw new Error('One or more selected questions could not be found.');
        }

        const [subjectRows] = await connection.execute<RowDataPacket[]>('SELECT grade_id FROM subjects WHERE name = ? AND grade = ?', [subject_id, classLevel]);
        if (subjectRows.length === 0) {
            throw new Error('Invalid subject or class level combination.');
        }
        const grade_id = subjectRows[0].grade_id;
        const real_subject_id = subjectRows[0].id;

        const questionsSnapshot = JSON.stringify(questions);

        const insertQuery = `
            INSERT INTO exams (title, description, subject_id, grade_id, duration_minutes, start_time, end_time, questions_snapshot, created_by, difficulty)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.execute<ResultSetHeader>(insertQuery, [
            title, description, real_subject_id, grade_id, duration_minutes, scheduledStart || null, scheduledEnd || null, questionsSnapshot, user.id, difficulty
        ]);
        
        await connection.commit();
        return { id: result.insertId, ...examConfig };

    } catch (error) {
        await connection.rollback();
        console.error("Error creating exam:", error);
        throw error; 
    }
};

export const updateExam = async (id: number, examData: any) => {
    const { 
        title, description, subject_id, duration_minutes, 
        scheduledStart, scheduledEnd, question_ids, classLevel, difficulty
    } = examData;

    if (!title || !subject_id || !question_ids || question_ids.length === 0) {
        throw new Error('Missing required fields for updating an exam.');
    }

    await connection.beginTransaction();
    try {
        const [questions] = await connection.execute<RowDataPacket[]>(
            `SELECT * FROM questions WHERE id IN (?)`,
            [question_ids]
        );

        if (questions.length !== question_ids.length) {
            throw new Error('One or more selected questions could not be found.');
        }

        const [subjectRows] = await connection.execute<RowDataPacket[]>('SELECT id, grade_id FROM subjects WHERE name = ? AND grade_id = (SELECT id FROM grades WHERE name = ?)', [subject_id, classLevel]);
        if (subjectRows.length === 0) {
            throw new Error('Invalid subject or class level combination.');
        }
        const grade_id = subjectRows[0].grade_id;
        const real_subject_id = subjectRows[0].id;

        const questionsSnapshot = JSON.stringify(questions);

        const query = `
            UPDATE exams SET 
            title = ?, description = ?, subject_id = ?, grade_id = ?, duration_minutes = ?, 
            start_time = ?, end_time = ?, questions_snapshot = ?, difficulty = ?
            WHERE id = ?
        `;
        
        await connection.execute(query, [
            title, description, real_subject_id, grade_id, duration_minutes, 
            scheduledStart || null, scheduledEnd || null, questionsSnapshot, difficulty, id
        ]);

        await connection.commit();
        return getExamById(id);

    } catch (error) {
        await connection.rollback();
        console.error("Error updating exam:", error);
        throw error;
    }
};

// Delete an exam
export const deleteExam = async (id: number) => {
    const [result] = await connection.execute<ResultSetHeader>('DELETE FROM exams WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
        throw new Error('Exam not found or already deleted.');
    }
    return { message: 'Exam deleted successfully' };
};


export const submitExam = async (examId: number, studentId: number, answers: { [key:string]: any }) => {
    const exam = await getExamById(examId);
    if (!exam) throw new Error('Exam not found.');

    const questions = exam.questions;
    let score = 0;
    let totalMarks = 0;

    questions.forEach((q: any) => {
        totalMarks += (q.marks || 1); 
        const userAnswer = answers[q.id];
        const correctAnswer = q.answer; 

        if (userAnswer === undefined || userAnswer === null || correctAnswer === undefined || correctAnswer === null) {
            return; 
        }

        if (q.category === 'MCQ') {
            if (userAnswer === correctAnswer) {
                score += (q.marks || 1);
            }
        } else if (q.category === 'Multiple Answer') {
            const correctAnswers = correctAnswer.split(',').map((s: string) => s.trim());
            const userAnswerAsArray = Array.isArray(userAnswer) ? userAnswer : [];

            if (userAnswerAsArray.length === 0) return;

            const sortedCorrectAnswers = [...correctAnswers].sort();
            const sortedUserAnswers = [...userAnswerAsArray].sort();

            if (JSON.stringify(sortedCorrectAnswers) === JSON.stringify(sortedUserAnswers)) {
                score += (q.marks || 1);
            }
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

    return {
        examId,
        averageScore,
        submissionCount,
        questionStats: [], // Placeholder for more detailed stats
    };
};
