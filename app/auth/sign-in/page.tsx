'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff } from "lucide-react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Highlight } from '@/components/pages/Highlight';
import { GoogleSignInButton } from '@/components/dashboardItems/google';

const Page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Step 1: Login and get auth token
      const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/token/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: formData.email,
            password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();
     
      if (!loginResponse.ok) {
        setError(loginData.error || loginData.detail || 'Login failed');
        setIsLoading(false);
        return;
      }

      // Extract auth_token from response
      const authToken = loginData.auth_token;
      if (!authToken) {
        setError('No authentication token received');
        setIsLoading(false);
        return;
      }

      // Store token in sessionStorage with Token prefix (as used by API)
      sessionStorage.setItem('Authorization',`Token ${authToken}`);

      
      // Step 2: Fetch user data using the token
      try {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/users/me/`, {
          method: 'GET',
          headers: {
            'Authorization': `${sessionStorage.getItem('Authorization')}`,
            'Content-Type': 'application/json',
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          
          // Store user data in sessionStorage
          sessionStorage.setItem('email', userData.email || formData.email);
          sessionStorage.setItem('id', userData.id?.toString() || '');
          sessionStorage.setItem('name', userData.name || '');
          // sessionStorage.setItem('UserData', JSON.stringify(userData));
          
          router.push('/dashboard/');
        } else {
          console.warn('Failed to fetch user data, but login was successful');
          // Still proceed with login even if user data fetch fails
          sessionStorage.setItem('email', formData.email);
        }
      } catch (userErr) {
        console.warn('Error fetching user data:', userErr);
        // Still proceed with login even if user data fetch fails
        sessionStorage.setItem('email', formData.email);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full mt-20 sm:mt-12 flex items-center justify-center p-4">
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
          {/* Sign-in Form */}
          <div className="bg-white rounded-mid border-2 border-slate-300  p-6 space-y-4"> 
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Sign In to <Highlight>Elevate Exams</Highlight></h2>
              <p className="text-slate-600 text-sm">
                Don't have an account?{' '}
                <Link href="/auth/sign-up" className="text-blue-700 hover:underline font-semibold">
                  Create one here
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
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

              {/* Password Field */}
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
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-mid p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-blue-700 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <div className="flex justify-between">
              <Button 
                type="submit"
                className="w-full mr-4 bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 rounded-mid"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
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
                </div>

                {/* Sign In with Google Button */}
               <GoogleSignInButton />
                
            
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
