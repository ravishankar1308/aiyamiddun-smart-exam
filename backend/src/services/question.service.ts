
import { connection } from '../database';
import { RowDataPacket } from 'mysql2';

interface AuthenticatedUser {
    id: number;
    role: 'student' | 'teacher' | 'admin' | 'owner';
}

// Get all questions with joins for readable data
export const getAllQuestions = async (filters: any) => {
    let query = `
        SELECT 
            q.id, q.text, q.marks, q.status, q.is_disabled, q.created_at, q.updated_at,
            s.name AS subject_name,
            g.name AS grade_name,
            sec.name AS section_name,
            qt.name AS question_type_name,
            d.name AS difficulty_name,
            u.username AS author_username
        FROM questions q
        LEFT JOIN subjects s ON q.subject_id = s.id
        LEFT JOIN grades g ON s.grade_id = g.id
        LEFT JOIN sections sec ON q.section_id = sec.id
        LEFT JOIN question_types qt ON q.question_type_id = qt.id
        LEFT JOIN difficulties d ON q.difficulty_id = d.id
        LEFT JOIN users u ON q.author_id = u.id
    `;
    
    const params: (string | number)[] = [];
    const conditions: string[] = [];

    if (filters.grade_id) { conditions.push('s.grade_id = ?'); params.push(filters.grade_id); }
    if (filters.subject_id) { conditions.push('q.subject_id = ?'); params.push(filters.subject_id); }
    if (filters.status) { conditions.push('q.status = ?'); params.push(filters.status); }

    if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY q.created_at DESC';

    const [rows] = await connection.execute(query, params);
    return rows;
};

export const getQuestionById = async (id: number) => {
    const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM questions WHERE id = ?', [id]);
    if (rows.length === 0) {
        throw new Error('Question not found');
    }
    return rows[0];
};

// Create a new question with role-based approval status
export const createQuestion = async (q: any, user: AuthenticatedUser) => {
    const status = (user.role === 'admin' || user.role === 'owner') ? 'approved' : 'pending';

    const query = `
        INSERT INTO questions (text, options, subject_id, section_id, question_type_id, difficulty_id, marks, author_id, status, imageUrl)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result]: any = await connection.execute(query, [
        q.text,
        JSON.stringify(q.options ?? null),
        q.subject_id,
        q.section_id ?? null,
        q.question_type_id,
        q.difficulty_id,
        q.marks ?? 1,
        user.id, // Set the author ID
        status, // Set status based on role
        q.imageUrl ?? null
    ]);
    
    return { id: result.insertId, ...q, status };
};

// Update an existing question
export const updateQuestion = async (id: number, q: any) => {
    const query = `
        UPDATE questions SET
        text = ?, options = ?, subject_id = ?, section_id = ?, question_type_id = ?,
        difficulty_id = ?, marks = ?, imageUrl = ?
        WHERE id = ?
    `;
    
    await connection.execute(query, [
        q.text, JSON.stringify(q.options ?? null), q.subject_id, q.section_id, q.question_type_id,
        q.difficulty_id, q.marks, q.imageUrl ?? null, id
    ]);
    return getQuestionById(id);
};

// Update only the approval status of a question (for admins/owners)
export const updateQuestionStatus = async (id: number, status: 'approved' | 'rejected' | 'pending') => {
    if (!['approved', 'rejected', 'pending'].includes(status)) {
        throw new Error('Invalid status value');
    }
    await connection.execute('UPDATE questions SET status = ? WHERE id = ?', [status, id]);
    return { message: `Question status updated to ${status}` };
};

// Toggle the disabled state of a question
export const toggleQuestionDisable = async (id: number) => {
    const question: any = await getQuestionById(id);
    const newStatus = !question.is_disabled;
    await connection.execute('UPDATE questions SET is_disabled = ? WHERE id = ?', [newStatus, id]);
    return { message: `Question ${newStatus ? 'disabled' : 'enabled'} successfully` };
};

// Delete a question from the database
export const deleteQuestion = async (id: number) => {
    const [result]: any = await connection.execute('DELETE FROM questions WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
        throw new Error('Question not found or already deleted');
    }
    return { message: 'Question deleted successfully' };
};
