const mockGenerateContent = jest.fn();

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockImplementation(() => ({
      generateContent: mockGenerateContent,
    })),
  })),
}));

import { generateQuestions, generateExamDraft } from '../ai.service';

describe('AI Service', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockGenerateContent.mockClear();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('generateQuestions', () => {
    it('should generate questions successfully and format them correctly', async () => {
      const mockApiResponse = '```json\n[\n  {\n    "text": "What is the capital of France?",\n    "options": ["Berlin", "Madrid", "Paris", "Rome"],\n    "answer": "Paris",\n    "subject": "Mathematics",\n    "classLevel": "Grade 10",\n    "difficulty": "Easy",\n    "category": "MCQ"\n  }\n]\n```';

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => mockApiResponse,
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
        status: 'pending',
      });
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the API call fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(generateQuestions('calculus', 'hard', 5)).rejects.toThrow('Failed to generate questions from AI.');
    });
  });

  describe('generateExamDraft', () => {
    it('should generate a complete exam draft successfully', async () => {
      const mockApiResponse = '```json\n{\n  "title": "Algebra Basics Exam",\n  "description": "A simple test on basic algebra.",\n  "difficulty": "Easy",\n  "classLevel": "Grade 8",\n  "subject": "Algebra",\n  "questions": [\n    {\n      "text": "Solve for x: 2x = 4",\n      "options": ["1", "2", "3", "4"],\n      "answer": "2"\n    }\n  ]\n}\n```';

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
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(generateExamDraft('geometry', 'medium', 10)).rejects.toThrow('Failed to generate exam draft from AI.');
    });
  });
});
