"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Search, X, ChevronDown } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { HoverCard } from "../pages/hoverCardHard"

interface NavItem {
  title: string
  href?: string
  hasDropdown?: boolean
  submenu?: { title: string; href: string }[]
}

const navItems: NavItem[] = [


  {
    title: "Exams",
    hasDropdown: true,
    submenu: [
      { title: "Exams", href: "/main/courses" },
      { title: "Exams Details", href: "/main/courses/single-course" },
    ],
  },
  { title: "How It Works", href: "/main/platform" },
  {
    title: "Pages",
    hasDropdown: true,
    submenu: [
      { title: "About Us", href: "/main/about" },
      { title: "Contact Us", href: "/main/contact" },
      { title: "FAQ", href: "/main/faq" },
      {title: "pricing", href: "/main/pricing" },
    ],
  },
  {
    title: "Blog",
    hasDropdown: true,
    submenu: [
      { title: "Blog Grid", href: "/main/blogs" },
      { title: "Blog Single", href: "/main/blogs/single-blog" },
    ],
  },
  { title: "Contact", href: "/main/contact" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const toggleDropdown = (title: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const handleMouseEnter = (title: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setActiveDropdown(title)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 500) // 500ms delay (half a second)
  }

  return (
    <header className="w-full sm:mx-auto xl:px-[4rem] bg-white xl:bg-[#FDFBFB]">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden xl:flex items-center space-x-8">
          <ul className="flex space-x-8">
            {navItems.map((item) => (
              <li
                key={item.title}
                className="relative group"
                onMouseEnter={() => item.hasDropdown && handleMouseEnter(item.title)}
                onMouseLeave={handleMouseLeave}
              >
                {item.hasDropdown ? (
                  <button className="flex items-center text-sm font-semibold text-slate-700 hover:text-[#1a2352]/80">
                    {item.title}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                ) : (
                  <Link href={item.href || "#"} className="flex items-center text-sm font-semibold text-slate-700 hover:text-[#1a2352]/80">
                    {item.title}
                  </Link>
                )}
                {item.hasDropdown && (
                  <div
                    className={`absolute left-0 top-full z-10 mt-5 w-48 rounded-md border bg-white xl:bg-[#FDFBFB] shadow-lg transition-opacity duration-200 ${
                      activeDropdown === item.title
                        ? "opacity-100 visible"
                        : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                    }`}
                  >
                    {item.submenu?.map((subitem) => (
                      <Link key={subitem.title} href={subitem.href} className="block text-xs text-slate-500 px-4 xl:py-3 py-1 hover:text-slate-300">
                        {subitem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
          
          {/* Search Bar */}
          <div className="flex items-center border border-gray-300 rounded-lg p-2 w-44 bg-white shadow-sm hover:shadow-md transition-shadow">
            <input
              type="text"
              placeholder="Search " 
              className="w-full text-sm flex-grow outline-none bg-transparent px-2 text-gray-700 placeholder-gray-400"
            />
            <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
          </div>
        </nav>

        <div className="flex items-center space-x-4">
          {/* Sign in and Create Account Buttons */}
          <div className="hidden xl:flex items-center space-x-3">
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-medium text-[#1a2352] hover:text-[#1a2352]/80 transition-colors"
            >
              Sign in
            </Link>
            <Link 
              href="/register" 
              className="px-6 py-2 bg-[#1a2352] text-white text-sm font-medium rounded-lg hover:bg-[#1a2352]/90 transition-colors shadow-sm hover:shadow-md"
            >
              Create Account
            </Link>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="xl:hidden">
            <HoverCard> 
              <Button variant="outline" size="icon" className="xl:hidden border rounded-md p-2 h-10 w-10">
                <span className="sr-only">Toggle menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </Button>
              </HoverCard> 
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 [&>button]:hidden">
              <div className="flex h-20 items-center border-b px-6">
                <Link href="/" className="flex items-center">
                  <Logo />
                </Link>
                {/* isko comment */}
                <Button variant="ghost" size="icon" className="ml-auto items-center mt-[-5px] mr-[-10px]" onClick={() => setIsOpen(false)}>
                <HoverCard> 
                  <X className="h-5 w-5 m-1" />
                  <span className="sr-only">Close</span>
                  </HoverCard>
                </Button>
                
              </div>
              <nav className="px-6 py-4">
                <ul className="space-y-4">
                  {navItems.map((item) => (
                    <li key={item.title} className="py-1">
                      {item.hasDropdown ? (
                        <div>
                          <button
                            onClick={() => toggleDropdown(item.title)}
                            className="flex w-full items-center justify-between text-lg text-[#1a2352] hover:text-[#1a2352]/80"
                          >
                            {item.title}
                            <ChevronDown
                              className={`h-5 w-5 transition-transform ${openDropdowns[item.title] ? "rotate-180" : ""}`}
                            />
                          </button>
                          {openDropdowns[item.title] && item.submenu && (
                            <div className="mt-2 ml-4 space-y-2">
                              {item.submenu.map((subitem) => (
                                <Link
                                  key={subitem.title}
                                  href={subitem.href}
                                  className="block py-2 text-[#1a2352]/80 hover:text-[#1a2352]"
                                >
                                  {subitem.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href || "/"}
                          className="flex items-center text-lg text-[#1a2352] hover:text-[#1a2352]/80"
                        >
                          {item.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
              
              {/* Mobile Sign in and Create Account Buttons */}
              <div className="px-6 py-4 border-t">
                <div className="flex flex-col space-y-3">
                  <Link 
                    href="/login" 
                    className="w-full px-4 py-3 text-center text-sm font-medium text-[#1a2352] border border-[#1a2352] rounded-lg hover:bg-[#1a2352] hover:text-white transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link 
                    href="/register" 
                    className="w-full px-4 py-3 text-center text-sm font-medium bg-[#1a2352] text-white rounded-lg hover:bg-[#1a2352]/90 transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function Logo() {
  return (
    <div className="flex items-center">
     <Image src="/logo-t.jpg" alt="Logo" width={200} height={150} />
     {/* <Link href="/" className="flex items-center space-x-2 text-black text-3xl font-semibold">
     
     elevate exams
    </Link> */}
    
    </div>
  )
}

