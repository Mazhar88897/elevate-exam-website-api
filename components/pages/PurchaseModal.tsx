"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Eye, EyeOff } from "lucide-react"
import { GoogleSignInButton } from "@/components/dashboardItems/google"
import toast from "react-hot-toast"

const PRICING = {
  monthly: 5.99,
  annually: 79.99,
}

// Stripe Price IDs
const STRIPE_PRICE_IDS = {
  monthly: "price_1SQ9Ac00CDQdww264AvpWJv0",
  yearly: "price_1SQ9CM00CDQdww26Sh4FRNYr",
}

interface Domain {
  id: number
  name: string
}

interface PurchaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PurchaseModal({ open, onOpenChange }: PurchaseModalProps) {
  const [activeTab, setActiveTab] = useState("login")
  const [loginSubTab, setLoginSubTab] = useState<"signin" | "signup">("signin")
  
  // Sign-in state
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSignInLoading, setIsSignInLoading] = useState(false)
  const [signInError, setSignInError] = useState("")

  // Sign-up state
  const [signUpData, setSignUpData] = useState({
    email: "",
    name: "",
    description: "",
    password: "",
    confirmPassword: "",
  })
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSignUpLoading, setIsSignUpLoading] = useState(false)
  const [signUpError, setSignUpError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    message: "",
  })

  // Domain state
  const [domains, setDomains] = useState<Domain[]>([])
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null)
  const [loadingDomains, setLoadingDomains] = useState(false)

  // Plan state
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annually" | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const token = sessionStorage.getItem("Authorization")
    if (token) {
      setIsLoggedIn(true)
      setActiveTab("domain")
    }
  }, [])

  const validatePassword = (password: string) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (password.length < minLength) {
      return { isValid: false, message: "Password must be at least 8 characters long" }
    }
    if (!hasUpperCase) {
      return { isValid: false, message: "Password must contain at least one uppercase letter" }
    }
    if (!hasLowerCase) {
      return { isValid: false, message: "Password must contain at least one lowercase letter" }
    }
    if (!hasNumbers) {
      return { isValid: false, message: "Password must contain at least one number" }
    }
    if (!hasSpecialChar) {
      return { isValid: false, message: "Password must contain at least one special character" }
    }

    return { isValid: true, message: "Password is strong" }
  }

  const handleSignInInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSignInData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSignUpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSignUpData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Validate password when password field changes
    if (name === "password") {
      setPasswordStrength(validatePassword(value))
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignInError("")
    setIsSignInLoading(true)

    try {
      const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/token/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signInData.email,
          password: signInData.password,
        }),
      })

      const loginData = await loginResponse.json()

      if (!loginResponse.ok) {
        setSignInError(loginData.error || loginData.detail || "Login failed")
        setIsSignInLoading(false)
        return
      }

      const authToken = loginData.auth_token
      if (!authToken) {
        setSignInError("No authentication token received")
        setIsSignInLoading(false)
        return
      }

      sessionStorage.setItem("Authorization", `Token ${authToken}`)

      // Fetch user data
      try {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/users/me/`, {
          method: "GET",
          headers: {
            Authorization: `${sessionStorage.getItem("Authorization")}`,
            "Content-Type": "application/json",
          },
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          sessionStorage.setItem("email", userData.email || signInData.email)
          sessionStorage.setItem("id", userData.id?.toString() || "")
          sessionStorage.setItem("name", userData.name || "")
        }
      } catch (userErr) {
        console.warn("Error fetching user data:", userErr)
      }

      setIsLoggedIn(true)
      setActiveTab("domain")
      toast.success("Signed in successfully!")
    } catch (err) {
      setSignInError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSignInLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignUpError("")

    if (signUpData.password !== signUpData.confirmPassword) {
      setSignUpError("Passwords do not match")
      return
    }

    if (!passwordStrength.isValid) {
      setSignUpError("Password does not meet strength requirements")
      return
    }

    setIsSignUpLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signUpData.email,
          name: signUpData.name,
          description: signUpData.description,
          password: signUpData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSignUpError(data.error || data.detail || "Sign up failed")
        setIsSignUpLoading(false)
        return
      }

      sessionStorage.setItem("signupEmail", signUpData.email)
      sessionStorage.setItem("signupName", signUpData.name)

      toast.success("Please check your email for the Activation Link.")
      // Switch to sign-in tab after successful sign-up
      setLoginSubTab("signin")
      setSignUpData({
        email: "",
        name: "",
        description: "",
        password: "",
        confirmPassword: "",
      })
    } catch (err) {
      setSignUpError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSignUpLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab !== "domain") return

    const domainId = sessionStorage.getItem("DomainIdForPayment")
    if (!domainId) {
      toast.error("Please select a domain to view courses")
      return
    }

    const token = sessionStorage.getItem("Authorization")
    if (!token) {
      toast.error("Please sign in first")
      setActiveTab("login")
      return
    }

    const controller = new AbortController()

    const fetchCourses = async () => {
      setLoadingDomains(true)
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/domains/${domainId}/courses`,
          {
            headers: {
              Authorization: token,
            },
            signal: controller.signal,
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || "Unable to load courses")
        }

        const data = await response.json()
        const courses = Array.isArray(data) ? data : data?.courses ?? []
        setDomains(courses)
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error fetching courses:", error)
          toast.error("Failed to load courses")
        }
      } finally {
        setLoadingDomains(false)
      }
    }

    fetchCourses()

    return () => controller.abort()
  }, [activeTab])

  const handleProceedToPayment = () => {
   
    setActiveTab("plan")
  }

  const handleCheckout = async () => {
   

    const token = sessionStorage.getItem("Authorization")
    if (!token) {
      toast.error("Please sign in first")
      setActiveTab("login")
      return
    }

    setIsProcessingPayment(true)

    try {
      const domainId = sessionStorage.getItem("DomainIdForPayment")
      const planInterval = selectedPlan === "monthly" ? "monthly" : "yearly"
      const priceId = selectedPlan === "monthly" ? STRIPE_PRICE_IDS.monthly : STRIPE_PRICE_IDS.yearly

      // Create Stripe checkout session
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/create-checkout-session/`, {
        method: "POST",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain_id: sessionStorage.getItem("DomainIdForPayment"),
          plan_interval: planInterval,
          price_id: priceId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || "Failed to create checkout session")
      }

      const data = await response.json()

      if (data.checkout_url) {
        // Redirect to Stripe checkout
        window.location.href = data.checkout_url
      } else {
        throw new Error("No checkout URL received from server")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process payment")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[600px] p-0  border-0 shadow-none ">
        <div className="relative cursor-pointer transition-transform duration-200 h-full w-full">
          {/* Shadow element - border */}
          {/* <div className="absolute inset-0 border-2  border-gray-800 rounded-lg transition-transform duration-200 translate-x-[-15px] translate-y-[15px]"></div> */}
          
          {/* Shadow element - background */}
          <div className="absolute sm:block hidden inset-0 blur-md backdrop-blur-md rounded-lg transition-transform duration-200 translate-x-[-9px] translate-y-[9px]"></div>

          {/* Main card */}
          <div className="relative rounded-lg border border-gray-400 bg-white h-full w-full transition-transform duration-200 flex flex-col">
            <DialogHeader className="p-6 pb-4 border-b">
              <DialogTitle className="text-2xl font-bold">Purchase Course</DialogTitle>
            </DialogHeader>

            <div className="p-6 flex-1 overflow-y-auto min-h-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-transparent border-b border-zinc-300 dark:border-zinc-800 mb-6 justify-start h-auto p-0 w-full flex">
                  <TabsTrigger className="relative px-4 py-3 text-sm font-medium data-[state=active]:font-bold text-gray-600 dark:text-gray-400 data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-0.5 data-[state=active]:after:bg-xcolor rounded-none" value="login">Login</TabsTrigger>
                  <TabsTrigger className="relative px-4 py-3 text-sm font-medium data-[state=active]:font-bold text-gray-600 dark:text-gray-400 data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-0.5 data-[state=active]:after:bg-xcolor rounded-none" value="domain" disabled={!isLoggedIn}>Domain</TabsTrigger>
                  <TabsTrigger className="relative px-4 py-3 text-sm font-medium data-[state=active]:font-bold text-gray-600 dark:text-gray-400 data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-0.5 data-[state=active]:after:bg-xcolor rounded-none" value="plan" disabled={!selectedDomain}>Plan</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login" className="mt-0">
                  <div className="flex items-center mb-6  border-zinc-300 dark:border-zinc-800 pb-0">
                    <div className="flex border-b border-zinc-300 dark:border-zinc-800 items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setLoginSubTab("signin")}
                      className={`relative px-4 py-3 text-sm font-medium transition-all rounded-none ${
                        loginSubTab === "signin"
                          ? "font-bold text-black dark:text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-xcolor"
                          : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginSubTab("signup")}
                      className={`relative px-4 py-3 text-sm font-medium transition-all rounded-none ${
                        loginSubTab === "signup"
                          ? "font-bold text-black dark:text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-xcolor"
                          : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      Sign Up
                    </button>
                    </div>
                  </div>

                  {/* Sign In Form */}
                  {loginSubTab === "signin" && (
                    <div className="mt-4">
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div>
                          <label htmlFor="signin-email" className="block text-sm font-semibold text-slate-700 mb-1">
                            Email
                          </label>
                          <Input
                            id="signin-email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            className="w-full bg-white rounded-mid border-slate-300"
                            value={signInData.email}
                            onChange={handleSignInInputChange}
                            required
                            disabled={isSignInLoading}
                          />
                        </div>

                        <div>
                          <label htmlFor="signin-password" className="block text-sm font-semibold text-slate-700 mb-1">
                            Password
                          </label>
                          <div className="relative">
                            <Input
                              id="signin-password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="w-full bg-white rounded-mid border-slate-300 pr-10"
                              value={signInData.password}
                              onChange={handleSignInInputChange}
                              required
                              disabled={isSignInLoading}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              onClick={() => setShowPassword((prev) => !prev)}
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        {signInError && (
                          <div className="bg-red-50 border border-red-200 rounded-mid p-3 text-red-700 text-sm">
                            {signInError}
                          </div>
                        )}

                        <Button
                          type="submit"
                          className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 rounded-mid"
                          disabled={isSignInLoading}
                        >
                          {isSignInLoading ? "Signing In..." : "Sign In"}
                        </Button>

                        <GoogleSignInButton />
                      </form>
                    </div>
                  )}

                  {/* Sign Up Form */}
                  {loginSubTab === "signup" && (
                    <div className="mt-4 ">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div>
                          <label htmlFor="signup-name" className="block text-sm font-semibold text-slate-700 mb-1">
                            Name
                          </label>
                          <Input
                            id="signup-name"
                            name="name"
                            type="text"
                            placeholder="Enter your name"
                            className="w-full bg-white rounded-mid border-slate-300"
                            value={signUpData.name}
                            onChange={handleSignUpInputChange}
                            required
                            disabled={isSignUpLoading}
                          />
                        </div>

                        <div>
                          <label htmlFor="signup-email" className="block text-sm font-semibold text-slate-700 mb-1">
                            Email
                          </label>
                          <Input
                            id="signup-email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            className="w-full bg-white rounded-mid border-slate-300"
                            value={signUpData.email}
                            onChange={handleSignUpInputChange}
                            required
                            disabled={isSignUpLoading}
                          />
                        </div>

                        <div>
                          <label htmlFor="signup-description" className="block text-sm font-semibold text-slate-700 mb-1">
                            Description
                          </label>
                          <Input
                            id="signup-description"
                            name="description"
                            type="text"
                            placeholder="e.g., Computer Systems Engineer"
                            className="w-full bg-white rounded-mid border-slate-300"
                            value={signUpData.description}
                            onChange={handleSignUpInputChange}
                            required
                            disabled={isSignUpLoading}
                          />
                        </div>

                        <div>
                          <label htmlFor="signup-password" className="block text-sm font-semibold text-slate-700 mb-1">
                            Password
                          </label>
                          <div className="relative">
                            <Input
                              id="signup-password"
                              name="password"
                              type={showSignUpPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="w-full bg-white rounded-mid border-slate-300 pr-10"
                              value={signUpData.password}
                              onChange={handleSignUpInputChange}
                              required
                              disabled={isSignUpLoading}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              onClick={() => setShowSignUpPassword((prev) => !prev)}
                              tabIndex={-1}
                            >
                              {showSignUpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          {signUpData.password && (
                            <p className="text-xs text-slate-600 mt-1">
                              Password should be 8 digits, 1 upper case, 1 lowercase, 1 number, 1 symbol
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="signup-confirm-password" className="block text-sm font-semibold text-slate-700 mb-1">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Input
                              id="signup-confirm-password"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Enter your password again"
                              className="w-full bg-white rounded-mid border-slate-300 pr-10"
                              value={signUpData.confirmPassword}
                              onChange={handleSignUpInputChange}
                              required
                              disabled={isSignUpLoading}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              onClick={() => setShowConfirmPassword((prev) => !prev)}
                              tabIndex={-1}
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          {signUpData.confirmPassword && signUpData.password !== signUpData.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                          )}
                        </div>

                        {signUpError && (
                          <div className="bg-red-50 border border-red-200 rounded-mid p-3 text-red-700 text-sm">
                            {signUpError}
                          </div>
                        )}

                        <Button
                          type="submit"
                          className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 rounded-mid"
                          disabled={
                            isSignUpLoading ||
                            !passwordStrength.isValid ||
                            signUpData.password !== signUpData.confirmPassword
                          }
                        >
                          {isSignUpLoading ? "Signing Up..." : "Sign Up"}
                        </Button>
                      </form>
                    </div>
                  )}
                </TabsContent>

                {/* Domain Tab */}
                <TabsContent value="domain" className="mt-0 flex flex-col h-full">
                  <div className="flex-1 flex flex-col min-h-0">
                    <h3 className="text-lg font-semibold mb-4">All Courses</h3>
                    {loadingDomains ? (
                      <div className="flex min-h-[280px] justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="min-h-[280px] overflow-y-auto pr-2">
                        <div className="flex flex-col">
                          {domains.map((domain) => (
                            <div
                              key={domain.id}
                              className="flex flex-row items-center gap-3 rounded-lg py-2"
                            >
                              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                              <p className="font-medium text-sm">{domain.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t border-gray-200 mt-4">
                    <Button
                      onClick={handleProceedToPayment}
                      className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 rounded-mid"
                    >
                      Proceed with Payment
                    </Button>
                  </div>
                </TabsContent>

                {/* Plan Tab */}
                <TabsContent value="plan" className="mt-0">
               
                  <div className="space-y-4 min-h-[280px] flex flex-col h-full  justify-between flex-1">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        onClick={() => setSelectedPlan("monthly")}
                        className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedPlan === "monthly"
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <h4 className="text-xl font-bold mb-2">Monthly</h4>
                        <p className="text-3xl font-bold text-blue-600">£{PRICING.monthly}</p>
                        <p className="text-sm text-gray-500 mt-1">per month</p>
                      </div>
                      <div
                        onClick={() => setSelectedPlan("annually")}
                        className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedPlan === "annually"
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <h4 className="text-xl font-bold mb-2">Annually</h4>
                        <p className="text-3xl font-bold text-blue-600">£{PRICING.annually}</p>
                        <p className="text-sm text-gray-500 mt-1">per year</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 bottom-0">
                      <p className="text-sm text-gray-500 font-semibold mb-8">
                        you can cancel at any time after purchase <br />
                        you can have a look at terms and conditions.
                      </p>
                    
                    </div>
                  </div>
                  <Button
                      onClick={handleCheckout}
                      disabled={!selectedPlan || isProcessingPayment}
                      className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 rounded-mid"
                    >
                      {isProcessingPayment ? "Processing..." : "Checkout"}
                    </Button>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

