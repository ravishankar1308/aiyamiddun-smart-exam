// 1. Define top-level mock functions
const mockDbExecute = jest.fn();
const mockBcryptHash = jest.fn();

// 2. Mock the modules and provide the mock functions
jest.mock('../../database', () => ({
    connection: {
        execute: mockDbExecute,
    },
}));

jest.mock('bcryptjs', () => ({
    hash: mockBcryptHash,
}));

// 3. Import the service and types AFTER mocking
import {
    getAllUsers,
    findUserByUsername,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    User,
} from '../user.service';

describe('User Service', () => {

    beforeEach(() => {
        // Reset mocks before each test for isolation
        mockDbExecute.mockReset();
        mockBcryptHash.mockReset();
    });

    describe('getAllUsers', () => {
        it('should return all users from the database', async () => {
            const mockUsers: User[] = [
                { id: 1, name: 'Admin', username: 'admin', role: 'admin', disabled: false, createdAt: new Date() },
                { id: 2, name: 'User', username: 'user', role: 'student', disabled: false, createdAt: new Date() },
            ];
            mockDbExecute.mockResolvedValue([mockUsers]);

            const result = await getAllUsers();

            expect(result).toEqual(mockUsers);
            expect(mockDbExecute).toHaveBeenCalledWith('SELECT id, name, username, role, disabled, createdAt FROM users');
        });
    });

    describe('findUserByUsername', () => {
        it('should return a user object if found', async () => {
            const mockUser: User = { id: 1, name: 'Admin', username: 'admin', role: 'admin', disabled: false, createdAt: new Date() };
            mockDbExecute.mockResolvedValue([[mockUser]]);

            const result = await findUserByUsername('admin');

            expect(result).toEqual(mockUser);
            expect(mockDbExecute).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', ['admin']);
        });

        it('should return null if the user is not found', async () => {
            mockDbExecute.mockResolvedValue([[]]);
            const result = await findUserByUsername('nonexistent');
            expect(result).toBeNull();
        });
    });

    describe('createUser', () => {
        it('should successfully create a new user', async () => {
            const newUser = { name: 'New User', username: 'newuser', password: 'password', role: 'student' as const };
            const hashedPassword = 'hashedpassword';
            const mockDate = new Date();
            mockBcryptHash.mockResolvedValue(hashedPassword);
            mockDbExecute.mockResolvedValue([{ insertId: 3 }, []]); // Mock INSERT and SELECT

            // Mock the SELECT call that happens after the INSERT
            mockDbExecute.mockResolvedValueOnce([{ insertId: 3 }])
                         .mockResolvedValueOnce([[{ id: 3, name: 'New User', username: 'newuser', role: 'student', disabled: false, createdAt: mockDate }]]);


            const result = await createUser(newUser);

            expect(result).toEqual({ id: 3, name: 'New User', username: 'newuser', role: 'student', disabled: false, createdAt: mockDate });
            expect(mockBcryptHash).toHaveBeenCalledWith('password', 10);
            expect(mockDbExecute).toHaveBeenCalledWith(
                'INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)',
                ['New User', 'newuser', hashedPassword, 'student']
            );
        });

        it('should throw a specific error if the username already exists', async () => {
            const newUser = { name: 'New User', username: 'existinguser', password: 'password', role: 'student' as const };
            mockBcryptHash.mockResolvedValue('hashedpassword');
            mockDbExecute.mockRejectedValue({ code: 'ER_DUP_ENTRY' }); // Simulate DB error

            await expect(createUser(newUser)).rejects.toThrow('Username already exists.');
        });
    });

    describe('updateUser', () => {
        it('should update user data without the password', async () => {
            const updatedData = { name: 'Updated User', role: 'admin' as const };
            await updateUser('1', updatedData);

            expect(mockDbExecute).toHaveBeenCalledWith(
                'UPDATE users SET name = ?, role = ? WHERE id = ?',
                ['Updated User', 'admin', '1']
            );
            expect(mockBcryptHash).not.toHaveBeenCalled();
        });

        it('should update user data including a new password', async () => {
            const updatedData = { name: 'Updated User', password: 'newpassword', role: 'admin' as const };
            const hashedPassword = 'hashednewpassword';
            mockBcryptHash.mockResolvedValue(hashedPassword);

            await updateUser('1', updatedData);

            expect(mockBcryptHash).toHaveBeenCalledWith('newpassword', 10);
            expect(mockDbExecute).toHaveBeenCalledWith(
                'UPDATE users SET password = ? WHERE id = ?',
                ['Updated User', 'admin', hashedPassword, '1']
            );
        });
    });

    describe('toggleUserStatus', () => {
        it('should correctly disable an enabled user', async () => {
            mockDbExecute.mockResolvedValueOnce([[{ disabled: false }]]); // Mock SELECT
            mockDbExecute.mockResolvedValueOnce(undefined); // Mock UPDATE

            const result = await toggleUserStatus('1');

            expect(result).toBe('User disabled successfully');
            expect(mockDbExecute).toHaveBeenCalledWith('SELECT disabled FROM users WHERE id = ?', ['1']);
            expect(mockDbExecute).toHaveBeenCalledWith('UPDATE users SET disabled = ? WHERE id = ?', [true, '1']);
        });

        it('should correctly enable a disabled user', async () => {
            mockDbExecute.mockResolvedValueOnce([[{ disabled: true }]]); // Mock SELECT
            mockDbExecute.mockResolvedValueOnce(undefined); // Mock UPDATE

            const result = await toggleUserStatus('1');

            expect(result).toBe('User enabled successfully');
            expect(mockDbExecute).toHaveBeenCalledWith('UPDATE users SET disabled = ? WHERE id = ?', [false, '1']);
        });
    });

    describe('deleteUser', () => {
        it('should successfully delete a user', async () => {
            mockDbExecute.mockResolvedValue([{ affectedRows: 1 }]);
            await deleteUser('1');
            expect(mockDbExecute).toHaveBeenCalledWith('DELETE FROM users WHERE id = ?', ['1']);
        });

        it('should throw an error if the user to delete is not found', async () => {
            mockDbExecute.mockResolvedValue([{ affectedRows: 0 }]);
            await expect(deleteUser('999')).rejects.toThrow('User not found');
        });
    });
});
