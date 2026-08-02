'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, BookOpen, Calendar, Eye, EyeOff, Lightbulb, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { GoogleSignInButton } from '@/components/dashboardItems/google'

const benefits = [
  { icon: BookOpen, text: 'Seven courses across four categories' },
  { icon: BarChart3, text: 'Domain-by-domain performance tracking' },
  { icon: Lightbulb, text: 'Detailed explanations after every answer' },
  { icon: Calendar, text: 'Full year of access from purchase date' },
]

const Page = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    name: '',
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
    setError('')

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          description: '',
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || data.detail || 'Sign up failed')
        setIsLoading(false)
        return
      }

      sessionStorage.setItem('signupEmail', formData.email)
      sessionStorage.setItem('signupName', formData.name)

      toast.success('Please check your email for the Activation Link.')
      router.push('/auth/sign-in')
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
          href="/auth/sign-in"
          className="border border-black bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-neutral-50"
        >
          Already have an account
        </Link>
      </header>

      <div className="grid flex-1 lg:grid-cols-2">
        {/* Left panel */}
        <aside className="hidden flex-col justify-center bg-[#111111] px-10 py-16 lg:flex xl:px-16">
          <div className="max-w-md">
            <span className="inline-block border border-white/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              Create account
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
              Start your
              <br />
              <span className="underline decoration-white decoration-2 underline-offset-4">
                journey today.
              </span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              Join professionals and students preparing for their certifications
              on Elevate Exams.
            </p>

            <ul className="mt-10 space-y-3">
              {benefits.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-3 border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                >
                  <Icon className="h-4 w-4 shrink-0 text-[#F5C6C6]" strokeWidth={2} />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Right form */}
        <div className="flex items-center justify-center px-6 py-12 lg:px-10">
          <div className="w-full max-w-sm">
            <h2 className="font-display text-3xl font-bold tracking-tight text-black">
              Create account
            </h2>
            <p className="mt-1.5 text-sm text-neutral-500">
              Takes less than a minute. Free to register.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-semibold text-black"
                >
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-black"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

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
                  placeholder="you@example.com"
                  className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-black"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-semibold text-black"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    className="w-full border border-neutral-300 bg-white px-3 py-2.5 pr-10 text-sm text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-black"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={8}
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
                  {typeof error === 'string' ? error : JSON.stringify(error)}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
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
              Have an account?{' '}
              <Link
                href="/auth/sign-in"
                className="font-semibold text-[#C97878] hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
