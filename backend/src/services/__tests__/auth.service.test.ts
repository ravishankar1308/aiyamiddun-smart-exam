// 1. Define top-level mock functions
const mockDbQuery = jest.fn();
const mockBcryptCompare = jest.fn();
const mockJwtSign = jest.fn();

// 2. Mock the modules and provide the mock functions
jest.mock('../../database', () => ({
    connection: {
        query: mockDbQuery,
    },
}));

jest.mock('bcryptjs', () => ({
    compare: mockBcryptCompare,
}));

jest.mock('jsonwebtoken', () => ({
    sign: mockJwtSign,
}));

// 3. Import the service and types AFTER mocking
import { login } from '../auth.service';

describe('Auth Service', () => {

    beforeEach(() => {
        // Reset all mocks before each test for a clean slate
        mockDbQuery.mockReset();
        mockBcryptCompare.mockReset();
        mockJwtSign.mockReset();
        // Spy on console methods to keep test output clean
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore any spied-on objects
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

        // Configure mock implementations
        mockDbQuery.mockResolvedValue([[mockUser]]);
        mockBcryptCompare.mockResolvedValue(true);
        mockJwtSign.mockReturnValue(mockToken);

        const result = await login('testuser', 'password');

        // Assert the outcome
        expect(result).toEqual({
            token: mockToken,
            user: { id: 1, username: 'testuser', role: 'user' },
        });
        expect(mockDbQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', ['testuser']);
        expect(mockBcryptCompare).toHaveBeenCalledWith('password', 'hashedpassword');
        // Verify JWT signing uses the correct secret from environment variables
        expect(mockJwtSign).toHaveBeenCalledWith({ id: 1, role: 'user' }, process.env.JWT_SECRET, { expiresIn: 3600 });
    });

    it('should return null if the user is not found', async () => {
        mockDbQuery.mockResolvedValue([[]]); // Simulate DB returning no rows

        const result = await login('nonexistentuser', 'password');

        expect(result).toBeNull();
        expect(mockDbQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', ['nonexistentuser']);
        expect(mockBcryptCompare).not.toHaveBeenCalled(); // Should not attempt to compare password
        expect(mockJwtSign).not.toHaveBeenCalled(); // Should not sign a token
    });

    it('should return null if the password does not match', async () => {
        const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword', role: 'user' };
        mockDbQuery.mockResolvedValue([[mockUser]]);
        mockBcryptCompare.mockResolvedValue(false); // Simulate password mismatch

        const result = await login('testuser', 'wrongpassword');

        expect(result).toBeNull();
        expect(mockDbQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', ['testuser']);
        expect(mockBcryptCompare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
        expect(mockJwtSign).not.toHaveBeenCalled();
    });

    it('should throw a user-friendly error if the database query fails', async () => {
        const errorMessage = 'Database connection lost';
        mockDbQuery.mockRejectedValue(new Error(errorMessage));

        await expect(login('testuser', 'password')).rejects.toThrow('Could not process login request.');
    });
});
