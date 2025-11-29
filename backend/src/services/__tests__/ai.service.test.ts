import { generateQuestions, generateExamDraft } from '../ai.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Define a mock function that can be accessed by the tests
const mockGenerateContent = jest.fn();

// 2. Mock the entire library
jest.mock('@google/generative-ai', () => {
  // Mock the getGenerativeModel method to return an object with our mock function
  const mockGetGenerativeModel = jest.fn(() => ({
    generateContent: mockGenerateContent,
  }));

  // Mock the main constructor to return an object with the mocked method
  return {
    GoogleGenerativeAI: jest.fn(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
  };
});

describe('AI Service', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset mocks and spies before each test
    mockGenerateContent.mockClear();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // --- Tests for generateQuestions ---
  describe('generateQuestions', () => {
    it('should generate questions successfully and format them correctly', async () => {
      const mockApiResponse = '```json\n[\n  {\n    "text": "What is the capital of France?",\n    "options": ["Berlin", "Madrid", "Paris", "Rome"],\n    "answer": "Paris",\n    "subject": "Geography",\n    "classLevel": "Grade 5",\n    "difficulty": "Easy",\n    "category": "MCQ"\n  }\n]\n```';

      // Make the mock function resolve with the expected structure
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => mockApiResponse, // The text method returns the raw string
        },
      });

      const questions = await generateQuestions('Geography', 'Easy', 1);

      expect(questions).toHaveLength(1);
      expect(questions[0]).toEqual({
        text: 'What is the capital of France?',
        options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
        answer: 'Paris',
        subject: 'Mathematics',
        classLevel: 'Grade 10',
        difficulty: 'Easy',
        category: 'MCQ',
        // The service should add the status
        status: 'pending' 
      });
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the API call fails', async () => {
      // Configure the mock to reject the promise
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      // Verify that the service function throws the expected error
      await expect(generateQuestions('calculus', 'hard', 5)).rejects.toThrow('Failed to generate questions from AI.');
    });
  });

  // --- Tests for generateExamDraft ---
  describe('generateExamDraft', () => {
    it('should generate a complete exam draft successfully', async () => {
      const mockApiResponse = '```json\n{\n  "title": "Algebra Basics Exam",\n  "description": "A simple test on basic algebra.",\n  "difficulty": "Easy",\n  "classLevel": "Grade 8",\n  "subject": "Algebra",\n  "questions": [\n    {\n      "text": "Solve for x: 2x = 4",\n      "options": ["1", "2", "3", "4"],\n      "answer": "2"\n    }\n  ]\n}\n```';

      // Configure the mock to resolve with the API response
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => mockApiResponse,
        },
      });

      const examDraft = await generateExamDraft('algebra', 'easy', 1);

      expect(examDraft).toEqual({
        title: 'Algebra Basics Exam',
        description: 'A simple test on basic algebra.',
        difficulty: 'Easy',
        classLevel: 'Grade 8',
        subject: 'Algebra',
        questions: [
          {
            text: 'Solve for x: 2x = 4',
            options: ['1', '2', '3', '4'],
            answer: '2',
          },
        ],
      });
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the exam draft generation fails', async () => {
      // Configure the mock to reject the promise
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      // Verify that the service function throws the expected error
      await expect(generateExamDraft('geometry', 'medium', 10)).rejects.toThrow('Failed to generate exam draft from AI.');
    });
  });
});
