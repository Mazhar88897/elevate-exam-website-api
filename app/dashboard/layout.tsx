import type { ReactNode } from "react"
import Topbar from "@/components/dashboardItems/topbar"
import { ThemeProvider } from "@/components/theme-provider"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="min-h-screen bg-white">
        <Topbar />
        <main>{children}</main>
      </div>
    </ThemeProvider>
  )
}
  