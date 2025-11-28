
import { findUserByUsername } from './user.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

export const login = async (username: string, password: string) => {

    // --- EXTREME DEBUGGING STEP --- 
    // This function will now ignore the username and password and return a hardcoded object.
    // This completely removes the database from the login equation to test the response pipeline.

    const fakeUser = {
        id: '12345',
        name: "Debug User",
        username: "debug@test.com",
        role: "owner",
    };

    const token = jwt.sign(fakeUser, JWT_SECRET, { expiresIn: '1h' });

    return {
        token,
        user: fakeUser,
    };
};
