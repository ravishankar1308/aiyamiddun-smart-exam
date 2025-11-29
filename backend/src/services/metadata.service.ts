
import { connection } from '../database';

const query = async (sql: string, params: any[] = []) => {
    try {
        const [rows] = await connection.query(sql, params);
        return rows as any[];
    } catch (error) {
        console.error(`Database query failed: ${sql}`, error);
        throw new Error('Database query failed.');
    }
};

export const getAllMetadata = async () => {
    const [grades, subjects, sections, questionTypes, difficulties, roles, questionStatuses] = await Promise.all([
        query('SELECT * FROM grades'),
        query('SELECT * FROM subjects'),
        query('SELECT * FROM sections'),
        query('SELECT * FROM question_types'),
        query('SELECT * FROM difficulties'),
        query('SELECT * FROM roles'),
        query('SELECT * FROM question_statuses'),
    ]);

    return {
        grades,
        subjects,
        sections,
        questionTypes,
        difficulties,
        roles,
        questionStatuses
    };
};

export const getMetadata = async (key: string) => {
    // A simple mapping from a URL-friendly key to a table name.
    const keyToTableMap: Record<string, string> = {
        grades: 'grades',
        subjects: 'subjects',
        sections: 'sections',
        questionTypes: 'question_types',
        difficulties: 'difficulties',
        roles: 'roles',
        questionStatuses: 'question_statuses'
    };

    const tableName = keyToTableMap[key];

    if (!tableName) {
        throw new Error(`Invalid metadata key: ${key}`);
    }

    return await query(`SELECT * FROM ${tableName}`);
};

// This function now assumes you're updating a specific table, not a JSON blob.
// This is a simplified example. A real implementation would be more complex.
export const updateMetadata = async (key: string, value: any) => {
    const tableName = key.endsWith('s') ? key.slice(0, -1) : key;
    const table = `${tableName}s`;
    // This is highly simplified. A real-world scenario would need more robust logic.
    // For example, this doesn't handle creating *new* metadata items, just updating existing ones.
    // It also assumes 'value' is an object with an 'id' and other fields to update.
    if (value && value.id) {
        const { id, ...fields } = value;
        const setClause = Object.keys(fields).map(field => `${field} = ?`).join(', ');
        const params = [...Object.values(fields), id];
        await query(`UPDATE ${table} SET ${setClause} WHERE id = ?`, params);
    }

    return getMetadata(key);
};
