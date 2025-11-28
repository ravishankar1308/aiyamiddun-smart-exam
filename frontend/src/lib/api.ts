
// lib/api.ts

// The base URL of our Node.js backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * A helper function to perform API requests.
 * It automatically adds the correct headers and base URL.
 * @param endpoint The API endpoint to call (e.g., '/auth/login').
 * @param options The options for the fetch request (method, body, etc.).
 * @returns The JSON response from the API.
 */
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(url, config);

    // If the response is not ok (e.g., 4xx or 5xx), throw an error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'An unknown API error occurred' }));
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    // If the response has no content (like a 204), return null
    if (response.status === 204) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('API Fetch Error:', error);
    // Re-throw the error so the calling component can handle it
    throw error;
  }
}

// --- AUTH APIS ---
export const apiLogin = (username, password) => 
  fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  
export const apiRegister = (userData) => 
  fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(userData) });

// --- USER MANAGEMENT APIS ---
export const apiGetUsers = () => fetchApi('/users');
export const apiCreateUser = (userData) => fetchApi('/users', { method: 'POST', body: JSON.stringify(userData) });
export const apiUpdateUser = (id, userData) => fetchApi(`/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) });
export const apiToggleUserDisable = (id) => fetchApi(`/users/${id}/toggle-disable`, { method: 'PATCH' });
export const apiDeleteUser = (id) => fetchApi(`/users/${id}`, { method: 'DELETE' });

// --- QUESTION APIS ---
export const apiGetQuestions = (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  return fetchApi(`/questions?${query}`);
};
export const apiCreateQuestion = (questionData) => fetchApi('/questions', { method: 'POST', body: JSON.stringify(questionData) });
export const apiUpdateQuestion = (id, questionData) => fetchApi(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(questionData) });
export const apiUpdateQuestionStatus = (id, status) => fetchApi(`/questions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const apiToggleQuestionDisable = (id) => fetchApi(`/questions/${id}/toggle-disable`, { method: 'PATCH' });
export const apiDeleteQuestion = (id) => fetchApi(`/questions/${id}`, { method: 'DELETE' });

// --- EXAM APIS ---
export const apiGetExams = (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  return fetchApi(`/exams?${query}`);
};
export const apiGetExam = (id) => fetchApi(`/exams/${id}`);
export const apiCreateExam = (examData) => fetchApi('/exams', { method: 'POST', body: JSON.stringify(examData) });
export const apiUpdateExam = (id, examData) => fetchApi(`/exams/${id}`, { method: 'PUT', body: JSON.stringify(examData) });
export const apiDeleteExam = (id) => fetchApi(`/exams/${id}`, { method: 'DELETE' });
export const apiSubmitExam = (id, submissionData) => fetchApi(`/exams/${id}/submit`, { method: 'POST', body: JSON.stringify(submissionData) });
export const apiGetExamAnalytics = (id) => fetchApi(`/exams/${id}/analytics`);

// --- METADATA APIS ---
export const apiGetMetadata = () => fetchApi('/metadata');
export const apiUpdateMetadata = (key, value) => fetchApi(`/metadata/${key}`, { method: 'PUT', body: JSON.stringify({ value }) });
