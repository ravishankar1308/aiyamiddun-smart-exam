import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && options.body) {
        headers.append('Content-Type', 'application/json');
    }

    const fullUrl = `${API_URL}${path}`;

    try {
        const response = await fetch(fullUrl, { ...options, headers });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
            throw new Error(errorBody.error || `Request failed with status ${response.status}`);
        }
        
        if (response.status === 204) {
            return {} as T;
        }

        return await response.json() as T;

    } catch (error: any) {
        console.error(`API call to ${fullUrl} failed:`, error);
        throw error;
    }
}

// ===== Type Definitions =====

export type UserRole = 'student' | 'teacher' | 'admin' | 'owner';

export interface UserProfile {
    id: number;
    name: string;
    username: string;
    role: UserRole;
    disabled: boolean;
    createdAt: string;
}

export interface Grade {
    id: number;
    name: string;
}

export interface Subject {
    id: number;
    name: string;
    grade_id: number;
}

export interface Section {
    id: number;
    name: string;
    subject_id: number;
}

export interface QuestionType {
    id: number;
    name: string;
}

export interface Difficulty {
    id: number;
    name: string;
}

export interface AllMetadata {
    grades: Grade[];
    subjects: Subject[];
    sections: Section[];
    questionTypes: QuestionType[];
    difficulties: Difficulty[];
}

export interface Question {
    id: number;
    text: string;
    imageUrl?: string | null;
    options?: any; // JSON field
    correct_option?: number | null;
    subject_id: number;
    section_id?: number | null;
    question_type_id: number;
    difficulty_id: number;
    marks: number;
    author_id: number;
    status: 'pending' | 'approved' | 'rejected';
    is_disabled: boolean;
    created_at: string;
    updated_at: string;

    // Optional joined fields
    subject_name?: string;
    grade_name?: string;
    section_name?: string;
    question_type_name?: string;
    difficulty_name?: string;
    author_username?: string;
}

export interface Exam {
    id: number;
    title: string;
    description?: string;
    subject_id?: number;
    grade_id?: number;
    duration_minutes: number;
    scheduled_start?: string;
    author_id?: number;
    created_at: string;
    // Joined fields
    grade_name?: string;
    subject_name?: string;
    author_username?: string;
    question_count?: number;
}

export interface Result {
    id: number;
    exam_id: number;
    user_id: number;
    score: number;
    answers: any;
    submitted_at: string;
    exam_title?: string;
    user_name?: string;
}

export interface LoginResponse {
    token: string;
    user: UserProfile;
}

export interface DeletionResponse {
    message: string;
}

export interface SuccessMessage {
    message: string;
}


// ===== API Endpoint Functions =====

// Auth
export const apiLogin = (credentials: object) => fetchApi<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const apiRegister = (userData: Partial<UserProfile>) => fetchApi<LoginResponse>('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
export const apiFetchCurrentUser = () => fetchApi<{ user: UserProfile }>('/auth/me');

// Users
export const apiGetUsers = async (): Promise<UserProfile[]> => {
    const data = await fetchApi<{ users: UserProfile[] }>('/users');
    return data.users;
};
export const apiCreateUser = (userData: Partial<UserProfile>) => fetchApi<UserProfile>('/users', { method: 'POST', body: JSON.stringify(userData) });
export const apiUpdateUser = (id: string | number, userData: Partial<UserProfile>) => fetchApi<UserProfile>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) });
export const apiDeleteUser = (id: string | number) => fetchApi<DeletionResponse>(`/users/${id}`, { method: 'DELETE' });
export const apiToggleUserDisable = (id: string | number) => fetchApi<SuccessMessage>(`/users/${id}/toggle-disable`, { method: 'PATCH' });

// Metadata
export const apiGetAllMetadata = () => fetchApi<AllMetadata>('/metadata/all');
export const apiUpdateMetadata = (type: string, data: any) => {
    const body = typeof data === 'string' ? data : JSON.stringify(data);
    return fetchApi<any>(`/metadata/${type}`, { method: 'POST', body });
};

// Questions
export const apiGetAllQuestions = (filters: Record<string, string> = {}) => {
    const query = new URLSearchParams(filters).toString();
    return fetchApi<Question[]>(`/questions?${query}`);
};
export const apiGetQuestion = (id: string | number) => fetchApi<Question>(`/questions/${id}`);
export const apiCreateQuestion = (questionData: Partial<Question>) => fetchApi<Question>('/questions', { method: 'POST', body: JSON.stringify(questionData) });
export const apiUpdateQuestion = (id: string | number, questionData: Partial<Question>) => fetchApi<Question>(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(questionData) });
export const apiUpdateQuestionStatus = (id: string | number, status: string) => fetchApi<SuccessMessage>(`/questions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const apiToggleQuestionDisable = (id: string | number) => fetchApi<SuccessMessage>(`/questions/${id}/toggle-disable`, { method: 'PATCH' });
export const apiDeleteQuestion = (id: string | number) => fetchApi<DeletionResponse>(`/questions/${id}`, { method: 'DELETE' });

// AI Generator
export const apiGenerateQuestions = (params: { topic: string; difficulty: string; count: number; }) => fetchApi<Question[]>(`/generator/questions`, { method: 'POST', body: JSON.stringify(params) });

// Exams
export const apiGetExams = () => fetchApi<Exam[]>('/exams');
export const apiGetExam = (id: string | number) => fetchApi<Exam>(`/exams/${id}`);
export const apiCreateExam = (examData: Partial<Exam>) => fetchApi<Exam>('/exams', { method: 'POST', body: JSON.stringify(examData) });
export const apiUpdateExam = (id: string | number, examData: Partial<Exam>) => fetchApi<Exam>(`/exams/${id}`, { method: 'PUT', body: JSON.stringify(examData) });
export const apiDeleteExam = (id: string | number) => fetchApi<DeletionResponse>(`/exams/${id}`, { method: 'DELETE' });

// Results
export const apiGetResults = () => fetchApi<Result[]>('/results');
export const apiGetResult = (id: string | number) => fetchApi<Result>(`/results/${id}`);
