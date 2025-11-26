"use client"

import React, { useState, useEffect } from "react"
import {
  Loader2,
  Calendar,
  CreditCard,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react"
import Image from "next/image"
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

// Subscription interface based on API response
interface Subscription {
  id: number
  user: number
  domain: number
  stripe_customer_id: string
  stripe_subscription_id: string
  price_id: string
  plan_interval: "month" | "year"
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  is_active: boolean
}

// Domain interface
interface Domain {
  id: number
  name: string
}

// Component
export default function CurrentSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [domains, setDomains] = useState<Record<number, Domain>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Cancel subscription dialog state
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [cancelling, setCancelling] = useState(false)

  // Fetch subscriptions and domains
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const token = sessionStorage.getItem('Authorization')
        
        if (!token) {
          throw new Error('Please log in to view subscriptions')
        }

        // Fetch subscriptions
        const subscriptionsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/user_active_domains/`,
          {
            method: 'GET',
            headers: {
              'Authorization': `${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!subscriptionsResponse.ok) {
          throw new Error(`Failed to fetch subscriptions: ${subscriptionsResponse.statusText}`)
        }

        const subscriptionsData: Subscription[] = await subscriptionsResponse.json()
        setSubscriptions(subscriptionsData)

        // Fetch domains to get domain names
        const domainsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/domains/courses/`,
          {
            method: 'GET',
            headers: {
              'Authorization': `${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (domainsResponse.ok) {
          const domainsData: Domain[] = await domainsResponse.json()
          // Create a map of domain ID to domain object
          const domainMap: Record<number, Domain> = {}
          domainsData.forEach((domain) => {
            domainMap[domain.id] = domain
          })
          setDomains(domainMap)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Calculate days remaining
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Handle cancel subscription click
  const handleCancelClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setIsCancelDialogOpen(true)
  }

  // Handle cancel subscription confirmation
  const handleConfirmCancel = async () => {
    if (!selectedSubscription) return

    setCancelling(true)
    const token = sessionStorage.getItem('Authorization')

    try {
      // Call cancel subscription API
      // Adjust the endpoint based on your API structure
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user_active_domains/${selectedSubscription.id}/cancel/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || 'Failed to cancel subscription')
      }

      // Update subscription in state
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === selectedSubscription.id
            ? { ...sub, cancel_at_period_end: true }
            : sub
        )
      )

      toast.success('Subscription will be cancelled at the end of the current period')
      setIsCancelDialogOpen(false)
      setSelectedSubscription(null)
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred while cancelling')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="py-8 p-4 rounded-[10px] text-black dark:text-white pt-6">
        <div className="mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Current Subscriptions</h2>
            </div>
            <div className="w-full mr-8 my-6 sm:my-5">
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
              <h2 className="text-lg font-bold">Current Subscriptions</h2>
            </div>
            <div className="w-full border-b-2 mr-8 my-6 sm:my-5">
              <div className="font-bold text-lg text-center text-red-500">{error}</div>
            </div>
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
          <h1 className="text-2xl font-bold">Current Subscriptions</h1>
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Image src="/nothing.png" alt="No Subscriptions" width={200} height={200} className="mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No active subscriptions found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {subscriptions.map((subscription) => {
              const domain = domains[subscription.domain]
              const domainName = domain?.name || `Domain #${subscription.domain}`
              const daysRemaining = getDaysRemaining(subscription.current_period_end)
              const isCancelled = subscription.cancel_at_period_end

              return (
                <div
                  key={subscription.id}
                  className="group relative flex flex-col border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#1a1a1a] hover:border-xcolor/50 dark:hover:border-xcolor/30 hover:shadow-lg dark:hover:shadow-xcolor/10 transition-all duration-300 overflow-hidden"
                >
                  {/* Gradient Accent Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    isCancelled 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-400' 
                      : 'bg-gradient-to-r from-xcolor to-xcolor'
                  }`} />

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Header with Domain and Status */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          {domainName}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <CreditCard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 capitalize">
                            {subscription.plan_interval === 'month' ? 'Monthly' : 'Annual'} Plan
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {subscription.status === 'active' && !isCancelled ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold border border-green-200 dark:border-green-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : isCancelled ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-semibold border border-orange-200 dark:border-orange-800">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Cancelling
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
                            {subscription.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Period Information */}
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-xcolor/10 dark:bg-xcolor/20 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-xcolor" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Current Period</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {formatDate(subscription.current_period_start)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Ends On</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {formatDate(subscription.current_period_end)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Days Remaining Badge */}
                    <div className="mb-5">
                      <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-xcolor/10 to-xcolor/10 dark:from-xcolor/20 dark:to-xcolor/20 rounded-lg border border-xcolor/20 dark:border-xcolor/30">
                        <Clock className="w-4 h-4 text-xcolor" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Days Remaining:</span>
                        <span className="text-lg font-bold text-xcolor">
                          {daysRemaining > 0 ? `${daysRemaining}` : '0'}
                        </span>
                      </div>
                    </div>

                    {/* Cancellation Notice */}
                    {isCancelled && (
                      <div className="mb-5 p-4 bg-orange-50/50 dark:bg-orange-900/20 border border-orange-200/50 dark:border-orange-800/50 rounded-lg backdrop-blur-sm">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-1">
                              Subscription Ending
                            </p>
                            <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
                              Will end on <span className="font-medium">{formatDate(subscription.current_period_end)}</span>. 
                              This subscription will not auto-renew for the next {subscription.plan_interval}.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="px-6 pb-6 pt-0">
                    {!isCancelled && subscription.status === 'active' ? (
                      <button
                        onClick={() => handleCancelClick(subscription)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800 text-red-600 dark:text-red-400 font-semibold rounded-lg transition-all duration-200 group/btn"
                      >
                        <XCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        <span>Cancel Subscription</span>
                      </button>
                    ) : (
                      <div className="w-full px-4 py-3 text-center text-sm text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        {isCancelled ? 'Cancellation scheduled' : 'Subscription inactive'}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Cancel Subscription Confirmation Dialog */}
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl">Cancel Subscription</DialogTitle>
              <DialogDescription>
                Please confirm that you want to cancel this subscription
              </DialogDescription>
            </DialogHeader>

            {selectedSubscription && (
              <div className="mt-4 space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">
                    {domains[selectedSubscription.domain]?.name || `Domain #${selectedSubscription.domain}`}
                  </h4>
                  <p className="text-sm text-gray-500 mb-3">
                    {selectedSubscription.plan_interval === 'month' ? 'Monthly' : 'Annual'} Plan
                  </p>

                  <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                      <div className="text-sm text-orange-800 dark:text-orange-200">
                        <p className="font-semibold mb-1">Important Information:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Your subscription will remain active until <strong>{formatDate(selectedSubscription.current_period_end)}</strong></li>
                          <li>You will continue to have access until the end of the current billing period</li>
                          <li>This subscription will <strong>not auto-renew</strong> for the next {selectedSubscription.plan_interval}</li>
                          <li>You can resubscribe at any time before the end date</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCancelDialogOpen(false)
                  setSelectedSubscription(null)
                }}
                disabled={cancelling}
              >
                Keep Subscription
              </Button>
              <Button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
