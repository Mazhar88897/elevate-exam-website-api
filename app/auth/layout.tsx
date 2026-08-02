'use client'

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("token")
      if (token) {
        router.replace("/dashboard")
      }
    }
  }, [router])

  return (
    <div className="min-h-screen bg-white">
      <main id="main">{children}</main>
    </div>
  )
}
