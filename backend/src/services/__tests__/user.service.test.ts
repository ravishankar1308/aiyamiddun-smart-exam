import {
    getAllUsers,
    findUserByUsername,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    User,
} from '../user.service';
import { connection } from '../../database';
import bcrypt from 'bcryptjs';

// Mock the database connection module
jest.mock('../../database', () => ({
    connection: {
        execute: jest.fn(),
    },
}));

// Mock the bcryptjs library
jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
}));

// Create typed mock functions for easier use in tests
const mockDbExecute = connection.execute as jest.Mock;
const mockBcryptHash = bcrypt.hash as jest.Mock;

describe('User Service', () => {

    beforeEach(() => {
        // Reset mocks before each test to ensure isolation
        mockDbExecute.mockReset();
        mockBcryptHash.mockReset();
    });

    describe('getAllUsers', () => {
        it('should return all users', async () => {
            const mockUsers: User[] = [
                { id: 1, name: 'Admin', username: 'admin', role: 'admin', disabled: false },
                { id: 2, name: 'User', username: 'user', role: 'user', disabled: false },
            ];
            mockDbExecute.mockResolvedValue([mockUsers]);

            const result = await getAllUsers();

            expect(result).toEqual(mockUsers);
            expect(mockDbExecute).toHaveBeenCalledWith('SELECT id, name, username, role, disabled FROM users');
        });
    });

    describe('findUserByUsername', () => {
        it('should return a user by username', async () => {
            const mockUser: User = { id: 1, name: 'Admin', username: 'admin', role: 'admin', disabled: false };
            mockDbExecute.mockResolvedValue([[mockUser]]);

            const result = await findUserByUsername('admin');

            expect(result).toEqual(mockUser);
            expect(mockDbExecute).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', ['admin']);
        });

        it('should return null if user not found', async () => {
            mockDbExecute.mockResolvedValue([[]]);
            const result = await findUserByUsername('nonexistent');
            expect(result).toBeNull();
        });
    });

    describe('createUser', () => {
        it('should create a new user and return it', async () => {
            const newUser = { name: 'New User', username: 'newuser', password: 'password', role: 'user' as const };
            const hashedPassword = 'hashedpassword';
            mockBcryptHash.mockResolvedValue(hashedPassword);
            mockDbExecute.mockResolvedValue([{ insertId: 3 }]);

            const result = await createUser(newUser);

            expect(result).toEqual({ id: 3, name: 'New User', username: 'newuser', role: 'user', disabled: false });
            expect(mockBcryptHash).toHaveBeenCalledWith('password', 10);
            expect(mockDbExecute).toHaveBeenCalledWith(
                'INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)',
                ['New User', 'newuser', hashedPassword, 'user']
            );
        });

        it('should throw an error if username already exists', async () => {
            const newUser = { name: 'New User', username: 'existinguser', password: 'password', role: 'user' as const };
            mockBcryptHash.mockResolvedValue('hashedpassword');
            // Simulate a database duplicate entry error
            mockDbExecute.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

            await expect(createUser(newUser)).rejects.toThrow('Username already exists.');
        });
    });

    describe('updateUser', () => {
        it('should update a user without changing the password', async () => {
            const updatedData = { name: 'Updated User', role: 'admin' as const };
            await updateUser('1', updatedData);

            expect(mockDbExecute).toHaveBeenCalledWith(
                'UPDATE users SET name = ?, role = ? WHERE id = ?',
                ['Updated User', 'admin', '1']
            );
            expect(mockBcryptHash).not.toHaveBeenCalled();
        });

        it('should update a user including the password', async () => {
            const updatedData = { name: 'Updated User', password: 'newpassword', role: 'admin' as const };
            const hashedPassword = 'hashednewpassword';
            mockBcryptHash.mockResolvedValue(hashedPassword);

            await updateUser('1', updatedData);

            expect(mockBcryptHash).toHaveBeenCalledWith('newpassword', 10);
            expect(mockDbExecute).toHaveBeenCalledWith(
                'UPDATE users SET name = ?, role = ?, password = ? WHERE id = ?',
                ['Updated User', 'admin', hashedPassword, '1']
            );
        });
    });

    describe('toggleUserStatus', () => {
        it('should disable an enabled user', async () => {
            mockDbExecute.mockResolvedValueOnce([[{ disabled: false }]]); // Mock for the SELECT query
            mockDbExecute.mockResolvedValueOnce(undefined); // Mock for the UPDATE query

            const result = await toggleUserStatus('1');

            expect(result).toBe('User disabled successfully');
            expect(mockDbExecute).toHaveBeenCalledWith('SELECT disabled FROM users WHERE id = ?', ['1']);
            expect(mockDbExecute).toHaveBeenCalledWith('UPDATE users SET disabled = ? WHERE id = ?', [true, '1']);
        });

        it('should enable a disabled user', async () => {
            mockDbExecute.mockResolvedValueOnce([[{ disabled: true }]]);
            mockDbExecute.mockResolvedValueOnce(undefined);

            const result = await toggleUserStatus('1');

            expect(result).toBe('User enabled successfully');
            expect(mockDbExecute).toHaveBeenCalledWith('UPDATE users SET disabled = ? WHERE id = ?', [false, '1']);
        });
    });

    describe('deleteUser', () => {
        it('should delete a user', async () => {
            mockDbExecute.mockResolvedValue([{ affectedRows: 1 }]);
            await deleteUser('1');
            expect(mockDbExecute).toHaveBeenCalledWith('DELETE FROM users WHERE id = ?', ['1']);
        });

        it('should throw an error if user to delete is not found', async () => {
            mockDbExecute.mockResolvedValue([{ affectedRows: 0 }]);
            await expect(deleteUser('999')).rejects.toThrow('User not found');
        });
    });
});
