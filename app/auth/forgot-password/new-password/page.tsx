'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

const NewPasswordPage = () => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ isValid: boolean; message: string }>({ isValid: false, message: '' });

  const validatePassword = (pwd: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    if (pwd.length < minLength) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!hasUpperCase) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!hasLowerCase) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!hasNumbers) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    if (!hasSpecialChar) {
      return { isValid: false, message: 'Password must contain at least one special character' };
    }
    return { isValid: true, message: 'Password is strong' };
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordStrength(validatePassword(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!passwordStrength.isValid) {
      setError('Password does not meet strength requirements');
      return;
    }
    setIsLoading(true);
    try {
      const resetToken = sessionStorage.getItem('resetToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resetToken, newPassword: password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push('/auth/sign-in'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='m-5'>
      <div className="flex justify-center items-center flex-1 mt-12">
        <div className="w-full max-w-md border border-white rounded-mid p-6">
          <h2 className="text-white text-xl font-bold mb-1">Set New Password</h2>
          <p className="text-white font-semibold text-sm mb-6">Enter your new password below. Password must be strong.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block font-bold text-white mb-1">New Password:</label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="w-full bg-white rounded-mid border-teal-700 pr-10"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  disabled={isLoading}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
              {password && (
                <p className={`text-xs mt-1 ${passwordStrength.isValid ? 'text-green-400' : 'text-red-400'}`}>{passwordStrength.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block font-bold text-white mb-1">Confirm Password:</label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className="w-full bg-white rounded-mid border-teal-700 pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
              )}
            </div>
            {error && <div className="text-red-400 text-sm font-semibold">{error}</div>}
            {success && <div className="text-green-400 text-sm font-semibold">Password reset successful! Redirecting to sign in...</div>}
            <Button
              type="submit"
              className="bg-white text-teal-900 hover:bg-gray-100 w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Set New Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPasswordPage;
