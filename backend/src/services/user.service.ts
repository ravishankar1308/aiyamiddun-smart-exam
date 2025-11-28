import { connection } from '../index';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10; // Standard salt rounds for bcrypt

// Define and export the User type
export interface User {
    id: number;
    name: string;
    username: string;
    password?: string; // Make password optional as it won't always be selected
    role: string;
    disabled: boolean;
}

export const getAllUsers = async () => {
    const [rows] = await connection.execute('SELECT id, name, username, role, disabled FROM users');
    return rows as User[];
};

export const findUserByUsername = async (username: string) => {
    const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
    const users = rows as User[];
    if (users.length === 0) {
        return null;
    }
    return users[0];
};

export const createUser = async (userData: any) => {
    const { name, username, password, role } = userData;
    if (!name || !username || !password || !role) {
        throw new Error('All user fields are required.');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    try {
        const [result]: any = await connection.execute(
            'INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)',
            [name, username, hashedPassword, role]
        );
        return { id: result.insertId, name, username, role, disabled: false };
    } catch (error) {
        if ((error as any).code === 'ER_DUP_ENTRY') {
            throw new Error('Username already exists.');
        }
        throw error;
    }
};

export const updateUser = async (id: string, userData: any) => {
    const { name, password, role } = userData;

    let query = 'UPDATE users SET name = ?, role = ?';
    const params: any[] = [name, role];

    if (password) {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        query += ', password = ?';
        params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    try {
        await connection.execute(query, params);
    } catch (error) {
        throw error;
    }
};

export const toggleUserStatus = async (id: string) => {
    const [rows] = await connection.execute('SELECT disabled FROM users WHERE id = ?', [id]);
    const users = rows as User[];
    if (users.length === 0) {
        throw new Error('User not found');
    }
    const currentStatus = users[0].disabled;
    await connection.execute('UPDATE users SET disabled = ? WHERE id = ?', [!currentStatus, id]);
    return `User ${!currentStatus ? 'disabled' : 'enabled'} successfully`;
};

export const deleteUser = async (id: string) => {
    const [result]: any = await connection.execute('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
        throw new Error('User not found');
    }
};
