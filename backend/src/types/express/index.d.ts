import 'express';

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: number;
        name: string;
        username: string;
        role: "student" | "teacher" | "admin" | "owner";
        disabled: boolean;
        createdAt: Date;
      };
    }
  }
}
