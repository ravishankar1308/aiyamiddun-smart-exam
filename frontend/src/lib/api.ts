// lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// --- TYPE DEFINITIONS ---

export interface SuccessMessage {
    message: string;
}

export type DeletionResponse = null;

export type UserRole = 'student' | 'teacher' | 'admin' | 'owner';
export interface UserProfile {
  id: number;
  name: string;
  username: string;
  role: UserRole;
  disabled: boolean;
}
export interface UserModificationData {
    name: string;
    username: string;
    password: string;
    role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionStatus = 'pending' | 'approved' | 'rejected';
export interface Question {
    id: number;
    subject_id: number;
    topic_id: number;
    difficulty: QuestionDifficulty;
    question_text: string;
    options: string[];
    correct_option: number;
    author_id: number;
    status: QuestionStatus;
    is_disabled: boolean;
    created_at: string;
    updated_at: string;
}
export interface QuestionData extends Omit<Question, 'id' | 'author_id' | 'status' | 'is_disabled' | 'created_at' | 'updated_at'> {}

export interface Exam {
    id: number;
    title: string;
    description: string;
    subject_id: number;
    author_id: number;
    created_at: string;
    updated_at: string;
}
export interface ExamData extends Omit<Exam, 'id' | 'author_id' | 'created_at' | 'updated_at'> {
    question_ids: number[];
}
export interface FullExam extends Exam {
    questions: Question[];
}
export interface ExamSubmissionData {
    answers: Array<{ question_id: number; selected_option: number; }>;
}
export interface ExamResults {
    score: number;
    total: number;
}
export interface ExamAnalytics {
    examId: number;
    averageScore: number;
    submissionCount: number;
    questionStats: Array<{ question_id: number; correct_percentage: number; }>;
}

export interface Result {
    id: number;
    score: number;
    submitted_at: string;
    student_name: string;
    exam_title: string;
    total_marks: number;
}

export type ApiFilters = Record<string, string | number | boolean>;
export interface Metadata<T> { key: string; value: T; }

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const config: RequestInit = { ...options, headers };
  
  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'An unknown API error occurred' }));
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }
    if (response.status === 204) return null as T;
    return response.json();
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}

// --- AUTH APIS ---
export const apiLogin = (username: string, password: string) => 
  fetchApi<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  
export const apiRegister = (userData: UserModificationData) => 
  fetchApi<UserProfile>('/auth/register', { method: 'POST', body: JSON.stringify(userData) });

// --- USER MANAGEMENT APIS ---
export const apiGetUsers = () => fetchApi<UserProfile[]>('/users');
export const apiCreateUser = (userData: UserModificationData) => fetchApi<UserProfile>('/users', { method: 'POST', body: JSON.stringify(userData) });
export const apiUpdateUser = (id: string | number, userData: UserModificationData) => fetchApi<SuccessMessage>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) });
export const apiToggleUserDisable = (id: string | number) => fetchApi<SuccessMessage>(`/users/${id}/toggle-disable`, { method: 'PATCH' });
export const apiDeleteUser = (id: string | number) => fetchApi<DeletionResponse>(`/users/${id}`, { method: 'DELETE' });

// --- QUESTION APIS ---
export const apiGetQuestions = (filters: ApiFilters = {}) => {
  const query = new URLSearchParams(filters as Record<string, string>).toString();
  return fetchApi<Question[]>(`/questions?${query}`);
};
export const apiCreateQuestion = (questionData: QuestionData) => fetchApi<Question>('/questions', { method: 'POST', body: JSON.stringify(questionData) });
export const apiUpdateQuestion = (id: string | number, questionData: Partial<QuestionData>) => fetchApi<SuccessMessage>(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(questionData) });
export const apiUpdateQuestionStatus = (id: string | number, status: QuestionStatus) => fetchApi<SuccessMessage>(`/questions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const apiToggleQuestionDisable = (id: string | number) => fetchApi<SuccessMessage>(`/questions/${id}/toggle-disable`, { method: 'PATCH' });
export const apiDeleteQuestion = (id: string | number) => fetchApi<DeletionResponse>(`/questions/${id}`, { method: 'DELETE' });

// --- EXAM APIS ---
export const apiGetExams = (filters: ApiFilters = {}) => {
  const query = new URLSearchParams(filters as Record<string, string>).toString();
  return fetchApi<Exam[]>(`/exams?${query}`);
};
export const apiGetExam = (id: string | number) => fetchApi<FullExam>(`/exams/${id}`);
export const apiCreateExam = (examData: ExamData) => fetchApi<Exam>('/exams', { method: 'POST', body: JSON.stringify(examData) });
export const apiUpdateExam = (id: string | number, examData: Partial<ExamData>) => fetchApi<SuccessMessage>(`/exams/${id}`, { method: 'PUT', body: JSON.stringify(examData) });
export const apiDeleteExam = (id: string | number) => fetchApi<DeletionResponse>(`/exams/${id}`, { method: 'DELETE' });
export const apiSubmitExam = (id: string | number, submissionData: ExamSubmissionData) => fetchApi<ExamResults>(`/exams/${id}/submit`, { method: 'POST', body: JSON.stringify(submissionData) });
export const apiGetExamAnalytics = (id: string | number) => fetchApi<ExamAnalytics>(`/exams/${id}/analytics`);

// --- METADATA APIS ---
export const apiGetMetadata = async <T>(key: string, token: string) => {
    const result = await fetchApi<Metadata<T>>(`/metadata/${key}`, { headers: { 'Authorization': `Bearer ${token}` } });
    // The components expect an array to map over. If the API returns nothing
    // or the value is null, we default to an empty array to prevent runtime errors.
    return result?.value || [];
};
export const apiUpdateMetadata = <T>(key: string, value: T, token: string) => fetchApi<Metadata<T>>(`/metadata/${key}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ value }) });

// --- AI APIS ---
export const apiGenerateQuestions = (topic: string, difficulty: QuestionDifficulty, count: number) => 
  fetchApi<{ questions: QuestionData[] }>('/ai/generate-questions', { 
    method: 'POST', 
    body: JSON.stringify({ topic, difficulty, count })
  });

// --- RESULTS APIS ---
export const apiGetResults = (token: string) => 
  fetchApi<Result[]>('/results', { headers: { 'Authorization': `Bearer ${token}` } });
