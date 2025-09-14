// app/dashboard/layout.tsx

import type { ReactNode } from "react"
import Sidebar from "@/components/dashboardItems/sidebar"
import Topbar from "@/components/dashboardItems/topbar"
import { ThemeProvider } from "@/components/theme-provider"

export default function Layout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <Topbar />
        <Sidebar />
        <main className="md:ml-64 transition-all duration-300">{children}</main>
      </div>
    </ThemeProvider>
  )
}
