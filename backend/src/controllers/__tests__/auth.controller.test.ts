import { getMockReq, getMockRes } from '@jest-mock/express';
import * as authController from '../auth.controller';
import * as authService from '../../services/auth.service';

// Mock the authService
jest.mock('../../services/auth.service');

describe('Auth Controller', () => {
  const { res, next, mockClear } = getMockRes();

  beforeEach(() => {
    mockClear();
  });

  describe('register', () => {
    it('should register a new user and return the user profile', async () => {
      const req = getMockReq({
        body: {
          name: 'Test User',
          username: 'testuser',
          password: 'password123',
          role: 'student',
        },
      });

      const mockUser = {
        id: 1,
        name: 'Test User',
        username: 'testuser',
        role: 'student',
        disabled: false,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: null,
      };

      (authService.register as jest.Mock).mockResolvedValue(mockUser);

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('login', () => {
    it('should login the user and return the user profile and token', async () => {
      const req = getMockReq({
        body: {
          username: 'testuser',
          password: 'password123',
        },
      });

      const mockUser = {
        id: 1,
        name: 'Test User',
        username: 'testuser',
        role: 'student',
        disabled: false,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date(),
      };

      const mockLoginResult = {
        token: 'test-token',
        user: mockUser,
      };

      (authService.login as jest.Mock).mockResolvedValue(mockLoginResult);

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith(mockLoginResult);
    });
  });
});
