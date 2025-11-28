import { connection } from '../index';

// WARNING: This is NOT a secure way to handle login.
// Passwords are in plain text and not hashed.

export const login = async (username: string, password: string): Promise<any> => {
    const [rows]: any = await connection.execute(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password]
    );

    if (rows.length === 0) {
        throw new Error('Invalid credentials');
    }

    const user = rows[0];

    if (user.disabled) {
        throw new Error('Account disabled');
    }

    // Never return the password, even in an insecure setup
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
