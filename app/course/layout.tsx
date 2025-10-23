"use client"
import Link from "next/link"
import React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  FileText,
  User,
  HelpCircle,
  Bell,
  Menu,
  X,
  FileQuestion,
  CheckSquare,
  BarChart2,
  Bot,
  FileIcon,
  LogOut,
  MonitorPlay,
  BookText,
  HomeIcon,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Settings,
  BookOpen,
  Megaphone,
  LucideIcon,
  BookMarked,
  PenTool,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import clsx from "clsx"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import Image from "next/image"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent } from "@/components/ui/card"
import { NotificationModal } from "@/components/shared/notification-modal"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [openSections, setOpenSections] = useState({
    shared: true,
    quiz: true,
    services: true,
    Course: true,
    tools: true,
    practice: true,
  })

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
    if (label === "Notification") {
      setNotificationOpen(true)
    } else if (label === "Logout") {
      setLogoutOpen(true)
    }
  }

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Icon-only sidebar items

  const iconItems = [
    { icon: BookOpen, label: "Home", link: "/dashboard", color: "text-yellow-500" },
    { icon: Megaphone, label: "Announcements", link: "/dashboard/announcements", color: "text-red-500",hasSeparator: true },
    { icon: Bell, label: "Notifications", color: "text-green-500" },
    { icon: HelpCircle, label: "Help Center", link: "/dashboard/help", color: "text-purple-500",hasSeparator: true },
    { icon: Settings, label: "Settings", link: "/dashboard/account", color: "text-gray-500",hasSeparator: true },
    { component: ThemeToggle, label: "Theme"},
    { icon: LogOut, label: "Logout", color: "text-gray-500" },
  ]

  
  

  // Define the type for icon items to fix TypeScript error
  type IconItem = {
    icon?: any;
    component?: any;
    label: string;
    link?: string;
    hasSeparator?: boolean;
    color?: string;
  }

  // Define the type for service items
  type ServiceItem = {
    label: string;
    link?: string;
    badge?: number;
    subItems?: { label: string; link: string }[];
    icon?: LucideIcon;
    color?: string;
  }

  function getRandomColor(): string {
    const colors = ["yellow", "pink", "purple", "blue", "red", "orange", "green", "brown"]
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
  }

  // Item component for tree structure
    const Item = ({
    name,
    isLast = false,
    badge,
    link,
    icon,
    color,
  }: {
    name: string;
    isLast?: boolean;
    badge?: number;
    link?: string;
    icon?: LucideIcon;
    color?: string;
  }) => {
    const isActive = link && pathname === link;
    
    return (
      <div className="relative pl-6 pr-2 py-1 text-sm font-semibold text-foreground">
        {/* Vertical Line */}
        {/* <div
          className={clsx(
            "absolute left-2 w-px bg-gray-300",
            isLast ? "h-2.5 top-0" : "h-full top-0"
          )}
        />
       
        <div className="absolute left-2 top-2.5 h-px w-4 bg-gray-300" /> */}
    {/* Horizontal Line */}
        {/* Label + Badge */}
        <div className="flex justify-between items-center ml-2">
          {link ? (
            <Link 
              href={link} 
              className={`text-sm transition-colors flex items-center gap-2 ${
                isActive ? 'text-yellow-500' : 'hover:text-primary'
              }`}
            >
              {icon && React.createElement(icon, { 
                className: `w-4 h-4 ${isActive ? 'text-yellow-500' : color || ''}`, 
                strokeWidth: 2.5 
              })}
              {name}
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              {icon && React.createElement(icon, { className: `w-4 h-4 ${color || ''}`, strokeWidth: 2.5 })}
              <span>{name}</span>
            </div>
          )}
          {badge && (
            <span className="bg-pink-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
      </div>
    );
  };

  // ItemWithSubItems component for items that have subitems
  const ItemWithSubItems = ({
    name,
    isLast = false,
    badge,
    link,
    subItems,
    icon,
    color,
  }: {
    name: string;
    isLast?: boolean;
    badge?: number;
    link?: string;
    subItems?: { label: string; link: string }[];
    icon?: LucideIcon;
    color?: string;
  }) => {
    const isActive = link && pathname === link;
    const hasActiveSubItem = subItems?.some(subItem => pathname === subItem.link);
    
    return (
      <div className="relative pl-6 pr-2 py-1 text-sm font-semibold text-foreground">
        {/* Vertical Line */}
        {/* <div
          className={clsx(
            "absolute left-2 w-px bg-gray-300",
            isLast ? "h-2.5 top-0" : "h-full top-0"
          )}
        />
    
        <div className="absolute left-2 top-2.5 h-px w-4 bg-gray-300" /> */}
      {/* Horizontal Line */}
        {/* Main Item */}
        <div className="flex justify-between items-center ml-2">
          {link ? (
            <Link 
              href={link} 
              className={`transition-colors flex items-center gap-2 ${
                isActive || hasActiveSubItem ? 'text-yellow-500' : 'hover:text-primary'
              }`}
            >
              {icon && React.createElement(icon, { 
                className: `w-4 h-4 ${isActive || hasActiveSubItem ? 'text-yellow-500' : color || ''}`, 
                strokeWidth: 2.5 
              })}
              {name}
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              {icon && React.createElement(icon, { className: `w-4 h-4 ${color || ''}`, strokeWidth: 2.5 })}
              <span>{name}</span>
            </div>
          )}
          {badge && (
            <span className="bg-pink-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>

        {/* SubItems - Always visible (dropdown open by default) */}
        {subItems && subItems.length > 0 && (
          <div className="mt-2 ml-3 space-y-2 ">
            {subItems.map((subItem, subIndex) => {
              const isSubItemActive = pathname === subItem.link;
              return (
                <div key={subIndex} className="relative my-1 pr-2 text-sm text-muted-foreground">
                  {/* Sub-item vertical line */}
                  {/* <div className="absolute left-0 w-px bg-gray-200 h-4 top-0" />
                
                  <div className="absolute  left-0 top-4 h-px w-3 bg-gray-200" /> */}
                    {/* Sub-item horizontal line */}
                  <Link 
                    href={subItem.link} 
                    className={`mt-3 transition-colors ml-2 ${
                      isSubItemActive ? 'text-yellow-500' : 'hover:text-primary'
                    }`}
                  >
                    {subItem.label}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Group component for collapsible sections
  const Group = ({
    title,
    openKey,
    children,
  }: {
    title: string;
    openKey: keyof typeof openSections;
    children: React.ReactNode;
  }) => (
    <div className="mb-2">
      <div
        className="flex items-center gap-1 cursor-pointer text-foreground text-sm font-bold  hover:text-primary px-2 py-1 rounded transition-colors"
        onClick={() => toggleSection(openKey)}
      >
        {openSections[openKey] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {title}
      </div>
      {openSections[openKey] && <div className="mt-1 ml-2">{children}</div>}
    </div>
  );
 
  const servicesSections: {
    title: string;
    key: string;
    color?: string;
    items: ServiceItem[];
  }[] = [
    
        {
      title: "Course Overview",
      key: "Course",
      
      items: [
        { label: "Course Home", link: `/course/${sessionStorage.getItem('course_id')}`, icon: HomeIcon, color: "text-blue-500" },
       
      ],
    },
    {
      title: "Study Tools",
      key: "tools",
      color: "text-green-500",    
      items: [
        { label: "Flashcards", link: "/pages/flashcards", icon: BookMarked, color: "text-purple-500" },
        { label: "Notes", link: "/course/notes", badge: 8, icon: PenTool, color: "text-orange-500" },
        // { label: "Tutorial", link: "/course/tutorial" },
       
      ],
    },
    {
      title: "Practice",
      key: "practice",
      
      items: [
        { label: "Practice Quizzes", link: "",
          icon: FileQuestion,
          color: "text-green-500",
          subItems: [
            { label: "Take Quiz", link: "/pages/exam" },
            { label: "Quiz Analytics", link: "/course/result/stats" },
          ]

        },
        { label: "Mock Exams", link: "",
          icon: Target,
          color: "text-red-500",
          subItems: [
            { label: "Full Test", link: "test" },
            { label: "Test Analytics", link: "test-analytics" },
          ]
        },
      ],
    },
  ]
  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="fixed bg-transparent top-[17px] left-4 z-50 md:hidden"
      >
        {isOpen ? <X className="" size={24} /> : <Menu size={24} />}
      </Button>

      {/* Sidebar Container */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          className,
        )}
      >
        {/* Icon-only Strip */}
        <div className="w-[60px] bg-background border-r border-border flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-2">
            <div className="flex items-center h-40"></div>
          </div>

          {/* Icon Navigation */}
          <nav className="flex-1 flex flex-col items-center py-6">
            {iconItems
              .filter(item => item.label !== "Logout")
              .map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  {item.hasSeparator && <Separator className="w-8 text-black dark:text-white my-3" />}
                  {item.component ? (
                    <div className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-accent">
                      <div className={item.color}>
                          <item.component />
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.link || "#"}
                      className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-accent"
                      onClick={(e) => {
                        if (!item.link) {
                          e.preventDefault()
                          handleMenuItemClick(item.label)
                        }
                      }}
                    >
                      <item.icon className={`w-5 h-5 icon-bold ${item.color || ''}`} strokeWidth={2.5} />
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
          </nav>

          {/* Logout Icon at Bottom */}
          <div className="flex flex-col items-center py-6">
            <button
              onClick={() => handleMenuItemClick("Logout")}
              className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-accent"
            >
              <LogOut className="w-5 h-5 icon-bold text-gray-500" strokeWidth={2.5} />
              <span className="sr-only">Logout</span>
            </button>
          </div>
        </div>

        {/* Content Strip */}
        <div className="w-[240px] bg-background border-r border-border flex flex-col">
          {/* Logo */}
          {/* <div className="flex w-full justify-center items-center h-16 px-4"> */}
            <div className="flex  w-full justify-center items-center h-20">
            <Image className="dark:hidden " src="/logo.svg" alt="Logo" width={150} height={150} />
          <Image className="hidden dark:block" src="/logo-white.png" alt="Logo" width={100} height={100} />
     
            </div>
          {/* </div> */}

          {/* Services Navigation */}
          <div className="flex-1 px-4 pb-3 text-md space-y-4 overflow-y-auto">
            {servicesSections.map((section, sectionIndex) => (
              <Group key={sectionIndex} title={section.title} openKey={section.key as keyof typeof openSections}>
                {section.items.map((item, itemIndex) => (
                  item.subItems ? (
                    <ItemWithSubItems
                      key={itemIndex}
                      name={item.label}
                      isLast={itemIndex === section.items.length - 1}
                      badge={item.badge}
                      link={item.link}
                      subItems={item.subItems}
                      icon={item.icon}
                      color={item.color}
                    />
                  ) : (
                    <Item
                      key={itemIndex}
                      name={item.label}
                      isLast={itemIndex === section.items.length - 1}
                      badge={item.badge}
                      link={item.link}
                      icon={item.icon}
                      color={item.color}
                    />
                  )
                ))}
              </Group>
            ))}
            
            {/* Analytics section */}
            {/* <div className="flex justify-between font-bold items-center mt-4 px-2 text-sm ">
              <span>Contact Us</span>
              <span className="bg-pink-600 text-white text-xs px-1.5 py-0.5 rounded-full">Help</span>
            </div> */}

            {/* Manage folders */}
            {/* <div className="mt-6 px-2 text-xs text-muted-foreground cursor-pointer hover:underline">
              Manage folders
            </div> */}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={toggleSidebar} />
      )}

      {/* Notification Modal */}
      <NotificationModal open={notificationOpen} onOpenChange={setNotificationOpen} />

      {/* Logout Confirmation Modal */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>Are you sure you want to log out of your account?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:space-x-2">
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setLogoutOpen(false)
                console.log("User logged out")
              }}
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
import Topbar from "@/components/dashboardItems/topbar"
import { SupportModalProvider } from "@/components/dashboardItems/support-modal"
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen">
  
        <Sidebar />
        <main className="flex-1 md:ml-[300px]">
          <Topbar />
          <SupportModalProvider>{children}</SupportModalProvider>
        </main>
      </div>
    </ThemeProvider>
  )
}
