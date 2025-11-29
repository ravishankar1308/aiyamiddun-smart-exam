import { connection } from '../database';

/**
 * Fetches all exam results, filtering based on the user's role.
 * - Admins and Owners see all results.
 * - Teachers see results for exams they created.
 * - Students see their own results.
 * @param user - The authenticated user object, containing their id and role.
 */
export const getAllResults = async (user: any) => {
    let query = `
        SELECT 
            r.id, 
            r.score, 
            r.submitted_at, 
            u.name as student_name, 
            e.title as exam_title, 
            e.total_marks
        FROM results r
        JOIN users u ON r.user_id = u.id
        JOIN exams e ON r.exam_id = e.id
    `;
    const params: any[] = [];

    // Append WHERE clauses based on the user's role
    if (user.role === 'student') {
        query += ' WHERE r.user_id = ?';
        params.push(user.id);
    } else if (user.role === 'teacher') {
        query += ' WHERE e.created_by = ?';
        params.push(user.id);
    } else if (user.role !== 'admin' && user.role !== 'owner') {
        // If the role is something else, return an empty array
        return [];
    }

    query += ' ORDER BY r.submitted_at DESC';

    try {
        const [rows] = await connection.execute(query, params);
        return rows;
    } catch (error) {
        console.error("Error fetching results from the database:", error);
        throw new Error("Database query for results failed.");
    }
};
