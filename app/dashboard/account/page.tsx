"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Eye, EyeOff, UserCircleIcon } from "lucide-react"
import toast from "react-hot-toast"

interface UserData {
  id: number
  name: string
  email: string
  description: string
  password: string
}

export default function AccountPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    password: '',
    confirmPassword: ''
  })
  const [hasChanges, setHasChanges] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setHasChanges(true)
  }

  const handleSaveChanges = async () => {
    if (!Token) {
      console.error('No token found')
      return
    }

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        description: formData.description,
      }

      // Only include password if it's provided
      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match')
          return
        }
        updateData.password = formData.password
      }

      console.log('Sending update data:', updateData)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/users/me/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${Token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const updatedData = await response.json()
        console.log('Update successful:', updatedData)
        setUserData(updatedData)
        setHasChanges(false)
        toast.success('Profile updated successfully!')
      } else {
        const errorData = await response.json()
        console.error('Update failed:', errorData)
        toast.error('Failed to update profile. Please try again.')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('An error occurred while updating your profile.')
    }
  }

  const Token = sessionStorage.getItem('Authorization') || '';

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      if (!Token) {
        console.log('No token found in sessionStorage')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/users/me/`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${Token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log('API Response Data:', data)
          setUserData(data)
          // Initialize form data with fetched user data
          setFormData({
            name: data.name || '',
            email: data.email || '',
            description: data.description || '',
            password: '',
            confirmPassword: ''
          })
        } else {
          console.error('Failed to fetch user data:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [Token])
  



  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between p-4 md:p-6">
        <h1 className="text-lg  px-10  md:px-2  font-bold">Account Settings</h1>
        {/* <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white">J</div>
          <span className="hidden md:inline text-sm text-gray-600">John Drew</span>
        </div> */}
      </header>

      {/* Debug Information */}
      

      <main className="px-4 md:px-6 pb-8 max-w-3xl mx-auto">
        <Card className="w-full">
          <CardHeader>
               <CardTitle className="flex items-center gap-2">
                <UserCircleIcon className="h-5 w-5 text-[#ffd404]" />
                Personal Information
              </CardTitle>
            <CardDescription >Update your account details and profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name"
                placeholder="John Doe" 
                value={formData.name} 
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="john@example.com" 
                value={formData.email} 
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password (leave blank to keep current)</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter new password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Confirm new password" 
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description">Bio</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Tell us a little about yourself"
                className="min-h-[120px]"
                value={formData.description}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button 
              variant="outline" 
              className="w-full rounded-mid sm:w-auto"
              onClick={() => {
                // Reset form data to original user data
                if (userData) {
                  setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    description: userData.description || '',
                    password: '',
                    confirmPassword: ''
                  })
                  setHasChanges(false)
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              className="w-full sm:w-auto rounded-mid h"
              onClick={handleSaveChanges}
              disabled={!hasChanges || loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
