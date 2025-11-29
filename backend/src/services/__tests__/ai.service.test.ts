
import { generateQuestions, generateExamDraft } from '../ai.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the GoogleGenerativeAI library
jest.mock('@google/generative-ai', () => {
  const mockGenerateContent = jest.fn();
  const mockGetGenerativeModel = jest.fn(() => ({
    generateContent: mockGenerateContent,
  }));
  return {
    GoogleGenerativeAI: jest.fn(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
  };
});

const mockGenerateContent = new GoogleGenerativeAI('DUMMY_API_KEY').getGenerativeModel({model: 'gemini-1.5-pro'}).generateContent as jest.Mock;

describe('AI Service', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  // Tests for generateQuestions
  describe('generateQuestions', () => {
    it('should generate questions successfully and format them correctly', async () => {
      const mockApiResponse = '```json\n[\n  {\n    "text": "What is 2 + 2?",\n    "options": ["3", "4", "5", "6"],\n    "answer": "B"\n  }\n]\n```';

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => Promise.resolve(mockApiResponse),
        },
      });

      const questions = await generateQuestions('arithmetic', 'simple', 1);

      expect(questions).toHaveLength(1);
      expect(questions[0]).toEqual({
        text: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        answer: 'B',
        category: 'MCQ',
        difficulty: 'simple',
        status: 'pending',
        subject: 'Mathematics',
        classLevel: 'Grade 10',
      });
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should throw an error if the API call fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(generateQuestions('calculus', 'hard', 5)).rejects.toThrow('Failed to generate questions from AI.');
    });
  });

  // Tests for generateExamDraft
  describe('generateExamDraft', () => {
    it('should generate a complete exam draft successfully', async () => {
      const mockApiResponse = '```json\n{\n  "title": "Algebra Basics Exam",\n  "description": "A simple test on basic algebra.",\n  "questions": [\n    {\n      "text": "Solve for x: 2x = 4",\n      "options": ["1", "2", "3", "4"],\n      "answer": "B"\n    }\n  ]\n}\n```';

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => Promise.resolve(mockApiResponse),
        },
      });

      const examDraft = await generateExamDraft('algebra', 'easy', 1);

      expect(examDraft).toEqual({
        title: 'Algebra Basics Exam',
        description: 'A simple test on basic algebra.',
        questions: [
          {
            text: 'Solve for x: 2x = 4',
            options: ['1', '2', '3', '4'],
            answer: 'B',
          },
        ],
      });
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should throw an error if the exam draft generation fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(generateExamDraft('geometry', 'medium', 10)).rejects.toThrow('Failed to generate exam draft from AI.');
    });
  });
});
