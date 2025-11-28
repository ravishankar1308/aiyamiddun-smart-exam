import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// Use an environment variable for the JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in the environment variables.');
}

/**
 * Verifies the JSON Web Token (JWT) from the Authorization header.
 * If valid, it attaches the user payload to the request object.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided or malformed header.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token using the secret key from environment variables
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string; };

        // Attach user information to the request object
        // Ensure your Express.Request type is augmented to include a 'user' property
        req.user = decoded;

        next();
    } catch (error) {
        // The cast to NodeJS.ErrnoException is to allow accessing the 'message' property
        // in a type-safe way, as the error from jwt.verify could be of different types.
        const errorMessage = (error as NodeJS.ErrnoException).message;
        console.error('Authentication error:', errorMessage);

        // Respond with a clear error message. 
        // Token-related errors often mean the user needs to log in again.
        return res.status(403).json({ error: `Forbidden: Invalid or expired token.` });
    }
};

/**
 * Middleware to check if the user is an admin.
 * Must be used after authMiddleware.
 */
export const adminOrOwnerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(403).json({ error: 'Forbidden: Authentication required.' });
    }

    // Admins can proceed
    if (req.user.role === 'Admin') {
        return next();
    }
    
    // For non-admin users, we need to check if they are the "owner"
    // This is a placeholder for ownership logic. In a real app, you would
    // compare req.user.id with the owner of the resource being accessed.
    // For example: const resource = await getResourceById(req.params.id);
    // if (resource.userId === req.user.id) { next(); }
    
    // Since this is a generic middleware, we'll allow if the user is trying to modify their own data
    // This is a common use case, for example, a user updating their own profile.
    if (req.params.id && Number(req.params.id) === req.user.id) {
        return next();
    }

    return res.status(403).json({ error: 'Forbidden: You do not have permission to perform this action.' });
};
