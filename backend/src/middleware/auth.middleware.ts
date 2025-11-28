
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// In a real application, this secret should be stored securely in an environment variable
const JWT_SECRET = 'your-super-secret-and-long-key-that-is-at-least-32-characters';

/**
 * Verifies the JSON Web Token (JWT) from the Authorization header.
 * If valid, it attaches the user payload to the request object.
 * It relies on the global Express.Request type augmentation.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided or malformed header.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string; };

        // Attach the decoded user payload to the request object. 
        // This is type-safe thanks to our global type definition.
        req.user = {
            id: decoded.id,
            role: decoded.role,
        };
        
        next(); // Token is valid, proceed to the next middleware or route handler
    } catch (error) {
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token.' });
    }
};

/**
 * Checks if the authenticated user has the 'admin' or 'owner' role.
 * This middleware must run *after* the authMiddleware.
 */
export const adminOrOwnerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // This check assumes authMiddleware has already run and attached the user object
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication error: User not found on request.' });
    }

    const { role } = req.user;

    if (role === 'admin' || role === 'owner') {
        next(); // User has the required permissions
    } else {
        return res.status(403).json({ error: 'Forbidden: You do not have sufficient permissions.' });
    }
};
