'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Password Validation Component
const PasswordValidation = ({ password }: { password: string }) => {
  const requirements = [
    {
      id: 'length',
      label: 'Password must be at least 8 characters long',
      test: (pwd: string) => pwd.length >= 8,
      icon: '✓'
    },
    {
      id: 'uppercase',
      label: 'Password must contain at least one uppercase letter',
      test: (pwd: string) => /[A-Z]/.test(pwd),
      icon: '✓'
    },
    {
      id: 'lowercase',
      label: 'Password must contain at least one lowercase letter',
      test: (pwd: string) => /[a-z]/.test(pwd),
      icon: '✓'
    },
    {
      id: 'number',
      label: 'Password must contain at least one number',
      test: (pwd: string) => /\d/.test(pwd),
      icon: '✓'
    },
    {
      id: 'special',
      label: 'Password must contain at least one special character',
      test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      icon: '✓'
    }
  ];

  if (!password) return null;

  return (
    <div className="mt-2 p-3 b  rounded-mid">
      {/* <p className="text-white text-xs font-semibold mb-2">Password Requirements:</p> */}
      <div className="space-y-1">
        {requirements.map((req) => {
          const isValid = req.test(password);
          return (
            <div key={req.id} className="flex items-center gap-2">
              <span className={`text-xs ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                {isValid ? '✓' : '✗'}
              </span>
              <span className={`text-xs ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    message: ''
  });

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate password when password field changes
    if (name === 'password') {
      setPasswordStrength(validatePassword(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check password strength
    if (!passwordStrength.isValid) {
      setError('Password does not meet strength requirements');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
        }),
      });

      const data = await response.json();
     
      if (!response.ok) {
        setError(data.error || 'Sign up failed');
        return;
      }

      // Store email for OTP verification
      sessionStorage.setItem('signupEmail', formData.email);
      sessionStorage.setItem('signupName', formData.name);
      
      // Redirect to OTP screen
      router.push('/auth/otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='m-5'>
      <div className="flex justify-center items-center flex-1 mt-2">
        <div className="w-full max-w-md border border-black rounded-mid p-6">
          <h2 className="text-slate-700 text-xl font-bold mb-1">Create and OnlyCNCs account
         </h2>
          <p className="text-slate-700 font-semibold text-sm mb-6"> Fill in the detials below and sign up.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block font-bold text-slate-700 mb-1">
                Name:
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                className="w-full bg-white rounded-mid border-slate-700"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-bold text-slate-700 mb-1">
                Email:
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white rounded-mid border-slate-700"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block rounded-mid font-bold text-slate-700 mb-1">
                Password:
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                className="w-full bg-white rounded-mid border-slate-700"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <PasswordValidation password={formData.password} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block rounded-mid font-bold text-slate-700 mb-1">
                Confirm Password:
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Enter your password again"
                className="w-full bg-white rounded-mid border-slate-700"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            {error && (
              <div className="text-red-400 text-sm font-semibold">
                {error}
              </div>
            )}

            <div className="flex px-1 justify-between text-sm">
              <Link href="/auth/sign-in" className="text-slate-700 font-semibold hover:text-slate-700">
                Already have an account? Sign In
              </Link>
            </div>
            <div className="flex px-1 justify-between text-sm ">
              <Link href="/main/terms" className="text-slate-700 text-xs">
              By signing up, you are accepting our <span className="underline font-semibold">terms and conditions.</span>
              </Link>
            </div>

            <div className="flex justify-between pt-6">
              <Link href="/"> 
                <Button 
                  type="button"
                  variant="ghost"  
                  className="text-slate-700 font-bold"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </Link> 
              <Button 
                type="submit"
                className="bg-white border border-slate-700 text-slate-900 "
                disabled={isLoading || !passwordStrength.isValid || formData.password !== formData.confirmPassword}
              >
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Page
