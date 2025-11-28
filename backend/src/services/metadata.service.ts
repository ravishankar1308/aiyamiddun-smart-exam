import { connection } from '../index';

// This interface is now more of a schema definition for what COULD be in metadata
interface MetadataSchema {
    grades: any[]; // Changed from classLevels to grades to match frontend
    subjects: any[];
    sections: any[];
    questionTypes: any[]; // Added to match frontend
    difficulties: any[];
    roles: any[];
    questionStatuses: any[];
}

// This is a placeholder. In a real DB-backed scenario, this would query a table.
const METADATA_STORE_FILE = 'metadata_store.json';

// A helper function to read the stored metadata
const readMetadataStore = async (): Promise<Partial<MetadataSchema>> => {
    try {
        // In a real app, we would read from a database (e.g., SELECT * FROM metadata)
        const data = await connection.query('SELECT value FROM metadata WHERE key = ?', ['METADATA_STORE']);
        if (data[0] && data[0][0]) {
            // @ts-ignore
            return JSON.parse(data[0][0].value);
        }
        // Return a default structure if nothing is in the DB
        return {
            grades: [{ id: 1, name: 'Grade 12', isActive: true}],
            subjects: [{ id: 1, name: 'Physics', isActive: true}],
            sections: [{ id: 1, name: 'Section A', isActive: true}],
            questionTypes: [{ id: 1, name: 'Multiple Choice', isActive: true}],
        };
    } catch (error) {
        console.error("Error reading metadata store:", error);
        // If the table doesn't exist or there's an error, return a default object
        return {};
    }
};

// A helper to write to the stored metadata
const writeMetadataStore = async (data: Partial<MetadataSchema>): Promise<void> => {
    try {
        // In a real app, this would be an INSERT or UPDATE operation.
        // Using INSERT...ON DUPLICATE KEY UPDATE for simplicity.
        const query = 'INSERT INTO metadata (key, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?';
        const jsonData = JSON.stringify(data);
        await connection.query(query, ['METADATA_STORE', jsonData, jsonData]);
    } catch (error) {
        console.error("Error writing metadata store:", error);
    }
};

// Get a specific piece of metadata by key
export const getMetadata = async (key: string): Promise<{ key: string; value: any } | null> => {
    const allMetadata = await readMetadataStore();
    if (key in allMetadata) {
        return { key, value: allMetadata[key] };
    }
    return { key, value: [] }; // Always return a value to prevent 404s
};

// Update a specific piece of metadata
export const updateMetadata = async (key: string, value: any): Promise<{ key: string; value: any }> => {
    const allMetadata = await readMetadataStore();
    allMetadata[key] = value;
    await writeMetadataStore(allMetadata);
    return { key, value };
};
