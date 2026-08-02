"use client"

import React from "react"
import Link from "next/link"
import {
  HelpCircle,
  LogOut,
  ShieldCheck,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const menuOptions = [
  {
    icon: <ShieldCheck className="mr-2 h-4 w-4" />,
    text: "Subscription",
    href: "/dashboard/current-subscription",
  },
  { icon: <HelpCircle className="mr-2 h-4 w-4" />, text: "Help Center", href: "/dashboard/help" },
]

export default function Topbar() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [logoutOpen, setLogoutOpen] = React.useState(false)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const [userName, setUserName] = React.useState("")

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setUserName(sessionStorage.getItem("name") || "")
    }
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const authToken =
        typeof window !== "undefined"
          ? sessionStorage.getItem("Authorization")
          : null

      if (authToken) {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/token/logout`, {
          method: "POST",
          headers: {
            Authorization: `${authToken}`,
            "Content-Type": "application/json",
          },
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      if (typeof window !== "undefined") sessionStorage.clear()
      setIsLoggingOut(false)
      setLogoutOpen(false)
      router.push("/auth/sign-in")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center bg-[#F5C6C6] font-display text-[11px] font-bold text-black">
            EE
          </span>
          <span className="font-display text-[17px] font-bold tracking-tight text-black">
            ElevateExams
          </span>
        </Link>

        <div className="relative flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="hidden text-sm font-medium text-neutral-700 sm:block"
          >
            {userName || "User"}
          </button>
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="border border-black bg-white px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-neutral-50"
          >
            Log out
          </button>

          {open && (
            <div className="absolute right-0 top-11 w-56 border border-neutral-200 bg-white py-1 shadow-lg">
              {menuOptions.map((option) => (
                <Link
                  key={option.href}
                  href={option.href}
                  className="flex items-center px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setOpen(false)}
                >
                  {option.icon}
                  {option.text}
                </Link>
              ))}
              <button
                type="button"
                className="flex w-full items-center px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50"
                onClick={() => {
                  setOpen(false)
                  setLogoutOpen(true)
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
