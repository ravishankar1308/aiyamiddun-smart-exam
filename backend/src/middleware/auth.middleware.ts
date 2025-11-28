import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined in the environment variables.');
}

// Define a custom Express Request interface to include the 'user' property
export interface AuthenticatedRequest extends Request {
    user?: any; // You can define a more specific type for the user payload
}

/**
 * Middleware to authenticate requests using a JWT token.
 * It verifies the token and attaches the user payload to the request object.
 */
export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user payload to the request
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token.' });
    }
};

/**
 * Middleware to authorize requests for admin or owner roles.
 * This should be used AFTER the authMiddleware.
 */
export const adminOrOwnerMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    const userRole = req.user.role;

    // Allow access if the user is an 'Admin' or an 'owner'
    if (userRole === 'Admin' || userRole === 'owner') {
        return next();
    }

    // As a fallback, you could still allow users to access resources by their own ID,
    // for example, a user updating their own profile at /api/users/:id
    if (req.params.id && Number(req.params.id) === req.user.id) {
        return next();
    }

    // If none of the conditions are met, deny access.
    return res.status(403).json({ error: 'Forbidden: You do not have permission to perform this action.' });
};
