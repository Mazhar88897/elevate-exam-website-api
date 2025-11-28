'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  useEffect(() => {
    const fetchCallback = async () => {
      // Get the authorization code and state from URL query parameters
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')

      if (error) {
        console.error('OAuth Error:', error)
        return
      }

      if (!code || !state) {
        console.error('No authorization code or state found in URL')
        return
      }

      try {
        // Build the endpoint URL with state and code as query parameters
        // The redirect_uri might also be needed to match the initial OAuth request
        const redirectUri = `${window.location.origin}/google_callback`
        const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/o/google-oauth2/?state=${encodeURIComponent(state)}&code=${encodeURIComponent(code)}`
        
        // Make POST request to the endpoint with credentials to maintain session
        // credentials: 'include' is crucial for cross-origin requests to send cookies
        const response = await fetch(endpoint, {
          method: 'POST',
          credentials: 'include', // Include cookies/session data - essential for Django session
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()
        
      if (response.ok) {
        console.log('Google Callback Response:', data)
        sessionStorage.setItem('Authorization',`Bearer ${data.access}`)
        sessionStorage.setItem('RefreshToken',`Bearer ${data.refresh}`)
        
        // Fetch user data after successful authentication
        try {
          const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/users/me/`, {
            method: 'GET',
            headers: {
              'Authorization': `${sessionStorage.getItem('Authorization')}`,
              'Content-Type': 'application/json',
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            
            // Store user data in sessionStorage
            sessionStorage.setItem('email', userData.email || '');
            sessionStorage.setItem('id', userData.id?.toString() || '');
            sessionStorage.setItem('name', userData.name || '');
            
            router.push('/dashboard/');
          } else {
            console.warn('Failed to fetch user data, but login was successful');
            // Still proceed with login even if user data fetch fails
            router.push('/dashboard/');
          }
        } catch (userErr) {
          console.warn('Error fetching user data:', userErr);
          // Still proceed with login even if user data fetch fails
          router.push('/dashboard/');
        }
      }
    } catch (err) {
      console.error('Error fetching callback:', err)
      router.push('/auth/sign-in')
    }
    }

    fetchCallback()
  }, [searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Processing Google authentication...</p>
    </div>
  )
}