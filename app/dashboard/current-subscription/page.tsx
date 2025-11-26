"use client"

import React, { useState, useEffect } from "react"
import {
  Loader2,
  Calendar,
  CreditCard,
  XCircle,
  CheckCircle2,
  AlertCircle,
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription/${selectedSubscription.id}/cancel/`,
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map((subscription) => {
              const domain = domains[subscription.domain]
              const domainName = domain?.name || `Domain #${subscription.domain}`
              const daysRemaining = getDaysRemaining(subscription.current_period_end)
              const isCancelled = subscription.cancel_at_period_end

              return (
                <div
                  key={subscription.id}
                  className="relative flex flex-col border border-gray-300 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow-md overflow-hidden"
                >
                  {/* Subscription Card Content */}
                  <div className="p-4">
                    {/* Domain Name and Status */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold truncate pr-2">{domainName}</h3>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {subscription.status === 'active' && !isCancelled ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md text-xs font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : isCancelled ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-md text-xs font-medium">
                            <AlertCircle className="w-3 h-3" />
                            Cancelled
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium">
                            {subscription.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Plan Interval and Days Remaining - Compact Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span className="font-medium capitalize">
                          {subscription.plan_interval === 'month' ? 'Monthly' : 'Annual'}
                        </span>
                      </div>
                      <div className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <span className="text-sm font-bold text-xcolor">
                          {daysRemaining > 0 ? `${daysRemaining}d` : 'Expired'}
                        </span>
                      </div>
                    </div>

                    {/* Period Dates - Compact */}
                    <div className="mb-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-xcolor flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-500 dark:text-gray-500">Start: </span>
                          <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                            {new Date(subscription.current_period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-xcolor flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-500 dark:text-gray-500">End: </span>
                          <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                            {new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="ml-2 text-red-500 dark:text-gray-500">
                            {isCancelled ? 'Subscription ended' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cancellation Notice - Compact */}
                    {/* {isCancelled && (
                      <div className="mb-3 px-2 py-1.5 bg-orange-50/50 dark:bg-orange-900/10 rounded-md">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-3 h-3 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                          <span className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                            Ends {new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • No auto-renewal
                          </span>
                        </div>
                      </div>
                    )} */}
                  </div>

                  {/* Action Button */}
                  <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                    {!isCancelled && subscription.status === 'active' ? (
                      <button
                        onClick={() => handleCancelClick(subscription)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border border-red-500 hover:bg-red-500 hover:text-white text-red-500 font-medium rounded-md transition-colors text-sm"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    ) : (
                      <div className="w-full px-3 py-1.5 text-center text-xs text-gray-500 dark:text-gray-400">
                        {isCancelled ? 'Resubscribe after period ends' : 'Inactive'}
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

