'use client'

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { ThemeProvider } from "@/components/theme-provider"
import Image from "next/image"
import Link from "next/link"
export default function Layout({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (token) {
        router.replace('/dashboard');
      }
    }
  }, [router]);

  return (
   
     <div className="min-h-screen  flex flex-col justify-between">
  {/* Top - Logo */}

  <Link href="/" className="">
           <div className="p-5">
    <Image
      className="block"
      src="/Frame 2.svg"
      alt="Logo"
      width={140}
      height={140}
    />
  
  </div>
    </Link>


  {/* Middle - Content */}
  <main id="main" className="flex-1 overflow-auto transition-all duration-300">
    {children}
  </main>

  {/* Bottom - Report */}
  
</div>

 
  )
}
