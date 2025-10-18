'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

const Page = () => {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/signup/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otp: otpString,
          email: sessionStorage.getItem('signupEmail')
        }),
      });

      const data = await response.json();
     
      if (!response.ok) {
        setError(data.error || 'OTP verification failed');
        return;
      }

      // Store token in session with proper Authorization format
      const authToken = `Bearer ${data.token}`;
      sessionStorage.setItem('Authorization', authToken);
      sessionStorage.setItem('UserData', JSON.stringify(data.user));
      
      // Log the token
      console.log('Auth Token:', authToken);
      console.log('user data', data);
      
      // Redirect to dashboard
      router.push('/auth/sign-in');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sessionStorage.getItem('signupEmail')
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to resend OTP');
        setCanResend(true);
        return;
      }

      // Only reset timer if successful
      setCanResend(false);
   
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCanResend(true);
    } finally {
      setIsLoading(false);
      setTimer(30);
    }
  };

  return (
    <div className='m-5'>
      <div className="flex justify-center items-center flex-1 mt-12">
        <div className="w-full max-w-md border border-white rounded-mid p-6">
          <h2 className="text-white text-xl font-bold mb-1">Verify OTP</h2>
          <p className="text-white font-semibold text-sm mb-2">Enter the 6-digit code sent to your email.</p>
          <p className="text-white text-xs mb-6 opacity-80">If you do not see the email, please check your spam/junk folder.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-bold text-white mb-3">
                Enter OTP:
              </label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="w-12 h-12 text-center bg-white rounded-mid border-teal-700 text-lg font-bold"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm font-semibold text-center">
                {error}
              </div>
            )}

            <div className="text-center text-sm pt-2">
              {timer > 0 ? (
                <p className="text-white font-semibold">
                  Resend OTP in {timer} seconds
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-white font-semibold hover:text-teal-300 underline"
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <div className="flex justify-between pt-6">
              <Link href="/auth/sign-in"> 
                <Button 
                  type="button"
                  variant="ghost"  
                  className="text-white font-bold hover:bg-teal-800"
                  disabled={isLoading}
                >
                  Back to Sign In
                </Button>
              </Link> 
              <Button 
                type="submit"
                className="bg-white text-teal-900 hover:bg-gray-100"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Page
