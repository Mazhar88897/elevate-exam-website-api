'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
type ActivationStatus = 'loading' | 'success' | 'error'

const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_BASE_URL
  return envUrl }
export default function ActivateAccountPage() {
  const params = useParams<{ uid?: string; token?: string }>()
  const uid = params?.uid
  const token = params?.token
  const router = useRouter()
  const [status, setStatus] = useState<ActivationStatus>('loading')
  const [message, setMessage] = useState('Activating your account...')
  const [details, setDetails] = useState<string | null>(null)

  const runActivation = useCallback(async () => {
    if (!uid || !token) {
      setStatus('error')
      setMessage('Activation link is incomplete or invalid.')
      setDetails('Please copy and paste the full link from your email and try again.')
      return
    }

    setStatus('loading')
    setMessage('Activating your account...')
    setDetails(null)

    try {
      const response = await fetch(`${getBaseUrl()}/auth/users/activation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          token,
        }),
      })

      const rawBody = await response.text()
      let parsedBody: { detail?: string; message?: string } | null = null

      if (rawBody) {
        try {
          parsedBody = JSON.parse(rawBody)
        } catch {
          parsedBody = null
        }
      }

      if (!response.ok) {
        throw new Error(parsedBody?.detail || parsedBody?.message || 'Activation failed. Please request a new link.')
      }

      setStatus('success')
      setMessage(parsedBody?.detail || 'Your account has been activated successfully.')
      toast.success('Your account has been activated successfully.')
      router.push('/auth/sign-in')
    } catch (error) {
      setStatus('error')
      toast.error('Something went wrong while activating your account.')
      router.push('/auth/sign-up')
    }
  }, [uid, token])

  useEffect(() => {
    runActivation()
  }, [runActivation])

 

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 text-2xl font-bold text-black dark:text-white">
     Activating your account...
    </div>
  )
}

