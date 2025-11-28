import { connection } from '../index';

interface MetadataSchema {
    grades: any[];
    subjects: any[];
    sections: any[];
    questionTypes: any[];
    difficulties: any[];
    roles: any[];
    questionStatuses: any[];
}

const METADATA_STORE_FILE = 'metadata_store.json';

const readMetadataStore = async (): Promise<Partial<MetadataSchema>> => {
    try {
        const data = await connection.query('SELECT value FROM metadata WHERE key = ?', ['METADATA_STORE']);
        if (data[0] && data[0][0]) {
            // @ts-ignore
            return JSON.parse(data[0][0].value);
        }
        return {
            grades: [{ id: 1, name: 'Grade 12', isActive: true}],
            subjects: [{ id: 1, name: 'Physics', isActive: true}],
            sections: [{ id: 1, name: 'Section A', isActive: true}],
            questionTypes: [{ id: 1, name: 'Multiple Choice', isActive: true}],
        };
    } catch (error) {
        console.error("Error reading metadata store:", error);
        return {};
    }
};

const writeMetadataStore = async (data: Partial<MetadataSchema>): Promise<void> => {
    try {
        const query = 'INSERT INTO metadata (key, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?';
        const jsonData = JSON.stringify(data);
        await connection.query(query, ['METADATA_STORE', jsonData, jsonData]);
    } catch (error) {
        console.error("Error writing metadata store:", error);
    }
};

export const getAllMetadata = async (): Promise<Partial<MetadataSchema>> => {
    return await readMetadataStore();
};

export const getMetadata = async (key: string): Promise<any> => {
    const allMetadata = await readMetadataStore();
    return allMetadata[key] || [];
};

export const updateMetadata = async (key: string, value: any): Promise<{ key: string; value: any }> => {
    const allMetadata = await readMetadataStore();
    allMetadata[key] = value;
    await writeMetadataStore(allMetadata);
    return { key, value };
};
