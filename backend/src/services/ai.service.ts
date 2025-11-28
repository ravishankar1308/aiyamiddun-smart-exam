// backend/src/services/ai.service.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

// Make sure to set your GEMINI_API_KEY in your .env file
if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates questions using the Gemini AI based on a given prompt.
 * 
 * @param topic The topic for the questions (e.g., "arithmetic").
 * @param difficulty The difficulty level (e.g., "simple").
 * @param count The number of questions to generate.
 * @returns A promise that resolves to an array of generated questions.
 */
export const generateQuestions = async (topic: string, difficulty: string, count: number) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `
            Generate ${count} multiple-choice questions on the topic of ${topic} 
            with a ${difficulty} difficulty level.
            For each question, provide:
            - The question text.
            - Four options (A, B, C, D).
            - The correct answer (just the letter, e.g., "A").
            
            Return the data in a valid, stringified JSON array format like this:
            [{"text":"...","options":["A","B","C","D"],"answer":"A"}, ...]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();

        // Clean the response to ensure it's valid JSON
        const jsonResponse = text.replace(/```json|```/g, '').trim();
        
        // Parse the JSON string into an array of question objects
        const questions = JSON.parse(jsonResponse);

        // Add additional fields to match your data model
        return questions.map(q => ({
            ...q,
            category: 'MCQ',
            difficulty: difficulty,
            status: 'pending', // Or 'approved' if you want to bypass approval
            subject: 'Mathematics', // This could be made dynamic
            classLevel: 'Grade 10', // This could be made dynamic
        }));

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate questions from AI.");
    }
};
