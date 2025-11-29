
import { render, screen } from '@testing-library/react';
import AuthPage from '../page';
import { AuthProvider } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('AuthPage', () => {
  it('renders the login form by default', () => {
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    render(
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });
});
