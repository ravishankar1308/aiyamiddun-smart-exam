// This file uses declaration merging to add a custom 'user' property to the global
// Express.Request interface. This is the idiomatic and type-safe way to do it.

declare global {
    namespace Express {
        interface Request {
            // This 'user' property will be attached by our authMiddleware.
            user?: {
                id: number; // Or string, depending on your user ID type
                role: string;
            };
        }
    }
}

// An empty export statement is required to make this file a module and apply the augmentation.
export {};
