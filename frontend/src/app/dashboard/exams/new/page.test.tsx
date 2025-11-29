'use client';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewExamPage from './page';
import { apiGetMetadata, apiGetQuestions, apiCreateExam } from '@/lib/api';
import { useRouter } from 'next/navigation';

// Mock the API functions and useRouter
jest.mock('@/lib/api', () => ({
    apiGetMetadata: jest.fn(),
    apiGetQuestions: jest.fn(),
    apiCreateExam: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('NewExamPage', () => {
    const mockRouter = { push: jest.fn() };
    const mockGrades = [{ id: '1', name: 'Grade 10' }];
    const mockSubjects = [{ id: '1', name: 'Math', grade: 'Grade 10' }];
    const mockSections = [{ id: '1', name: 'Algebra', subject: 'Math' }];
    const mockQTypes = [{ id: '1', name: 'MCQ' }];
    const mockQuestions = [
        { id: 1, text: 'Question 1', subject: 'Math', section: 'Algebra', category: 'MCQ', difficulty: 'medium', options: '[]', marks: 5 },
        { id: 2, text: 'Question 2', subject: 'Math', section: 'Algebra', category: 'MCQ', difficulty: 'medium', options: '[]', marks: 5 },
    ];

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (apiGetMetadata as jest.Mock)
            .mockResolvedValueOnce(mockGrades)
            .mockResolvedValueOnce(mockSubjects)
            .mockResolvedValueOnce(mockSections)
            .mockResolvedValueOnce(mockQTypes);
        (apiGetQuestions as jest.Mock).mockResolvedValue(mockQuestions);
        (apiCreateExam as jest.Mock).mockResolvedValue({});
        // Mock window.alert
        window.alert = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should load initial data and render the form', async () => {
        render(<NewExamPage />);

        expect(screen.getByText('Loading exam builder...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByLabelText('Exam Title')).toBeInTheDocument();
            expect(screen.getByLabelText('Class')).toBeInTheDocument();
            expect(screen.getByLabelText('Subject')).toBeInTheDocument();
            expect(screen.getByText('Generate Draft')).toBeInTheDocument();
        });

        expect(apiGetMetadata).toHaveBeenCalledWith('grades');
        expect(apiGetMetadata).toHaveBeenCalledWith('subjects');
        expect(apiGetMetadata).toHaveBeenCalledWith('sections');
        expect(apiGetMetadata).toHaveBeenCalledWith('questionTypes');
        expect(apiGetQuestions).toHaveBeenCalled();
    });

    it('should generate a draft when the button is clicked', async () => {
        render(<NewExamPage />);

        await screen.findByLabelText('Exam Title');

        fireEvent.change(screen.getByLabelText('Exam Title'), { target: { value: 'Test Exam' } });
        fireEvent.change(screen.getByLabelText('Class'), { target: { value: 'Grade 10' } });
        
        const subjectSelect = screen.getByLabelText('Subject');
        await waitFor(() => expect(subjectSelect).toBeEnabled());
        
        fireEvent.change(subjectSelect, { target: { value: 'Math' } });

        // Select question type and quantity
        const mcqCheckbox = await screen.findByLabelText('MCQ');
        fireEvent.click(mcqCheckbox);
        const quantityInput = await screen.findByDisplayValue('5');
        fireEvent.change(quantityInput, { target: { value: '2' } });

        fireEvent.click(screen.getByText('Generate Draft'));

        await waitFor(() => {
            expect(screen.getByText('Question 1')).toBeInTheDocument();
            expect(screen.getByText('Question 2')).toBeInTheDocument();
        });
    });

    it('should save the exam and redirect', async () => {
        render(<NewExamPage />);

        // First, generate a draft
        await screen.findByLabelText('Exam Title');
        fireEvent.change(screen.getByLabelText('Exam Title'), { target: { value: 'Test Exam' } });

        const mcqCheckbox = await screen.findByLabelText('MCQ');
        fireEvent.click(mcqCheckbox);
        const quantityInput = await screen.findByDisplayValue('5');
        fireEvent.change(quantityInput, { target: { value: '1' } });

        fireEvent.click(screen.getByText('Generate Draft'));

        // Now, save the exam
        const saveButton = await screen.findByText('Save Exam');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(apiCreateExam).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test Exam' }));
            expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/exams');
        });
    });
});
