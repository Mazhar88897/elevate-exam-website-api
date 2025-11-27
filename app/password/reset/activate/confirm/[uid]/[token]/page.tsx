'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Highlight } from '@/components/pages/Highlight'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'

type PasswordRule = {
  id: string
  label: string
  test: (value: string) => boolean
}

const passwordRules: PasswordRule[] = [
  { id: 'length', label: 'At least 8 characters', test: value => value.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: value => /[A-Z]/.test(value) },
  { id: 'lower', label: 'One lowercase letter', test: value => /[a-z]/.test(value) },
  { id: 'number', label: 'One number', test: value => /\d/.test(value) },
  { id: 'symbol', label: 'One special character', test: value => /[^A-Za-z0-9]/.test(value) },
]

type PageProps = {
  params: {
    uid: string
    token: string
  }
}

const Page = ({ params }: PageProps) => {
  const router = useRouter()
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
    'https://elevate-backend.up.railway.app'

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const satisfiedRules = useMemo(
    () => passwordRules.filter(rule => rule.test(password)).map(rule => rule.id),
    [password]
  )

  const isStrongPassword = satisfiedRules.length === passwordRules.length
  const passwordsMatch = password !== '' && password === confirmPassword

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!isStrongPassword) {
      setError('Please use a stronger password that meets all requirements.')
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${apiBaseUrl}/auth/users/reset_password_confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: params.uid,
          token: params.token,
          new_password: password,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(
          data?.detail ||
            data?.error ||
            'We could not reset your password. Please try again or request a new link.'
        )
      }

      setSuccess('Password updated successfully. You can now sign in with the new password.')
      setPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        router.push('/auth/sign-in')
      }, 2200)
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'An unexpected error occurred. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
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
              <h1 className="text-2xl font-bold text-slate-800 mb-1">
                Set a new password for <Highlight>Elevate Exams</Highlight>
              </h1>
              <p className="text-slate-600 text-sm">
                Choose a strong password and confirm it. Once everything looks good, we&apos;ll
                securely update your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
                  New password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    className="w-full bg-white rounded-mid border-slate-300 pr-10"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    onClick={() => setShowPassword(prev => !prev)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    className="w-full bg-white rounded-mid border-slate-300 pr-10"
                    value={confirmPassword}
                    onChange={event => setConfirmPassword(event.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-600 mt-1">Passwords need to match exactly.</p>
                )}
              </div>

              {password && (
                <div className="text-xs mt-1 font-semibold">
                  <p className={isStrongPassword ? 'text-green-700' : 'text-slate-600'}>
                    Password should be 8+ chars with uppercase, lowercase, number & symbol.
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-mid p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-mid p-3 text-green-700 text-sm">
                  {success}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/auth/forgot-password" className="w-full">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-slate-600 hover:bg-slate-100"
                    disabled={isSubmitting}
                  >
                    Start over
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold"
                  disabled={isSubmitting || !isStrongPassword || !passwordsMatch}
                >
                  {isSubmitting ? 'Updating...' : 'Update password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
