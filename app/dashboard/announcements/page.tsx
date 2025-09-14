"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Megaphone, Clock, AlertCircle, Info, CheckCircle, Calendar } from "lucide-react"

interface Announcement {
  id: number
  title: string
  description: string
  type: "info" | "warning" | "success" | "urgent"
  date: string
  time: string
  isRead: boolean
}

const sampleAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "New Course Available: Advanced Python Programming",
    description: "We've just launched our new Advanced Python Programming course. This comprehensive course covers advanced topics including decorators, generators, async programming, and more. Enroll now to enhance your Python skills!",
    type: "info",
    date: "2024-01-15",
    time: "10:30 AM",
    isRead: true
  },
  {
    id: 2,
    title: "System Maintenance Scheduled",
    description: "Scheduled maintenance will occur on January 20th from 2:00 AM to 4:00 AM EST. During this time, the platform may be temporarily unavailable. We apologize for any inconvenience.",
    type: "warning",
    date: "2024-01-14",
    time: "3:45 PM",
    isRead: true
  },
  {
    id: 3,
    title: "Congratulations! we have new feature",
    description: "We have added a new feature to the platform. You can now create your own study groups and connect with other learners. This is a great way to study together and get help from other learners.",
    type: "success",
    date: "2024-01-13",
    time: "9:15 AM",
    isRead: true
  },
  {
    id: 4,
    title: "Urgent: Security Update Required",
    description: "Please update your password immediately due to a recent security enhancement. This is mandatory for all users to ensure account security.",
    type: "urgent",
    date: "2024-01-12",
    time: "11:20 AM",
    isRead: true
  },
 
 
]

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(sampleAnnouncements)
  const [filter, setFilter] = useState<"all" | "unread" | "urgent">("all")

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "urgent":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "info":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Info</Badge>
      case "warning":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Warning</Badge>
      case "success":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>
      case "urgent":
        return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">Urgent</Badge>
      default:
        return <Badge variant="secondary">Info</Badge>
    }
  }

  const markAsRead = (id: number) => {
    setAnnouncements(prev => 
      prev.map(announcement => 
        announcement.id === id 
          ? { ...announcement, isRead: true }
          : announcement
      )
    )
  }

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === "unread") return !announcement.isRead
    if (filter === "urgent") return announcement.type === "urgent"
    return true
  })

  const unreadCount = announcements.filter(a => !a.isRead).length
  const urgentCount = announcements.filter(a => a.type === "urgent").length

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between p-4 md:p-6">
        <h1 className="text-lg px-10 md:px-2 font-bold">Announcements</h1>
        {/* <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white">
            <Megaphone className="h-4 w-4" />
          </div>
          <span className="hidden md:inline text-sm text-gray-600 dark:text-white">
            {unreadCount} unread
          </span>
        </div> */}
      </header>

      <main className="px-4 md:p-6 pb-8 max-w-4xl mx-auto">
        {/* Filter Tabs */}
        {/* <div className="flex items-center gap-4 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="rounded-md"
          >
            All ({announcements.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
            className="rounded-md"
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === "urgent" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("urgent")}
            className="rounded-md"
          >
            Urgent ({urgentCount})
          </Button>
        </div> */}

        {/* Announcements List */}
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <Card 
              key={announcement.id} 
              className={'transition-all duration-200 hover:shadow-md '}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getTypeIcon(announcement.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-base font-semibold">
                          {announcement.title}
                        </CardTitle>
                        {getTypeBadge(announcement.type)}
                        {!announcement.isRead && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <CardDescription className="text-sm leading-relaxed">
                        {announcement.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(announcement.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {announcement.time}
                    </div>
                  </div>
                  {!announcement.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(announcement.id)}
                      className="text-xs h-7 px-2"
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No announcements found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === "all" 
                ? "There are no announcements at the moment."
                : filter === "unread" 
                ? "You've read all announcements."
                : "There are no urgent announcements."
              }
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
