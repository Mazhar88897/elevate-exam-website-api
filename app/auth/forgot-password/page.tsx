'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const Page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const data = await response.json();
     
      if (!response.ok) {
        setError(data.error || 'Failed to send reset email');
        return;
      }
        // Store email for OTP verification
        sessionStorage.setItem('forgotPasswordEmail', formData.email);
        // Redirect to OTP entry page
        router.push('/auth/forgot-password/otp');

      setSuccess(true);
      console.log('Password reset email sent:', data);
      
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
          <h2 className="text-white text-xl font-bold mb-1">Forgot Password</h2>
          <p className="text-white font-semibold text-sm mb-6">Enter your email address to receive a password reset link.</p>

          {!success ? (
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

              {error && (
                <div className="text-red-400 text-sm font-semibold">
                  {error}
                </div>
              )}

              <div className="flex px-1 justify-between text-sm pt-2">
                <Link href="/auth/sign-in" className="text-white font-semibold hover:text-white">
                  Back to Sign In
                </Link>
                <Link href="/auth/sign-up" className="text-white font-semibold hover:text-white">
                  Create Account
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
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-white text-sm font-semibold text-center bg-green-900/20 p-3 rounded-mid">
                Password reset OTP has been sent to your email address. 
              </div>

              <div className="text-center text-sm">
                <p className="text-white font-semibold mb-2">
                  Didn&apos;t receive the email?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setFormData({ email: '' });
                  }}
                  className="text-white font-semibold hover:text-teal-300 underline"
                >
                  Try again with a different email
                </button>
              </div>

              <div className="flex justify-between pt-6">
                <Link href="/auth/sign-in"> 
                  <Button 
                    type="button"
                    variant="ghost"  
                    className="text-white font-bold hover:bg-teal-800"
                  >
                    Back to Sign In
                  </Button>
                </Link> 
                <Link href="/"> 
                  <Button 
                    type="button"
                    className="bg-white text-teal-900 hover:bg-gray-100"
                  >
                    Go Home
                  </Button>
                </Link> 
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Page
