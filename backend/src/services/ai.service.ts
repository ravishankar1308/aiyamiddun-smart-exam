import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in the environment variables.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateQuestion = async (prompt: string) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        
        // Basic parsing to structure the output
        return { generatedText: text }; 
    } catch (error) {
        console.error('API call to Gemini failed:', error);
        throw new Error('Failed to generate question from AI.');
    }
};
