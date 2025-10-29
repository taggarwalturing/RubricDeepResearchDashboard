import type {
  PreDeliveryOverview,
  PreDeliveryReviewer,
  PreDeliveryTrainer,
  PreDeliveryDomain,
} from "../types/api.type"
import { mockData } from "../data/mock-api-data"
import { transformApiResponse } from "../utils/transform"
import { APP_CONTENT } from "../constants/app.constants"

/**
 * Simulates network delay for realistic mock API behavior
 * Returns a random delay between min and max milliseconds
 */
function getRandomDelay(): number {
  const MIN_DELAY = 300
  const MAX_DELAY = 800
  return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY
}

/**
 * Generic mock fetch function that simulates API delay
 */
async function mockFetch<T>(data: unknown, signal?: AbortSignal): Promise<T> {
  const delay = getRandomDelay()

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      try {
        // Transform snake_case to camelCase to match real API behavior
        const transformed = transformApiResponse<T>(data)
        resolve(transformed)
      } catch (error) {
        reject(error)
      }
    }, delay)

    // Handle abort signal
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(timeoutId)
        reject(new Error(APP_CONTENT.error.fetchCancelled))
      })
    }
  })
}

// Pre-Delivery Insights Mock API functions
export async function getPreDeliveryOverview(
  signal?: AbortSignal
): Promise<PreDeliveryOverview> {
  return mockFetch<PreDeliveryOverview>(mockData.overall, signal)
}

export async function getPreDeliveryByReviewer(
  signal?: AbortSignal
): Promise<PreDeliveryReviewer[]> {
  return mockFetch<PreDeliveryReviewer[]>(mockData.byReviewer, signal)
}

export async function getPreDeliveryByTrainer(
  signal?: AbortSignal
): Promise<PreDeliveryTrainer[]> {
  return mockFetch<PreDeliveryTrainer[]>(mockData.byTrainerLevel, signal)
}

export async function getPreDeliveryByDomain(
  signal?: AbortSignal
): Promise<PreDeliveryDomain[]> {
  // Note: Using byReviewer as placeholder since there's no by-domain in mock data
  // You can create a separate mock file or transform existing data as needed
  return mockFetch<PreDeliveryDomain[]>(mockData.byReviewer, signal)
}
