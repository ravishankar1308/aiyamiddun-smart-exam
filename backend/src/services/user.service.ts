import { connection } from '../database';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10; // Standard salt rounds for bcrypt

// Define and export the User type to match the database schema
export interface User {
    id: number;
    name: string;
    username: string;
    password?: string; // Optional as it won't always be selected
    role: 'student' | 'teacher' | 'admin' | 'owner';
    disabled: boolean;
    createdAt: Date;
}

export const getAllUsers = async () => {
    const [rows] = await connection.execute('SELECT id, name, username, role, disabled, createdAt FROM users');
    return rows as User[];
};

export const findUserByUsername = async (username: string): Promise<User | null> => {
    const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
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
        // Fetch the user to get the default values like createdAt
        const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
        return (rows as User[])[0];
    } catch (error) {
        if ((error as any).code === 'ER_DUP_ENTRY') {
            throw new Error('Username already exists.');
        }
        throw error;
    }
};

export const updateUser = async (id: string, userData: any) => {
    const { name, password, role, disabled } = userData;

    const fields: string[] = [];
    const params: any[] = [];

    if (name) {
        fields.push('name = ?');
        params.push(name);
    }
    if (role) {
        fields.push('role = ?');
        params.push(role);
    }
    if (typeof disabled !== 'undefined') {
        fields.push('disabled = ?');
        params.push(disabled);
    }
    if (password) {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        fields.push('password = ?');
        params.push(hashedPassword);
    }

    if (fields.length === 0) {
        return; // No fields to update
    }

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);

    await connection.execute(query, params);
};

export const toggleUserStatus = async (id: string) => {
    const user = await findUserByUsername(id); // This seems incorrect, should be find by ID
    const [rows] = await connection.execute('SELECT disabled FROM users WHERE id = ?', [id]);
    const users = rows as User[];
    if (users.length === 0) {
        throw new Error('User not found');
    }
    const currentStatus = users[0].disabled;
    await connection.execute('UPDATE users SET disabled = ? WHERE id = ?', [!currentStatus, id]);
    return `User ${!currentStatus ? 'enabled' : 'disabled'} successfully`;
};

export const deleteUser = async (id: string) => {
    const [result]: any = await connection.execute('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
        throw new Error('User not found');
    }
};
