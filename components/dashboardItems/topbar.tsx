"use client" 
import React from "react";
import Link from "next/link";
import { ChevronDown , ChevronUp ,   User, Settings, LogOut, HelpCircle, ShoppingCart, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const menuOptions = [
  { icon: <User className="w-4 h-4 mr-2" />, text: "My Profile", href: "/dashboard/account" },
  // { icon: <ShoppingCart className="w-4 h-4 mr-2" />, text: "Buy Domains", href: "/dashboard/add-domain" },
  { icon: <ShieldCheck className="w-4 h-4 mr-2" />, text: "Subscribed Domains", href: " /dashboard/current-subscription" },

  { icon: <HelpCircle className="w-4 h-4 mr-2" />, text: "Help Center", href: "/dashboard/help" },

  // Logout will be handled separately
];

export default function Topbar() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [userName, setUserName] = React.useState<string>("");

  // Safely access sessionStorage on client side
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = sessionStorage.getItem('name') || '';
      setUserName(name);
    }
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Get the auth token from sessionStorage (only on client side)
      const authToken = typeof window !== 'undefined' ? sessionStorage.getItem('Authorization') : null;
      
      if (!authToken) {
        // If no token, just clear session and redirect
        if (typeof window !== 'undefined') {
          sessionStorage.clear();
        }
        router.push('/auth/sign-in');
        return;
      }

      // Call logout API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/token/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Clear session storage regardless of API response
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }

      // Redirect to sign-in page
      router.push('/auth/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear session and redirect
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
      router.push('/auth/sign-in');
    } finally {
      setIsLoggingOut(false);
      setLogoutOpen(false);
    }
  };
  return (
    <div className="flex items-center justify-end px-6 py-4 bg-white dark:bg-background relative">
      <div className="flex items-center cursor-pointer select-none" onClick={() => setOpen(!open)}>
        {open ? <ChevronUp className="w-6 h-6 text-gray-500  mx-2" /> : <ChevronDown className="w-6 h-6 text-gray-500  mx-2" />}
        <div className="h-8 w-8 rounded-full bg-xcolor flex items-center justify-center text-white mr-2">{userName?.charAt(0).toUpperCase() || 'U'}</div>
          <span className="hidden md:inline text-sm text-gray-600 dark:text-white">{userName || 'User'}</span>
      </div>
      {open && (
        <div className="absolute right-6 top-16 w-60 bg-white dark:bg-gray-800 shadow-lg rounded-md py-2 z-50">
          {menuOptions.map((option, idx) => (
            <Link href={option.href} key={idx} className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">
              {option.icon}
              {option.text}
            </Link>
          ))}
          <button
            className="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
            onClick={() => setLogoutOpen(true)}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      )}
      {/* Logout Confirmation Modal */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-background">
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
    </div>
  );
} 