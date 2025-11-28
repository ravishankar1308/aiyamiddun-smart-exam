import { connection } from '../index';

export const getAllQuestions = async (filters: any) => {
    const { classLevel, subject, status, authorUsername } = filters;

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

    const [rows] = await connection.execute(query, params);
    return rows;
};

export const createQuestion = async (q: any) => {
    if (!q.text || !q.classLevel || !q.subject || !q.section) {
        throw new Error('Required question fields are missing.');
    }

    const query = `
        INSERT INTO questions 
        (text, category, difficulty, answer, answerDetail, imageUrl, options, status, subject, classLevel, section, marks, authorUsername, authorRole)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result]: any = await connection.execute(query, [
        q.text, q.category, q.difficulty, q.answer,
        q.answerDetail, q.imageUrl, JSON.stringify(q.options),
        q.status || 'pending', q.subject, q.classLevel, q.section, q.marks,
        q.authorUsername, q.authorRole
    ]);
    
    return { id: result.insertId, ...q };
};

export const updateQuestion = async (id: string, q: any) => {
    const query = `
        UPDATE questions SET
        text = ?, category = ?, difficulty = ?, answer = ?, answerDetail = ?, 
        imageUrl = ?, options = ?, status = ?, subject = ?, classLevel = ?, 
        section = ?, marks = ? WHERE id = ?
    `;
    
    await connection.execute(query, [
        q.text, q.category, q.difficulty, q.answer, q.answerDetail,
        q.imageUrl, JSON.stringify(q.options), q.status, q.subject, 
        q.classLevel, q.section, q.marks, id
    ]);
};

export const updateQuestionStatus = async (id: string, status: string) => {
    if (!['approved', 'rejected', 'pending'].includes(status)) {
        throw new Error('Invalid status');
    }
    await connection.execute('UPDATE questions SET status = ? WHERE id = ?', [status, id]);
    return `Question status updated to ${status}`;
};

export const toggleQuestionDisable = async (id: string) => {
    const [rows]: any = await connection.execute('SELECT disabled FROM questions WHERE id = ?', [id]);
    if (rows.length === 0) {
        throw new Error('Question not found');
    }
    
    const currentStatus = rows[0].disabled;
    await connection.execute('UPDATE questions SET disabled = ? WHERE id = ?', [!currentStatus, id]);
    return `Question ${!currentStatus ? 'disabled' : 'enabled'} successfully`;
};

export const deleteQuestion = async (id: string) => {
    const [result]: any = await connection.execute('DELETE FROM questions WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
        throw new Error('Question not found');
    }
};
