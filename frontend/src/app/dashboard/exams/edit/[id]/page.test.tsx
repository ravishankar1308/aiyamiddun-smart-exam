'use client';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditExamPage from './page';
import { apiGetMetadata, apiGetQuestions, apiGetExam, apiUpdateExam, FullExam } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

// Mock the API functions and Next.js router
jest.mock('@/lib/api', () => ({
    apiGetMetadata: jest.fn(),
    apiGetQuestions: jest.fn(),
    apiGetExam: jest.fn(),
    apiUpdateExam: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useParams: jest.fn(),
}));

describe('EditExamPage', () => {
    const mockRouter = { push: jest.fn() };
    const mockGrades = [{ id: '1', name: 'Grade 10' }];
    const mockSubjects = [{ id: '1', name: 'Math', grade: 'Grade 10' }];
    const mockSections = [{ id: '1', name: 'Algebra', subject: 'Math' }];
    const mockQTypes = [{ id: '1', name: 'MCQ' }];
    const mockQuestions = [
        { id: 1, text: 'Question 1', subject: 'Math', section: 'Algebra', category: 'MCQ', difficulty: 'medium', options: '[]', marks: 5 },
        { id: 2, text: 'Question 2', subject: 'Math', section: 'Algebra', category: 'MCQ', difficulty: 'medium', options: '[]', marks: 5 },
    ];
    const mockExam: FullExam = {
        id: 1,
        title: 'Initial Exam Title',
        description: 'An exam for Grade 10 in Math.',
        subject_id: 1,
        duration_minutes: 45,
        classLevel: 'Grade 10',
        difficulty: 'medium',
        scheduledStart: '2024-01-01T10:00:00.000Z',
        scheduledEnd: '2024-01-01T11:00:00.000Z',
        isQuiz: true,
        questions: [mockQuestions[0]],
        author_id: 1,
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
    };

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useParams as jest.Mock).mockReturnValue({ id: '1' });
        (apiGetMetadata as jest.Mock)
            .mockResolvedValueOnce(mockGrades)
            .mockResolvedValueOnce(mockSubjects)
            .mockResolvedValueOnce(mockSections)
            .mockResolvedValueOnce(mockQTypes);
        (apiGetQuestions as jest.Mock).mockResolvedValue(mockQuestions);
        (apiGetExam as jest.Mock).mockResolvedValue(mockExam);
        (apiUpdateExam as jest.Mock).mockResolvedValue({});
        window.alert = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should load exam data and pre-populate the form', async () => {
        render(<EditExamPage />);

        expect(screen.getByText('Loading exam editor...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByLabelText('Exam Title')).toHaveValue('Initial Exam Title');
            expect(screen.getByLabelText('Duration (Mins)')).toHaveValue(45);
            expect(screen.getByLabelText('Class')).toHaveValue('Grade 10');
        });
        
        // Wait for the subject to be populated, which depends on async data loading
        await waitFor(() => {
            expect(screen.getByLabelText('Subject')).toHaveValue('Math');
        });

        // Check if the existing question is rendered
        expect(screen.getByText('Question 1')).toBeInTheDocument();
        expect(screen.getByText('Update Exam')).toBeInTheDocument();
    });

    it('should update the exam and redirect', async () => {
        render(<EditExamPage />);

        // Wait for the form to be populated
        await screen.findByLabelText('Exam Title');
        
        // Modify a field
        const titleInput = screen.getByLabelText('Exam Title');
        fireEvent.change(titleInput, { target: { value: 'Updated Exam Title' } });

        // Click the update button
        const updateButton = screen.getByText('Update Exam');
        fireEvent.click(updateButton);

        // Assert that the API was called with the correct data
        await waitFor(() => {
            expect(apiUpdateExam).toHaveBeenCalledWith('1', expect.objectContaining({
                title: 'Updated Exam Title',
                question_ids: [1], // From the initial mock exam
            }));
            expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/exams');
        });
    });

    // We can also add a test for replacing a question, similar to the new exam page test
    it('should allow replacing a question in the draft', async () => {
        render(<EditExamPage />);

        // Wait for the initial question to be loaded
        await screen.findByText('Question 1');
        
        // Mock that the available questions pool has more questions
        (apiGetQuestions as jest.Mock).mockResolvedValue([...mockQuestions, { id: 3, text: 'Question 3', subject: 'Math', section: 'Algebra', category: 'MCQ' }]);

        // Find the replace button for the first question
        const replaceButton = screen.getByTitle('Replace (Same Section: Algebra)');
        fireEvent.click(replaceButton);

        // Because replacement is random, we just check that an update happened.
        // A more robust test could mock the random selection.
        await waitFor(() => {
            // The original question might still be there if the random pool is small
            // but we expect the draft to be updated. Here we check for either of the other questions.
            const isQuestion2Present = screen.queryByText('Question 2');
            const isQuestion3Present = screen.queryByText('Question 3');
            expect(isQuestion2Present || isQuestion3Present).toBeInTheDocument();
        });
    });
});
