import { connection } from '../index';
import { ResultSetHeader } from 'mysql2';

// ... (keep getAllExams, deleteExam, submitExam, getExamAnalytics as they are)
export const getAllExams = async (filters: any) => {
    const { classLevel, subject } = filters;
    let query = 'SELECT * FROM exams';
    const params: (string | undefined)[] = [];
    const conditions: string[] = [];

    if (classLevel) { conditions.push('classLevel = ?'); params.push(classLevel as string); }
    if (subject) { conditions.push('subject = ?'); params.push(subject as string); }

    if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY createdAt DESC';

    const [rows] = await connection.execute(query, params);
    return rows;
};

export const getExamById = async (id: string) => {
    const [rows]: any = await connection.execute('SELECT * FROM exams WHERE id = ?', [id]);
    if (rows.length === 0) {
        throw new Error('Exam not found');
    }
    const exam = rows[0];
    const questions = JSON.parse(exam.questionsSnapshot || '[]');
    
    return {
        ...exam,
        questions: questions,
        subject_id: parseInt(exam.subject, 10),
    };
};


export const createExam = async (examData: any) => {
    const {
        title,
        subject_id,
        duration_minutes,
        question_ids,
        classLevel,
        difficulty,
        scheduledStart,
        scheduledEnd,
        isQuiz,
        createdBy
    } = examData;

    if (!title || !subject_id || !question_ids || !Array.isArray(question_ids) || question_ids.length === 0) {
        throw new Error('Title, subject_id, and a non-empty array of question_ids are required.');
    }

    const placeholders = question_ids.map(() => '?').join(',');
    const [questions]: any = await connection.execute(`SELECT * FROM questions WHERE id IN (${placeholders})`, question_ids);
    
    if (questions.length !== question_ids.length) {
        throw new Error('One or more questions could not be found.');
    }

    const questionsSnapshot = JSON.stringify(questions);

    const query = `
        INSERT INTO exams (title, subject, duration, questionsSnapshot, classLevel, difficulty, scheduledStart, scheduledEnd, isQuiz, createdBy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
        title,
        subject_id, 
        duration_minutes ?? null,
        questionsSnapshot,
        classLevel ?? null,
        difficulty || null,
        scheduledStart ?? null,
        scheduledEnd ?? null,
        isQuiz ?? false,
        createdBy ?? null
    ];

    const [result] = await connection.execute<ResultSetHeader>(query, params);
    
    return { id: result.insertId, ...examData };
};

export const updateExam = async (id: string, examData: any) => {
    const {
        title,
        subject_id,
        duration_minutes,
        question_ids
    } = examData;

    if (!title || !subject_id) {
        throw new Error('Title and subject_id are required.');
    }

    let questionsSnapshot: string | null = null;
    if (question_ids && Array.isArray(question_ids) && question_ids.length > 0) {
        const placeholders = question_ids.map(() => '?').join(',');
        const [questions]: any = await connection.execute(`SELECT * FROM questions WHERE id IN (${placeholders})`, question_ids);
        if (questions.length !== question_ids.length) {
            throw new Error('One or more questions could not be found for snapshot update.');
        }
        questionsSnapshot = JSON.stringify(questions);
    }

    const fieldsToUpdate: string[] = [];
    const params: any[] = [];

    if (title) {
        fieldsToUpdate.push('title = ?');
        params.push(title);
    }
    if (subject_id) {
        fieldsToUpdate.push('subject = ?');
        params.push(subject_id);
    }
    if (duration_minutes) {
        fieldsToUpdate.push('duration = ?');
        params.push(duration_minutes);
    }
    if (questionsSnapshot) {
        fieldsToUpdate.push('questionsSnapshot = ?');
        params.push(questionsSnapshot);
    }

    if (fieldsToUpdate.length === 0) {
        return { message: "No fields to update" };
    }

    const query = `UPDATE exams SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    params.push(id);

    const [result] = await connection.execute<ResultSetHeader>(query, params);
    if (result.affectedRows === 0) {
        throw new Error('Exam not found or data is unchanged.');
    }

    return { id, ...examData };
};

export const deleteExam = async (id: string) => {
    const [result]: any = await connection.execute('DELETE FROM exams WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
        throw new Error('Exam not found');
    }
};

export const submitExam = async (examId: string, studentName: string, studentUsername: string, answers: any) => {
    const [examRows]: any = await connection.execute('SELECT questionsSnapshot FROM exams WHERE id = ?', [examId]);
    if (examRows.length === 0) {
        throw new Error('Exam not found');
    }
    const exam = examRows[0];
    const questions = exam.questionsSnapshot; 
    const questionsParsed = JSON.parse(questions);

    let score = 0;
    const total = questionsParsed.length;
    questionsParsed.forEach((q: any) => {
        if ((answers[q.id]?.trim() || '') === (q.answer?.trim() || '')) {
            score++;
        }
    });

    const query = `
        INSERT INTO quiz_results (examId, studentName, studentUsername, score, total, answers)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(query, [
        examId, studentName, studentUsername, score, total, JSON.stringify(answers)
    ]);

    return { score, total };
};

export const getExamAnalytics = async (examId: string) => {
    const [results] = await connection.execute('SELECT studentName, score, total, submittedAt FROM quiz_results WHERE examId = ? ORDER BY score DESC', [examId]);
    return results;
};
