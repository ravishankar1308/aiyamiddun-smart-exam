
import { login } from '../auth.service';
import { connection } from '../../database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../database', () => ({
    connection: {
      query: jest.fn(),
    },
  }));
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('should return a token and user profile on successful login', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      password: 'hashedpassword',
      role: 'user',
    };
    const mockToken = 'mocktoken';

    (connection.query as jest.Mock).mockResolvedValue([[mockUser]]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);

    const result = await login('testuser', 'password');

    expect(result).toEqual({
      token: mockToken,
      user: { id: 1, username: 'testuser', role: 'user' },
    });
    expect(connection.query).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', ['testuser']);
    expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
    expect(jwt.sign).toHaveBeenCalledWith({ id: 1, role: 'user' }, process.env.JWT_SECRET, { expiresIn: 3600 });
  });

  it('should return null if user is not found', async () => {
    (connection.query as jest.Mock).mockResolvedValue([[]]);

    const result = await login('nonexistentuser', 'password');

    expect(result).toBeNull();
    expect(connection.query).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', ['nonexistentuser']);
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('should return null if password does not match', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      password: 'hashedpassword',
      role: 'user',
    };

    (connection.query as jest.Mock).mockResolvedValue([[mockUser]]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await login('testuser', 'wrongpassword');

    expect(result).toBeNull();
    expect(connection.query).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', ['testuser']);
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('should throw an error if the database query fails', async () => {
    const errorMessage = 'Database error';
    (connection.query as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await expect(login('testuser', 'password')).rejects.toThrow('Could not process login request.');
  });
});
