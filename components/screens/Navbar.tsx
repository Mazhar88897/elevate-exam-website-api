"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface NavItem {
  title: string
  href: string
}

const navItems: NavItem[] = [
  { title: "Courses", href: "/#courses" },
  { title: "Features", href: "/#features" },
  { title: "Blog", href: "/#blog" },
  { title: "How it works", href: "/#how-it-works" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="w-full border-b-[2px] border-black bg-white">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-10 xl:px-12">
        {/* Brand — left */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[3px] bg-[#F5C6C6] font-display text-[11px] font-bold tracking-tight text-black">
            EE
          </span>
          <span className="font-display text-[17px] font-bold tracking-tight text-black">
            ElevateExams
          </span>
        </Link>

        {/* Links + actions — right */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-8 xl:flex">
            <nav className="flex items-center gap-7">
              {navItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="text-[14px] font-medium text-neutral-500 transition-colors hover:text-black"
                >
                  {item.title}
                </Link>
              ))}
            </nav>

            {/* Vertical divider */}
            <div className="h-6 w-px bg-neutral-200" aria-hidden />

            <div className="flex items-center gap-2.5">
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center rounded-[4px] border border-black bg-white px-4 py-2 text-[13px] font-medium text-black transition-colors hover:bg-neutral-50"
              >
                Log in
              </Link>
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-1.5 rounded-[4px] bg-black px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Get started
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </Link>
            </div>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="xl:hidden">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-[4px] border border-neutral-300"
              >
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
                  className="h-5 w-5"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 [&>button]:hidden">
              <div className="flex h-[72px] items-center justify-between border-b border-neutral-200 px-6">
                <Link
                  href="/"
                  className="flex items-center gap-2.5"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-[3px] bg-[#F5C6C6] font-display text-[11px] font-bold text-black">
                    EE
                  </span>
                  <span className="font-display text-[17px] font-bold tracking-tight text-black">
                    ElevateExams
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
              <nav className="px-6 py-6">
                <ul className="space-y-4">
                  {navItems.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="text-base font-medium text-neutral-600 transition-colors hover:text-black"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="space-y-3 border-t border-neutral-200 px-6 py-6">
                <Link
                  href="/auth/sign-in"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center rounded-[4px] border border-black px-4 py-3 text-sm font-medium text-black"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-[4px] bg-black px-4 py-3 text-sm font-medium text-white"
                >
                  Get started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
