
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
    const [grades, subjects, sections, questionTypes, difficulties] = await Promise.all([
        query('SELECT * FROM grades'),
        query('SELECT * FROM subjects'),
        query('SELECT * FROM sections'),
        query('SELECT * FROM question_types'),
        query('SELECT * FROM difficulties'),
    ]);

    return {
        grades,
        subjects,
        sections,
        questionTypes,
        difficulties,
    };
};

export const getMetadata = async (key: string) => {
    const keyToTableMap: Record<string, string> = {
        grades: 'grades',
        subjects: 'subjects',
        sections: 'sections',
        questionTypes: 'question_types',
        difficulties: 'difficulties',
    };

    const tableName = keyToTableMap[key];

    if (!tableName) {
        throw new Error(`Invalid metadata key: ${key}`);
    }

    return await query(`SELECT * FROM ${tableName}`);
};

export const updateMetadata = async (key: string, value: any) => {
    // This is a placeholder. A real implementation would require a more robust
    // and secure way to handle updates to these tables.
    console.warn('Metadata update functionality is currently disabled.');
    return { key, value };
};

