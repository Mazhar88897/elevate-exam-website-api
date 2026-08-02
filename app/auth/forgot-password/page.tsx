'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

const Page = () => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
    'https://elevate-backend.up.railway.app'
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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
      toast.success(
        'Password reset email sent. Please check your email for the reset link.'
      )
      router.push('/auth/sign-in')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
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
          Back to log in
        </Link>
      </header>

      <div className="grid flex-1 lg:grid-cols-2">
        <aside className="hidden flex-col justify-center bg-[#111111] px-10 py-16 lg:flex xl:px-16">
          <div className="max-w-md">
            <span className="inline-block border border-white/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              Account recovery
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
              Reset your
              <br />
              <span className="underline decoration-white decoration-2 underline-offset-4">
                password.
              </span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              We&apos;ll email you a secure link so you can choose a new password
              and get back to studying.
            </p>

            <ul className="mt-10 space-y-3">
              {[
                'Secure one-time reset link',
                'Link expires for your protection',
                'Your progress stays saved',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                >
                  <Check
                    className="h-4 w-4 shrink-0 text-white"
                    strokeWidth={2.5}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex items-center justify-center px-6 py-12 lg:px-10">
          <div className="w-full max-w-sm">
            <h2 className="font-display text-3xl font-bold tracking-tight text-black">
              Forgot password
            </h2>
            <p className="mt-1.5 text-sm text-neutral-500">
              Enter your email and we&apos;ll send a reset link.
            </p>

            {!success ? (
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
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="mt-8 space-y-5">
                <div className="border border-black bg-[#FDF2F7] px-4 py-3 text-sm text-black">
                  Password reset link has been sent to your email address.
                </div>
                <p className="text-sm text-neutral-500">
                  Didn&apos;t receive the email? Check spam, or try again with a
                  different address.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false)
                    setFormData({ email: '' })
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 border border-black bg-white px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-neutral-50"
                >
                  Try a different email
                </button>
              </div>
            )}

            <p className="mt-6 text-center text-sm text-neutral-500">
              Remembered it?{' '}
              <Link
                href="/auth/sign-in"
                className="font-semibold text-[#C97878] hover:underline"
              >
                Log in
              </Link>
              {' · '}
              <Link
                href="/auth/sign-up"
                className="font-semibold text-black hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
