import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in the environment variables.');
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided or malformed header.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        req.user = decoded;

        next();
    } catch (error) {
        const errorMessage = (error as NodeJS.ErrnoException).message;
        console.error('Authentication error:', errorMessage);

        return res.status(403).json({ error: `Forbidden: Invalid or expired token.` });
    }
};

export const adminOrOwnerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(403).json({ error: 'Forbidden: Authentication required.' });
    }

    if (req.user.role === 'Admin') {
        return next();
    }
    
    if (req.params.id && Number(req.params.id) === req.user.id) {
        return next();
    }

    return res.status(403).json({ error: 'Forbidden: You do not have permission to perform this action.' });
};
