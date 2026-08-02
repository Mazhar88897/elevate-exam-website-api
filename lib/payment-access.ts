/** Resolve paid / All Access state from sessionStorage. */

export type SubscriptionStatusPayload = {
  status?: string
  is_active?: boolean
  plan_interval?: string
  [key: string]: unknown
}

/** Access is granted only when `subscription_status` is `"active"`. */
export function hasPaidAccessFromSession(): boolean {
  if (typeof window === "undefined") return false

  try {
    const raw = sessionStorage.getItem("subscription_data")
    if (raw) {
      const data = JSON.parse(raw) as SubscriptionStatusPayload
      if (isSubscriptionActive(data)) return true
    }
  } catch {
    // fall through to subscription_status
  }

  const status = (sessionStorage.getItem("subscription_status") || "")
    .trim()
    .toLowerCase()
  return status === "active"
}

export function isSubscriptionActive(
  data: SubscriptionStatusPayload | null | undefined
): boolean {
  if (!data) return false
  if (typeof data.is_active === "boolean") return data.is_active
  return String(data.status || "")
    .trim()
    .toLowerCase() === "active"
}

/** Persist subscription_status from API payloads. */
export function storeSubscriptionStatus(value: unknown): void {
  if (typeof window === "undefined") return
  if (value === undefined || value === null) return
  sessionStorage.setItem("subscription_status", String(value))
}

export function storeSubscriptionData(data: SubscriptionStatusPayload): void {
  if (typeof window === "undefined" || !data) return
  sessionStorage.setItem("subscription_data", JSON.stringify(data))
  const status =
    data.status ?? (data.is_active ? "active" : "inactive")
  storeSubscriptionStatus(status)
}

/** Fetch /api/subscription/status/, store it, return whether active. */
export async function fetchAndStoreSubscription(
  authHeader?: string | null
): Promise<boolean> {
  if (typeof window === "undefined") return false
  const auth = authHeader ?? sessionStorage.getItem("Authorization")
  const base = process.env.NEXT_PUBLIC_BASE_URL
  if (!auth || !base) return false

  try {
    const res = await fetch(`${base}/api/subscription/status/`, {
      method: "GET",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
    })
    if (!res.ok) return false
    const data = (await res.json()) as SubscriptionStatusPayload
    storeSubscriptionData(data)
    return isSubscriptionActive(data)
  } catch {
    return false
  }
}

export function getPostLoginPath(isActive: boolean): string {
  return isActive ? "/dashboard/" : "/payment/plan"
}

/** Persist fields from /auth/users/me/ or subscription status responses. */
export function persistUserPaymentFields(userData: Record<string, unknown>): void {
  if (typeof window === "undefined" || !userData) return

  if ("subscription_status" in userData && userData.subscription_status != null) {
    storeSubscriptionStatus(userData.subscription_status)
    return
  }

  if ("status" in userData && userData.status != null) {
    storeSubscriptionStatus(userData.status)
  }
}
