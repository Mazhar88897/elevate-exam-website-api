"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, BookOpen, GraduationCap, Award, Brain, Target, Users, Clock, Loader2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import toast from "react-hot-toast"

interface NotificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface NotificationItem {
  id: number
  message: string
  is_read: boolean
  created_at: string
}

export function NotificationModal({ open, onOpenChange }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Education-related icons
  const educationIcons = [BookOpen, GraduationCap, Award, Brain, Target, Users, Clock]
  
  // Custom logic to get random icon based on notification ID
  const getRandomIcon = (id: number) => {
    const iconIndex = id % educationIcons.length
    return educationIcons[iconIndex]
  }

  // Format time ago from ISO string
  const formatTimeAgo = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return created.toLocaleDateString()
  }

  // Fetch notifications from API
  useEffect(() => {
    if (open) {
      const fetchNotifications = async () => {
        try {
          setLoading(true)
          setError(null)
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/notifications/`, {
            method: 'GET',
            headers: {
              'Authorization': `${sessionStorage.getItem('Authorization')}`,
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            throw new Error('Failed to fetch notifications')
          }

          const data = await response.json()
          setNotifications(data)
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching notifications'
          setError(errorMessage)
          toast.error(errorMessage)
        } finally {
          setLoading(false)
        }
      }

      fetchNotifications()
    }
  }, [open])

  return (
      
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background  ">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">Notifications</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-xcolor" />
                <span className="text-gray-600">Loading notifications...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">
                Failed to load notifications
              </h3>
              <p className="text-gray-500 text-xs dark:text-gray-400 mb-4">
                {error}
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card key={notification.id} className={`bg-card ${!notification.is_read ? 'border-l-4 border-l-blue-500' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-card-foreground">{notification.message}</h3>
                      <p className="text-xs text-blue-500 mt-1">{formatTimeAgo(notification.created_at)}</p>
                      {!notification.is_read && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        {(() => {
                          const IconComponent = getRandomIcon(notification.id)
                          return <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        })()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Image
                src="/nothing.png"
                alt="No notifications"
                width={200}
                height={200}
                className="mx-auto mb-4"
              />
              <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">
                No notifications
              </h3>
              <p className="text-gray-500 text-xs dark:text-gray-400">
                You're all caught up! Check back later for new updates.
              </p>
            </div>
          )}
        </div>
        </DialogContent>
      </Dialog>

  )
} 