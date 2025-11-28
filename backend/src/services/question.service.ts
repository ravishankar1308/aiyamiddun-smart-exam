import { connection } from '../index';
import { RowDataPacket } from 'mysql2';

// Interface for a user object, typically from auth middleware
interface AuthenticatedUser {
    id: number;
    role: 'student' | 'teacher' | 'admin' | 'owner';
}

// Get all questions with joins for readable data
export const getAllQuestions = async (filters: any) => {
    let query = `
        SELECT 
            q.id, q.question_text, q.question_type, q.topic, q.difficulty, q.marks,
            q.approval_status, q.disabled, q.createdAt, q.updatedAt,
            s.name AS subject_name,
            g.name AS grade_name,
            u.username AS author_username
        FROM questions q
        LEFT JOIN subjects s ON q.subject_id = s.id
        LEFT JOIN grades g ON q.grade_id = g.id
        LEFT JOIN users u ON q.created_by = u.id
    `;
    
    const params: (string | number)[] = [];
    const conditions: string[] = [];

    if (filters.grade_id) { conditions.push('q.grade_id = ?'); params.push(filters.grade_id); }
    if (filters.subject_id) { conditions.push('q.subject_id = ?'); params.push(filters.subject_id); }
    if (filters.approval_status) { conditions.push('q.approval_status = ?'); params.push(filters.approval_status); }

    if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY q.createdAt DESC';

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
    const approval_status = (user.role === 'admin' || user.role === 'owner') ? 'approved' : 'pending';

    const query = `
        INSERT INTO questions (question_text, question_type, options, subject_id, grade_id, topic, difficulty, marks, created_by, approval_status, image_base64)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result]: any = await connection.execute(query, [
        q.question_text,
        q.question_type,
        JSON.stringify(q.options ?? null),
        q.subject_id,
        q.grade_id,
        q.topic ?? null,
        q.difficulty,
        q.marks ?? 1,
        user.id, // Set the creator ID
        approval_status, // Set status based on role
        q.image_base64 ?? null
    ]);
    
    return { id: result.insertId, ...q, approval_status };
};

// Update an existing question
export const updateQuestion = async (id: number, q: any) => {
    const query = `
        UPDATE questions SET
        question_text = ?, question_type = ?, options = ?, subject_id = ?, grade_id = ?,
        topic = ?, difficulty = ?, marks = ?, image_base64 = ?
        WHERE id = ?
    `;
    
    await connection.execute(query, [
        q.question_text, q.question_type, JSON.stringify(q.options ?? null), q.subject_id, q.grade_id,
        q.topic, q.difficulty, q.marks, q.image_base64 ?? null, id
    ]);
    return getQuestionById(id);
};

// Update only the approval status of a question (for admins/owners)
export const updateQuestionStatus = async (id: number, status: 'approved' | 'rejected' | 'pending') => {
    if (!['approved', 'rejected', 'pending'].includes(status)) {
        throw new Error('Invalid status value');
    }
    await connection.execute('UPDATE questions SET approval_status = ? WHERE id = ?', [status, id]);
    return { message: `Question status updated to ${status}` };
};

// Toggle the disabled state of a question
export const toggleQuestionDisable = async (id: number) => {
    const question = await getQuestionById(id);
    const newStatus = !question.disabled;
    await connection.execute('UPDATE questions SET disabled = ? WHERE id = ?', [newStatus, id]);
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