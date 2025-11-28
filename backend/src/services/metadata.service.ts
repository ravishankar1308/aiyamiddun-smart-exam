import { connection } from '../index';

interface Metadata {
    classLevels: string[];
    subjects: string[];
    sections: string[];
    difficulties: string[];
    roles: string[];
    questionCategories: string[];
    questionStatuses: string[];
}

export const getMetadata = async (): Promise<Metadata> => {
    // In a real app, these would be fetched from dedicated tables in the database.
    // For simplicity, we are hardcoding them here as requested.
    
    const metadata: Metadata = {
        classLevels: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
        subjects: ['Mathematics', 'Science', 'History', 'English', 'Geography', 'Physics', 'Chemistry', 'Biology'],
        sections: ['Section A', 'Section B', 'Section C', 'Section D'],
        difficulties: ['Easy', 'Medium', 'Hard', 'Very Hard'],
        roles: ['admin', 'editor', 'viewer'], // User roles
        questionCategories: ['Multiple Choice', 'True/False', 'Fill in the Blanks', 'Short Answer'],
        questionStatuses: ['pending', 'approved', 'rejected'] // Statuses for questions
    };

    return metadata;
};
