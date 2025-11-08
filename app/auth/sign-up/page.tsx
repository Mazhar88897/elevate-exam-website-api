'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff } from "lucide-react"
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Highlight } from '@/components/pages/Highlight';

// Password Validation Component
const PasswordValidation = ({ password }: { password: string }) => {
  if (!password) return null;

  return (
    <div className="mt-2">
      <p className="text-xs text-slate-600">
        Password should be 8 digits, 1 upper case, 1 lowercase, 1 number, 1 symbol
      </p>
    </div>
  );
};

const Page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    description: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          description: formData.description,
          password: formData.password,
        }),
      });

      const data = await response.json();
     
      if (!response.ok) {
        setError(data.error || data.detail || 'Sign up failed');
        setIsLoading(false);
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
    <div className="h-full mt-20 sm:mt-0 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
        {/* Left Column - Animation (Hidden on smaller devices) */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
          <DotLottieReact
            src="/animation.lottie"
            className="h-[500px]"
            loop
            autoplay
          />
        </div>

        {/* Right Column - Form (Full width on smaller devices) */}
        <div className="w-full max-w-md mx-auto lg:w-1/2 lg:max-w-none">
          {/* Sign-up Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Create an <Highlight>Elevate Exams</Highlight> account</h2>
              <p className="text-slate-600 text-sm">Fill in the details below and sign up.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  className="w-full bg-white rounded-mid border-slate-300"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-white rounded-mid border-slate-300"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  placeholder="e.g., Computer Systems Engineer"
                  className="w-full bg-white rounded-mid border-slate-300"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full bg-white rounded-mid border-slate-300 pr-10"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <PasswordValidation password={formData.password} />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Enter your password again"
                    className="w-full bg-white rounded-mid border-slate-300 pr-10"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-mid p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2 text-sm">
                <Link href="/auth/sign-in" className="text-blue-700 hover:underline font-semibold">
                  Already have an account? Sign In
                </Link>
                <Link href="/main/terms" className="text-slate-600 text-xs">
                  By signing up, you are accepting our <span className="underline font-semibold">terms and conditions.</span>
                </Link>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit"
                className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 rounded-mid"
                disabled={isLoading || !passwordStrength.isValid || formData.password !== formData.confirmPassword}
              >
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </Button>

              {/* Cancel Button */}
              <Link href="/"> 
                <Button 
                  type="button"
                  variant="ghost"  
                  className="w-full text-slate-600 hover:bg-slate-100"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
