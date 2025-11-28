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

    // 1. Validate required fields
    if (!title || !subject_id || !question_ids || !Array.isArray(question_ids) || question_ids.length === 0) {
        throw new Error('Title, subject_id, and a non-empty array of question_ids are required.');
    }

    // 2. Fetch full question objects based on question_ids
    const placeholders = question_ids.map(() => '?').join(',');
    const [questions]: any = await connection.execute(`SELECT * FROM questions WHERE id IN (${placeholders})`, question_ids);
    
    if (questions.length !== question_ids.length) {
        throw new Error('One or more questions could not be found.');
    }

    // 3. Create the questions snapshot
    const questionsSnapshot = JSON.stringify(questions);

    // 4. Prepare the data for insertion
    const query = `
        INSERT INTO exams (title, subject, duration, questionsSnapshot, classLevel, difficulty, scheduledStart, scheduledEnd, isQuiz, createdBy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
        title,
        BigInt(subject_id), // Ensure subject_id is a BigInt
        duration_minutes ?? null,
        questionsSnapshot,
        classLevel ?? null,
        difficulty || null,
        scheduledStart ?? null,
        scheduledEnd ?? null,
        isQuiz ?? false,
        createdBy ?? null
    ];

    // 5. Execute the insert query
    const [result] = await connection.execute<ResultSetHeader>(query, params);
    
    // 6. Return the created exam object
    return { id: result.insertId, ...examData };
};
export const deleteExam = async (id: string) => {
    const [result]: any = await connection.execute('DELETE FROM exams WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
        throw new Error('Exam not found');
    }
};

export const submitExam = async (examId: string, studentName: string, studentUsername: string, answers: any) => {
    // 1. Fetch the exam to get the correct answers from the snapshot
    const [examRows]: any = await connection.execute('SELECT questionsSnapshot FROM exams WHERE id = ?', [examId]);
    if (examRows.length === 0) {
        throw new Error('Exam not found');
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

    return { score, total };
};

export const getExamAnalytics = async (examId: string) => {
    const [results] = await connection.execute('SELECT studentName, score, total, submittedAt FROM quiz_results WHERE examId = ? ORDER BY score DESC', [examId]);
    return results;
};
