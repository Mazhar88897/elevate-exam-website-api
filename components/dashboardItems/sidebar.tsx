"use client"

import { useState, useEffect } from "react"
import { Home, Users, FileText, User, HelpCircle, Bell, LogOut, Menu, X, MoreHorizontal, Settings, BookOpen, Megaphone, LucideIcon, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationModal } from "@/components/shared/notification-modal"

interface SidebarProps {
  className?: string
}

type MenuItem = {
  icon?: LucideIcon
  component?: React.ComponentType
  label: string
  link?: string
  iconColor?: string
}

type MenuCategory = {
  title: string
  items: MenuItem[]
}

export default function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    // Initial check
    checkScreenSize()

    // Add event listener
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleMenuItemClick = (label: string) => {
    if (label === "Notifications") {
      setNotificationOpen(true)
    } else if (label === "Logout") {
      setLogoutOpen(true)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      // Get the auth token from sessionStorage
      const authToken = sessionStorage.getItem('Authorization')
      
      if (!authToken) {
        // If no token, just clear session and redirect
        sessionStorage.clear()
        router.push('/auth/sign-in')
        return
      }

      // Call logout API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/token/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      // Clear session storage regardless of API response
      sessionStorage.clear()

      // Redirect to sign-in page
      router.push('/auth/sign-in')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if API call fails, clear session and redirect
      sessionStorage.clear()
      router.push('/auth/sign-in')
    } finally {
      setIsLoggingOut(false)
      setLogoutOpen(false)
    }
  }

  const isActiveLink = (link?: string) => {
    if (!link) return false

    const normalize = (value: string) => {
      const trimmed = value.replace(/\/+$/, '')
      return trimmed === '' ? '/' : trimmed
    }

    return normalize(pathname) === normalize(link)
  }

  const menuCategories: MenuCategory[] = [
    {
      title: "LEARNING",
      items: [
        { icon: BookOpen, label: "My Courses", link: "/dashboard", iconColor: "text-blue-500" }
      ]
    },
    {
      title: "COMMUNICATION",
      items: [
        { icon: Megaphone, label: "Announcements", link: "/dashboard/announcements", iconColor: "text-red-500" },
        { icon: Bell, label: "Notifications", iconColor: "text-green-500" }
      ]
    },
    {
      title: "SUPPORT",
      items: [
        { icon: HelpCircle, label: "Help Center", link: "/dashboard/help", iconColor: "text-purple-500" }
      ]
    },
    {
      title: "ACCOUNT",
      items: [
        { icon: Settings, label: "Settings", link: "/dashboard/account", iconColor: "text-gray-500" },
        { component: ThemeToggle, label: "Theme" }
      ]
    }
  ]

  const logoutItem = { icon: LogOut, label: "Logout" }
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    setMobile(window.innerWidth < 768)
  }, [])
  
  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="fixed bg-transparent top-[17px] left-4 z-50 md:hidden"
      >
        {isOpen ? <X className="text-foreground" size={24} /> : <Menu size={24} className="text-foreground" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-background border-r border-border transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          className,
        )}
      >
        {/* Logo */}
        <div className="flex py-4 items-center justify-center h-16 px-4">
          <Image className="dark:hidden " src="/logo.svg" alt="Logo" width={200} height={150} />
          <Image className="hidden dark:block" src="/logo-white.png" alt="Logo" width={150} height={100} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pt-4 space-y-2 overflow-y-auto">
          {menuCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">
                {category.title}
              </h3>
              <div className="space-y-1">
                {category.items.map((item, itemIndex) => {
                  const isActive = isActiveLink(item.link)
                  return (
                    <div key={itemIndex}>
                      {item.component ? (
                        // If item has a component -> render the component
                        <div className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground">
                          <item.component />
                          <span className="ml-3">{item.label}</span>
                        </div>
                      ) : item.link ? (
                        // If item has link -> normal link
                        <Link
                          href={item.link}
                          className={cn(
                            "flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground",
                            isActive && "text-xcolor"
                          )}
                        >
                          {item.icon && <item.icon className={`w-4 h-4 mr-3 ${item.iconColor || ''} ${isActive ? 'text-xcolor' : ''}`} />}
                          {item.label}
                        </Link>
                      ) : (
                        // If item has NO link -> behave like a button
                        <button
                          onClick={() => handleMenuItemClick(item.label)}
                          className="w-full flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
                        >
                          {item.icon && <item.icon className={`w-4 h-4 mr-3 ${item.iconColor || ''}`} />}
                          {item.label}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

            </div>
          ))}
        </nav>
        <div className="w-full flex justify-center  items-center mb-3  ">
      <div className="bg-gray-800 w-[180px] h-[150px] py-5 rounded-[10px]  text-center ">
            {/* Icon */}
            <div className="flex justify-center items-center gap-2 text-xs font-bold sm:block hidden text-xcolor rounded-full mx-auto mb-4">
             
              <span>Access More Domains</span>
            </div>
          
           
            
            {/* Text */}
            <h3 className="text-white font-semibold text-sm leading-tight mb-4">
             Elevate Exam is Ready<br />
              to help You Grow.
            </h3>
            
            {/* Button */}
            <Link href="/dashboard/add-domain" className="bg-xcolor hover:bg-yellow-700  text-xs text-white font-semibold px-6 py-2 rounded-full transition-colors duration-200">
              Buy Now
            </Link>
          </div>
         

        </div>
       
        <div className="px-4 py-4 border-t border-border">
          <button
            onClick={() => handleMenuItemClick(logoutItem.label)}
            className="w-full flex items-center px-2 py-3 text-sm font-bold rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            <logoutItem.icon className="w-5 font-bold h-5 mr-3" />
            {logoutItem.label}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Notification Modal */}
      <NotificationModal open={notificationOpen} onOpenChange={setNotificationOpen} />

      {/* Logout Confirmation Modal */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background">
          <DialogHeader>
            <DialogTitle className="text-foreground">Confirm Logout</DialogTitle>
            <DialogDescription className="text-muted-foreground">Are you sure you want to log out of your account?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:space-x-2">
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
