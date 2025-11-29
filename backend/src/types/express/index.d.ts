
import { Request } from 'express';

// Define a type for the authenticated user
export type AuthenticatedUser = {
    id: number;
    role: 'student' | 'teacher' | 'admin' | 'owner';
};

// Extend the Express Request interface to include the authenticated user
export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}
