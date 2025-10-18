'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff } from "lucide-react";

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: formData.email,
            password: formData.password,
        }),
      });

      const data = await response.json();
     
      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Store user data in sessionStorage
      sessionStorage.setItem('email', data.user.email);
      sessionStorage.setItem('id', data.user.id.toString());
      sessionStorage.setItem('name', data.user.name);
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('Authorization', `Bearer ${data.token}`);
      
      // Also store the complete user data for convenience
      sessionStorage.setItem('UserData', JSON.stringify(data.user));
      
      // Log the stored data
      console.log('Stored email:', data.user.email);
      console.log('Stored id:', data.user.id);
      console.log('Stored name:', data.user.name);
      console.log('Stored token:', data.token);
      
      // Redirect to dashboard
      router.push('/dashboard/sponsor');
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
            <h2 className="text-white text-xl font-bold mb-1"> Sign in to OnlyCNCs</h2>
            <Link href="/auth/sign-up" className="text-white font-semibold text-md mb-2">Click here to <span className='text-[#03BFB5]'>create an account</span></Link>
            <p className="text-white font-semibold text-xs mb-5">Already have an account? Log in below.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block font-bold text-white mb-1">
                Email:
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white rounded-mid border-teal-700"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block rounded-mid font-bold text-white mb-1">
                Password:
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full bg-white rounded-mid border-teal-700 pr-10"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm font-semibold">
                {error}
              </div>
            )}

            <div className="flex px-1 justify-between text-sm pt-2">
              <Link href="/auth/sign-up" className="text-white font-semibold hover:text-white">
                
              </Link>
              <Link href="/auth/forgot-password" className="text-white font-semibold hover:text-white">
                Forgot Password?
              </Link>
            </div>

            <div className="flex justify-between pt-6">
              <Link href="/"> 
                <Button 
                  type="button"
                  variant="ghost"  
                  className="text-white font-bold hover:bg-teal-800"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </Link> 
              <Button 
                type="submit"
                className="bg-white text-teal-900 hover:bg-gray-100"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Page
