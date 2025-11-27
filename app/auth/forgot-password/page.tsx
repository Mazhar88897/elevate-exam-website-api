'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useState } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Highlight } from '@/components/pages/Highlight'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
const Page = () => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
    'https://elevate-backend.up.railway.app'
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsLoading(true)

    try {
      const response = await fetch(`${apiBaseUrl}/auth/users/reset_password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      })

      const rawBody = await response.text()
      let data: { detail?: string; error?: string } | null = null
      if (rawBody) {
        try {
          data = JSON.parse(rawBody)
        } catch {
          data = null
        }
      }
     
      if (!response.ok) {
        setError(data?.detail || data?.error || 'Failed to send reset email')
        return
      }

      setSuccess(true)
      setFormData({ email: '' })
      toast.success('Password reset email sent. Please check your email for the reset link.')
      router.push('/auth/sign-in')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full mt-20 sm:mt-12 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
          <DotLottieReact
            src="/animation.lottie"
            className="h-[460px]"
            loop
            autoplay
          />
        </div>

        <div className="w-full max-w-md mx-auto lg:w-1/2 lg:max-w-none">
          <div className="bg-white rounded-mid border-2 border-slate-300 p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">
                Reset password for <Highlight>Elevate Exams</Highlight>
              </h2>
              <p className="text-slate-600 text-sm">
                Enter your email address and we&apos;ll send you a secure link to reset your password.
              </p>
            </div>

            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-4">
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

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-mid p-3 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex justify-between text-sm pt-2">
                  <Link href="/auth/sign-in" className="text-blue-700 hover:underline font-semibold">
                    Back to Sign In
                  </Link>
                  <Link href="/auth/sign-up" className="text-blue-700 hover:underline font-semibold">
                    Create Account
                  </Link>
                </div>

                <div className="flex justify-between gap-3 pt-4">
                  <Link href="/" className="w-full">
                    <Button 
                      type="button"
                      variant="ghost"  
                      className="w-full text-slate-600 hover:bg-slate-100"
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </Link> 
                  <Button 
                    type="submit"
                    className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Link'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-semibold text-center p-3 rounded-mid">
                  Password reset link has been sent to your email address. 
                </div>

                <div className="text-center text-sm">
                  <p className="text-slate-600 font-semibold mb-2">
                    Didn&apos;t receive the email?
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(false)
                      setFormData({ email: '' })
                    }}
                    className="text-blue-700 font-semibold hover:underline"
                  >
                    Try again with a different email
                  </button>
                </div>

                <div className="flex justify-between gap-3 pt-4">
                  <Link href="/auth/sign-in" className="w-full"> 
                    <Button 
                      type="button"
                      variant="ghost"  
                      className="w-full text-slate-600 hover:bg-slate-100"
                    >
                      Back to Sign In
                    </Button>
                  </Link> 
                  <Link href="/" className="w-full"> 
                    <Button 
                      type="button"
                      className="w-full bg-blue-800 hover:bg-blue-900 text-white"
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
    </div>
  )
}

export default Page
