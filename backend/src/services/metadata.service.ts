import { connection } from '../database';

interface MetadataSchema {
    grades: any[];
    subjects: any[];
    sections: any[];
    questionTypes: any[];
    difficulties: any[];
    roles: any[];
    questionStatuses: any[];
}

const getDefaultMetadata = (): MetadataSchema => ({
    grades: [{ id: 1, name: 'Grade 12', isActive: true}],
    subjects: [{ id: 1, name: 'Physics', isActive: true}],
    sections: [{ id: 1, name: 'Section A', isActive: true}],
    questionTypes: [{ id: 1, name: 'Multiple Choice', isActive: true}],
    difficulties: [],
    roles: [],
    questionStatuses: [],
});

const readMetadataStore = async (): Promise<Partial<MetadataSchema>> => {
    try {
        const [rows] = await connection.query('SELECT value FROM metadata WHERE `key` = ?', ['METADATA_STORE']);
        const data = rows as any[];
        if (data.length > 0 && data[0].value) {
            const storedData = JSON.parse(data[0].value);
            return { ...getDefaultMetadata(), ...storedData };
        }
        return getDefaultMetadata();
    } catch (error) {
        console.error("Error reading metadata store, returning default metadata:", error);
        return getDefaultMetadata();
    }
};

// This function is now more robust and does not depend on a UNIQUE index.
const writeMetadataStore = async (data: Partial<MetadataSchema>): Promise<void> => {
    try {
        const jsonData = JSON.stringify(data);
        const key = 'METADATA_STORE';

        // 1. Check if the key already exists.
        const [rows] = await connection.query('SELECT `key` FROM metadata WHERE `key` = ?', [key]);
        const existing = rows as any[];

        // 2. Perform either an UPDATE or an INSERT.
        if (existing.length > 0) {
            await connection.query('UPDATE metadata SET `value` = ? WHERE `key` = ?', [jsonData, key]);
        } else {
            await connection.query('INSERT INTO metadata (`key`, `value`) VALUES (?, ?)', [key, jsonData]);
        }
    } catch (error) {
        console.error("Error writing metadata store:", error);
        throw new Error('Failed to write metadata to the database.');
    }
};

export const getAllMetadata = async (): Promise<Partial<MetadataSchema>> => {
    return await readMetadataStore();
};

export const getMetadata = async (key: string): Promise<any> => {
    const allMetadata = await readMetadataStore();
    return allMetadata[key];
};

export const updateMetadata = async (key: string, value: any): Promise<{ key: string; value: any }> => {
    const allMetadata = await readMetadataStore();
    allMetadata[key] = value;
    await writeMetadataStore(allMetadata);
    return { key, value };
};
