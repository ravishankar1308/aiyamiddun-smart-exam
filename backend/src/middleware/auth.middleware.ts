
import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

// Extend the Express Request type to include a user object
export interface AuthenticatedRequest extends Request {
    user?: {
        uid: string;
        email?: string;
        role?: string;
    };
}

// 1. Authentication Middleware (authMiddleware)
// Verifies the Firebase ID token sent from the client.
export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
        return res.status(401).json({ error: 'Unauthorized. No token provided.' });
    }

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        // The decoded token contains standard claims like uid, email, etc.
        // We will fetch the custom role claim we set during user creation.
        const userRecord = await auth.getUser(decodedToken.uid);
        const customClaims = userRecord.customClaims || {};

        // Attach user info to the request object
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: customClaims.role || 'student', // Default to 'student' if no role is set
        };

        next();
    } catch (error) {
        console.error('Error verifying auth token:', error);
        return res.status(403).json({ error: 'Forbidden. Invalid token.' });
    }
};

// 2. Authorization Middleware (adminOrOwnerMiddleware)
// Checks if the authenticated user has the 'admin' or 'owner' role.
export const adminOrOwnerMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (userRole === 'admin' || userRole === 'owner') {
        next(); // User has the required role, proceed
    } else {
        res.status(403).json({ 
            error: 'Forbidden. You do not have sufficient permissions.' 
        });
    }
};
