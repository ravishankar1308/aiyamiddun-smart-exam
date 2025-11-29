import { login } from '../auth.service';
import { connection } from '../../database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock the external dependencies
jest.mock('../../database', () => ({
    connection: {
        // The auth service uses `query`, so we mock that
        query: jest.fn(),
    },
}));
jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
}));
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
}));

// Create typed mock functions for easier and safer use in tests
const mockDbQuery = connection.query as jest.Mock;
const mockBcryptCompare = bcrypt.compare as jest.Mock;
const mockJwtSign = jwt.sign as jest.Mock;

describe('Auth Service', () => {

    beforeEach(() => {
        // Reset all mocks before each test to ensure a clean slate
        mockDbQuery.mockReset();
        mockBcryptCompare.mockReset();
        mockJwtSign.mockReset();
        // Also, mock console methods to keep test output clean
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore console mocks after each test
        jest.restoreAllMocks();
    });

    it('should return a token and user profile on successful login', async () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            password: 'hashedpassword',
            role: 'user',
        };
        const mockToken = 'mocktoken';

        // Setup mock return values
        mockDbQuery.mockResolvedValue([[mockUser]]);
        mockBcryptCompare.mockResolvedValue(true);
        mockJwtSign.mockReturnValue(mockToken);

        const result = await login('testuser', 'password');

        // Assertions
        expect(result).toEqual({
            token: mockToken,
            user: { id: 1, username: 'testuser', role: 'user' },
        });
        expect(mockDbQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', ['testuser']);
        expect(mockBcryptCompare).toHaveBeenCalledWith('password', 'hashedpassword');
        // Correctly check the JWT secret from environment variables
        expect(mockJwtSign).toHaveBeenCalledWith({ id: 1, role: 'user' }, process.env.JWT_SECRET, { expiresIn: 3600 });
    });

    it('should return null if user is not found', async () => {
        mockDbQuery.mockResolvedValue([[]]); // Simulate no user found

        const result = await login('nonexistentuser', 'password');

        expect(result).toBeNull();
        expect(mockDbQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', ['nonexistentuser']);
        // Ensure expensive operations are not called if the user doesn't exist
        expect(mockBcryptCompare).not.toHaveBeenCalled();
        expect(mockJwtSign).not.toHaveBeenCalled();
    });

    it('should return null if password does not match', async () => {
        const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword', role: 'user' };
        mockDbQuery.mockResolvedValue([[mockUser]]);
        mockBcryptCompare.mockResolvedValue(false); // Simulate password mismatch

        const result = await login('testuser', 'wrongpassword');

        expect(result).toBeNull();
        expect(mockDbQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', ['testuser']);
        expect(mockBcryptCompare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
        expect(mockJwtSign).not.toHaveBeenCalled();
    });

    it('should throw an error if the database query fails', async () => {
        const errorMessage = 'Database error';
        mockDbQuery.mockRejectedValue(new Error(errorMessage));

        // Ensure the service function translates the error into a user-friendly message
        await expect(login('testuser', 'password')).rejects.toThrow('Could not process login request.');
    });
});
