import { connection } from '../index'; // Assuming connection is exported from index

// NOTE: As per your request, password handling is done in PLAIN TEXT.
// This is NOT secure and is strongly discouraged.

export const getAllUsers = async () => {
    const [rows] = await connection.execute('SELECT id, name, username, role, disabled FROM users');
    return rows;
};

export const findUserByUsername = async (username: string) => {
    const [rows]: any = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
        return null;
    }
    return rows[0];
};

export const createUser = async (userData: any) => {
    const { name, username, password, role } = userData;
    if (!name || !username || !password || !role) {
        throw new Error('All user fields are required.');
    }
    try {
        const [result]: any = await connection.execute(
            'INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)',
            [name, username, password, role]
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
    const { name, username, password, role } = userData;
    if (!name || !username || !password || !role) {
        throw new Error('All user fields are required.');
    }
    try {
        await connection.execute(
            'UPDATE users SET name = ?, username = ?, password = ?, role = ? WHERE id = ?',
            [name, username, password, role, id]
        );
    } catch (error) {
        if ((error as any).code === 'ER_DUP_ENTRY') {
            throw new Error('Username already exists.');
        }
        throw error;
    }
};

export const toggleUserStatus = async (id: string) => {
    const [rows]: any = await connection.execute('SELECT disabled FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
        throw new Error('User not found');
    }
    const currentStatus = rows[0].disabled;
    await connection.execute('UPDATE users SET disabled = ? WHERE id = ?', [!currentStatus, id]);
    return `User ${!currentStatus ? 'disabled' : 'enabled'} successfully`;
};

export const deleteUser = async (id: string) => {
    const [result]: any = await connection.execute('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
        throw new Error('User not found');
    }
};
