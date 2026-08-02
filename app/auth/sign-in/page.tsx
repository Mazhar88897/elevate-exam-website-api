'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Check, Eye, EyeOff } from 'lucide-react'
import { GoogleSignInButton } from '@/components/dashboardItems/google'
import {
  fetchAndStoreSubscription,
  getPostLoginPath,
  persistUserPaymentFields,
} from '@/lib/payment-access'

const Page = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    sessionStorage.clear()
    setError('')
    setIsLoading(true)

    try {
      const loginResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/token/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      )

      const loginData = await loginResponse.json()

      if (!loginResponse.ok) {
        setError(loginData.error || loginData.detail || 'Login failed')
        setIsLoading(false)
        return
      }

      const authToken = loginData.auth_token
      if (!authToken) {
        setError('No authentication token received')
        setIsLoading(false)
        return
      }

      sessionStorage.setItem('Authorization', `Token ${authToken}`)

      try {
        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/auth/users/me/`,
          {
            method: 'GET',
            headers: {
              Authorization: `${sessionStorage.getItem('Authorization')}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (userResponse.ok) {
          const userData = await userResponse.json()
          sessionStorage.setItem('email', userData.email || formData.email)
          sessionStorage.setItem('id', userData.id?.toString() || '')
          sessionStorage.setItem('name', userData.name || '')
          sessionStorage.setItem('FromLandingPage', 'false')
          persistUserPaymentFields(userData)
        } else {
          sessionStorage.setItem('email', formData.email)
        }

        const isActive = await fetchAndStoreSubscription()
        router.push(getPostLoginPath(isActive))
      } catch {
        sessionStorage.setItem('email', formData.email)
        const isActive = await fetchAndStoreSubscription()
        router.push(getPostLoginPath(isActive))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Top bar */}
      <header className="flex h-16 items-center justify-between border-b border-neutral-200 px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center bg-[#F5C6C6] font-display text-[11px] font-bold text-black">
            EE
          </span>
          <span className="font-display text-[17px] font-bold tracking-tight text-black">
            ElevateExams
          </span>
        </Link>
        <Link
          href="/auth/sign-up"
          className="bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
        >
          Create account
        </Link>
      </header>

      <div className="grid flex-1 lg:grid-cols-2">
        {/* Left panel */}
        <aside className="hidden flex-col justify-center bg-[#111111] px-10 py-16 lg:flex xl:px-16">
          <div className="max-w-md">
            <span className="inline-block border border-white/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              Welcome back
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
              Good to see
              <br />
              <span className="underline decoration-white decoration-2 underline-offset-4">
                you again.
              </span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              Your progress is saved. Pick up exactly where you left off.
            </p>

            <ul className="mt-10 space-y-3">
              {[
                'Scores and progress saved',
                'Domain tracking across sessions',
                'Purchase additional courses any time',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                >
                  <Check className="h-4 w-4 shrink-0 text-white" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Right form */}
        <div className="flex items-center justify-center px-6 py-12 lg:px-10">
          <div className="w-full max-w-sm">
            <h2 className="font-display text-3xl font-bold tracking-tight text-black">
              Log in
            </h2>
            <p className="mt-1.5 text-sm text-neutral-500">
              Enter your details below.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-semibold text-black"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="sarah@example.com"
                  className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-black"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-black"
                  >
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-neutral-500 hover:text-black"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full border border-neutral-300 bg-white px-3 py-2.5 pr-10 text-sm text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-black"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
              >
                {isLoading ? 'Logging in...' : 'Log in'}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs text-neutral-400">or</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <div
              onClick={() => {
                sessionStorage.clear()
              }}
            >
              <GoogleSignInButton
                className="!rounded-none !bg-white !text-black border border-black hover:!bg-neutral-50"
              />
            </div>

            <p className="mt-6 text-center text-sm text-neutral-500">
              No account?{' '}
              <Link
                href="/auth/sign-up"
                className="font-semibold text-[#C97878] hover:underline"
              >
                Register free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
