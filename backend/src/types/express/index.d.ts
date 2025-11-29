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
        created_at: Date;
        updated_at: Date;
        last_login: Date | null;
      };
    }
  }
}
