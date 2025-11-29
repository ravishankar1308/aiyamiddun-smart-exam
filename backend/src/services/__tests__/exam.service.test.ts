import { getExamAnalytics } from '../exam.service';
import * as examService from '../exam.service';
import * as db from '../../database';

// Mock the database connection before all tests
beforeAll(() => {
  jest.mock('../../database', () => ({
    connection: {
      execute: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
    },
  }));
});

describe('Exam Analytics', () => {
  it('should return zero for averageScore and submissionCount when there are no results', async () => {
    // Mock getExamResults to return an empty array
    const getExamResultsMock = jest.spyOn(examService, 'getExamResults').mockResolvedValue([]);

    const examId = 1;
    const analytics = await getExamAnalytics(examId);

    expect(analytics).toEqual({
      examId: examId,
      averageScore: 0,
      submissionCount: 0,
      questionStats: [],
    });

    // Restore the original function
    getExamResultsMock.mockRestore();
  });
});
