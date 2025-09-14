import { ThemeProvider } from "@/components/theme-provider"
import Sidebar from "@/components/dashboardItems/sidebar"

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      
        <main className="flex-1">{children}</main>
    
    </ThemeProvider>
  )
} 