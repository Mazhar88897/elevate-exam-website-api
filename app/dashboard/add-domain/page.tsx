"use client"

import React, { useState, useEffect } from "react"
import {
  Check,
  CreditCardIcon,
  Loader2,
  WalletIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
// import { toast } from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"   

// API data interfaces
interface Course {
  id: number;
  name: string;
}

interface Domain {
  id: number;
  name: string;
  course_library: Course[];
  currently_studying: Course[];
}

// Pricing constants
const PRICING = {
  monthly: 5.99,
  annually: 79.99,
}

// Stripe Price IDs
const STRIPE_PRICE_IDS = {
  monthly: "price_1SQ9Ac00CDQdww264AvpWJv0",
  yearly: "price_1SQ9CM00CDQdww26Sh4FRNYr",
}


// Main component
export default function AddDomainPage() {
  const router = useRouter()
  const [processingPurchase, setProcessingPurchase] = useState(false)
  
  // API data states
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Confirmation modal state
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [selectedDomainForPurchase, setSelectedDomainForPurchase] = useState<Domain | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annually' | null>(null)

  // Fetch API data
  useEffect(() => {
    const fetchDomainsData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const token = sessionStorage.getItem('Authorization')

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard-unpaid/`, {
          method: 'GET',
          headers: {
            'Authorization': token ? `${token}` : '',
            'Content-Type': 'application/json',

          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`)
        }

        const data = await response.json()
        setDomains(data)
      } catch (err) {
        console.error('Error fetching domains data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDomainsData()
  }, [])

  // Open confirmation modal
  const handlePurchaseClick = (domain: Domain, plan: 'monthly' | 'annually') => {
    setSelectedDomainForPurchase(domain)
    setSelectedPlan(plan)
    setIsConfirmationOpen(true)
  }

  // Handle purchase confirmation
  const handleConfirmPurchase = async () => {
    if (!selectedDomainForPurchase || !selectedPlan) {
      return
    }

    const token = sessionStorage.getItem('Authorization')
    
    if (!token) {
      toast.error('Please log in to purchase domains')
      router.push('/auth/sign-in')
      setIsConfirmationOpen(false)
      return
    }

    setProcessingPurchase(true)

    try {
      const domainId = selectedDomainForPurchase.id
      const planInterval = selectedPlan === 'monthly' ? 'monthly' : 'yealy'
      const priceId = selectedPlan === 'monthly' ? STRIPE_PRICE_IDS.monthly : STRIPE_PRICE_IDS.yearly

      // Create Stripe checkout session
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/create-checkout-session/`, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain_id: domainId,
          plan_interval: planInterval,
          price_id: priceId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || 'Failed to create checkout session')
      }

      const data = await response.json()
      
      if (data.checkout_url) {
        // Redirect to Stripe checkout
        window.location.href = data.checkout_url
      } else {
        throw new Error('No checkout URL received from server')
      }
      
      
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred during checkout')
      setProcessingPurchase(false)
    }
  }

  if (loading) {
    return (
      <div className="py-8 p-4 rounded-[10px] text-black dark:text-white pt-6">
        <div className="mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold"> Domain Marketplace</h2>
            </div>
            <div className="w-full  mr-8 my-6 sm:my-5">
              <div className="text-center py-8">
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-xcolor rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-xcolor rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-xcolor rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 p-4 rounded-[10px] text-black dark:text-white pt-6">
        <div className="mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">All Domains</h2>
            </div>
            <div className="w-full border-b-2 mr-8 my-6 sm:my-5">
              <div className="font-bold text-lg text-center">No Domain Found</div>
            </div>
          </div>
          <div className="text-center py-8">
            <Image src="/nothing.png" alt="No Domain" width={200} height={200} className="mx-auto mb-4" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 p-4 rounded-[10px] text-black dark:text-white pt-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Domain Marketplace</h1>
        </div>

        {/* Available Domains Section */}
        <h2 className="text-xl font-bold mb-8 text-black dark:text-white">
          Available Domains
        </h2>

        {domains.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Image src="/nothing.png" alt="No Domains" width={200} height={200} className="mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No domains available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain) => {
              const allCourses = [...domain.course_library, ...domain.currently_studying]
              const coursesCount = allCourses.length

              return (
                <div
                  key={domain.id}
                  className="relative flex flex-col border border-gray-800 dark:border-white rounded-[6px] hover:border-gray-100 dark:hover:border-gray-400 bg-white dark:bg-black hover:bg-gray-200 dark:hover:bg-[#242434] transition-colors overflow-hidden"
                >
                  {/* Domain Card Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-bold">{domain.name}</h3>
                    </div>
                    
                    <p className="text-sm text-xcolor dark:text-gray-400 mb-4">
                      {coursesCount} course{coursesCount !== 1 ? 's' : ''} included
                    </p>

                    {/* Course List Preview */}
                    <div className="mb-4">
                      <ul className="space-y-2">
                        {allCourses.slice(0, 3).map((course) => (
                          <li key={course.id} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Check className="w-4 h-4 text-xcolor" />
                            {course.name}
                          </li>
                        ))}
                        {allCourses.length > 3 && (
                          <li className="text-sm text-gray-500 italic">
                            +{allCourses.length - 3} more courses
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Pricing */}
                    <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-xcolor">€{PRICING.monthly}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">/month</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        or €{PRICING.annually}/year (Save 33%)
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <button
                      onClick={() => handlePurchaseClick(domain, 'monthly')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-xcolor hover:bg-xcolor hover:text-black text-xcolor font-semibold rounded-md transition-colors"
                    >
                      <WalletIcon className="w-4 h-4" />
                      <span>Buy Monthly</span>
                    </button>
                    <button
                      onClick={() => handlePurchaseClick(domain, 'annually')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-xcolor hover:bg-xcolor text-black font-semibold rounded-md transition-colors"
                    >
                      <CreditCardIcon className="w-4 h-4" />
                      <span>Buy Annual <span className="text-xs text-gray-500"></span></span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl">Confirm Purchase</DialogTitle>
              <DialogDescription>
                Please review your purchase details before proceeding
              </DialogDescription>
            </DialogHeader>

            {selectedDomainForPurchase && selectedPlan && (
              <div className="mt-4 space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">{selectedDomainForPurchase.name}</h4>
                  {(() => {
                    const allCourses = [...selectedDomainForPurchase.course_library, ...selectedDomainForPurchase.currently_studying]
                    return (
                      <>
                        <p className="text-sm text-gray-500 mb-3">
                          {selectedPlan === 'monthly' ? 'Monthly Plan' : 'Annual Plan'} • {allCourses.length} course{allCourses.length !== 1 ? 's' : ''}
                        </p>
                        
                        {/* Course List */}
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-2">Courses included:</p>
                          <ul className="space-y-1">
                            {allCourses.map((course) => (
                              <li key={course.id} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Check className="w-3 h-3 text-xcolor" />
                                {course.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )
                  })()}

                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Price:</span>
                      <span className="text-xl font-bold text-xcolor">
                        €{PRICING[selectedPlan].toFixed(2)}
                        {selectedPlan === 'monthly' ? '/month' : '/year'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsConfirmationOpen(false)
                  setSelectedDomainForPurchase(null)
                  setSelectedPlan(null)
                }}
                disabled={processingPurchase}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPurchase}
                disabled={processingPurchase}
                className="bg-xcolor hover:bg-xcolor text-black font-semibold"
              >
                {processingPurchase ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}