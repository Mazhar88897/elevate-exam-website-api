'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface GoogleSignInButtonProps {
  isLoading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  redirectUri?: string
}

export const GoogleSignInButton = ({ 
  isLoading: externalLoading = false, 
  onClick,
  type = 'button',
  className = '',
  redirectUri
}: GoogleSignInButtonProps) => {
  const [internalLoading, setInternalLoading] = useState(false)
  
  const isLoading = externalLoading || internalLoading

  const handleGoogleSignIn = async () => {
    // If custom onClick is provided, use it
    if (onClick) {
      onClick()
      return
    }

    // Otherwise, handle Google OAuth flow
    try {
      setInternalLoading(true)
      
      // Get redirect URI - use provided one, or default to current origin + /google_callback
      const redirectUrl = redirectUri || `${window.location.origin}/google_callback`
      
      // Fetch authorization URL from backend
      // Include credentials to establish session for state validation
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/o/google-oauth2/?redirect_uri=${encodeURIComponent(redirectUrl)}`,
        {
          method: 'GET',
          credentials: 'include', // Include cookies/session data - essential for Django session
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to get authorization URL')
      }

      const data = await response.json()
      
      // Redirect to Google OAuth authorization URL
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        throw new Error('No authorization URL received')
      }
    } catch (error) {
      console.error('Error initiating Google sign-in:', error)
      setInternalLoading(false)
      // You might want to show an error toast here
    }
  }

  return (
    <div className="w-full">
      <Button 
        type={type}
        onClick={handleGoogleSignIn}
        className={`w-full bg-black hover:bg-black text-white font-semibold py-2 rounded-mid flex items-center justify-center gap-3 ${className}`}
        disabled={isLoading}
      >
        {!isLoading && (
          <Image 
            src="/Google.png" 
            alt="Google logo" 
            width={20} 
            height={20}
            className="object-contain"
          />
        )}
        {isLoading ? 'Signing In...' : 'Sign In with Google'}
      </Button>
    </div>
  )
}
