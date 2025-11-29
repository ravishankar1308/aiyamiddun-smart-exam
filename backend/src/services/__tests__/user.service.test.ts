
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

jest.mock('../../database', () => ({
    connection: {
        execute: jest.fn(),
    },
}));

jest.mock('bcryptjs');

describe('User Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
        (connection.execute as jest.Mock).mockReset();
    });

    // Test for getAllUsers
    it('should return all users', async () => {
        const mockUsers: User[] = [
            { id: 1, name: 'Admin', username: 'admin', role: 'admin', disabled: false },
            { id: 2, name: 'User', username: 'user', role: 'user', disabled: false },
        ];
        (connection.execute as jest.Mock).mockResolvedValue([mockUsers]);

        const result = await getAllUsers();
        expect(result).toEqual(mockUsers);
        expect(connection.execute).toHaveBeenCalledWith('SELECT id, name, username, role, disabled FROM users');
    });

    // Test for findUserByUsername
    it('should return a user by username', async () => {
        const mockUser: User = { id: 1, name: 'Admin', username: 'admin', role: 'admin', disabled: false };
        (connection.execute as jest.Mock).mockResolvedValue([[mockUser]]);

        const result = await findUserByUsername('admin');
        expect(result).toEqual(mockUser);
        expect(connection.execute).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', ['admin']);
    });

    it('should return null if user not found by username', async () => {
        (connection.execute as jest.Mock).mockResolvedValue([[]]);

        const result = await findUserByUsername('nonexistent');
        expect(result).toBeNull();
    });

    // Test for createUser
    it('should create a new user and return it', async () => {
        const newUser = { name: 'New User', username: 'newuser', password: 'password', role: 'user' };
        const hashedPassword = 'hashedpassword';
        (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
        (connection.execute as jest.Mock).mockResolvedValue([{ insertId: 3 }]);

        const result = await createUser(newUser);
        expect(result).toEqual({ id: 3, name: 'New User', username: 'newuser', role: 'user', disabled: false });
        expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
        expect(connection.execute).toHaveBeenCalledWith(
            'INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)',
            ['New User', 'newuser', hashedPassword, 'user']
        );
    });

    it('should throw an error if username already exists', async () => {
        const newUser = { name: 'New User', username: 'existinguser', password: 'password', role: 'user' };
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
        (connection.execute as jest.Mock).mockRejectedValue({ code: 'ER_DUP_ENTRY' });

        await expect(createUser(newUser)).rejects.toThrow('Username already exists.');
    });

    // Test for updateUser
    it('should update a user without changing the password', async () => {
        const updatedData = { name: 'Updated User', role: 'admin' };
        await updateUser('1', updatedData);

        expect(connection.execute).toHaveBeenCalledWith(
            'UPDATE users SET name = ?, role = ? WHERE id = ?',
            ['Updated User', 'admin', '1']
        );
        expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should update a user including the password', async () => {
        const updatedData = { name: 'Updated User', password: 'newpassword', role: 'admin' };
        const hashedPassword = 'hashednewpassword';
        (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

        await updateUser('1', updatedData);

        expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
        expect(connection.execute).toHaveBeenCalledWith(
            'UPDATE users SET name = ?, role = ?, password = ? WHERE id = ?',
            ['Updated User', 'admin', hashedPassword, '1']
        );
    });

    // Test for toggleUserStatus
    it('should disable an enabled user', async () => {
        const mockUser = { disabled: false };
        (connection.execute as jest.Mock).mockResolvedValueOnce([[mockUser]]); // For the SELECT query
        (connection.execute as jest.Mock).mockResolvedValueOnce(undefined); // For the UPDATE query

        const result = await toggleUserStatus('1');

        expect(result).toBe('User disabled successfully');
        expect(connection.execute).toHaveBeenCalledWith('SELECT disabled FROM users WHERE id = ?', ['1']);
        expect(connection.execute).toHaveBeenCalledWith('UPDATE users SET disabled = ? WHERE id = ?', [true, '1']);
    });

    it('should enable a disabled user', async () => {
        const mockUser = { disabled: true };
        (connection.execute as jest.Mock).mockResolvedValueOnce([[mockUser]]);
        (connection.execute as jest.Mock).mockResolvedValueOnce(undefined);

        const result = await toggleUserStatus('1');

        expect(result).toBe('User enabled successfully');
        expect(connection.execute).toHaveBeenCalledWith('UPDATE users SET disabled = ? WHERE id = ?', [false, '1']);
    });

    // Test for deleteUser
    it('should delete a user', async () => {
        (connection.execute as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);
        await deleteUser('1');
        expect(connection.execute).toHaveBeenCalledWith('DELETE FROM users WHERE id = ?', ['1']);
    });

    it('should throw an error if user to delete is not found', async () => {
        (connection.execute as jest.Mock).mockResolvedValue([{ affectedRows: 0 }]);
        await expect(deleteUser('999')).rejects.toThrow('User not found');
    });
});
