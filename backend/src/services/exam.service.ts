import { connection } from '../index';

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

export const createExam = async (exam: any) => {
    if (!exam.title || !exam.questionsSnapshot) {
        throw new Error('Title and questions are required.');
    }

    const query = `
        INSERT INTO exams (title, classLevel, subject, difficulty, duration, scheduledStart, scheduledEnd, isQuiz, questionsSnapshot, createdBy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result]: any = await connection.execute(query, [
        exam.title, exam.classLevel, exam.subject, exam.difficulty, exam.duration,
        exam.scheduledStart || null, exam.scheduledEnd || null, exam.isQuiz || false,
        JSON.stringify(exam.questionsSnapshot), exam.createdBy
    ]);
    
    return { id: result.insertId, ...exam };
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
