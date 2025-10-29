import type {
  PreDeliveryOverview,
  PreDeliveryReviewer,
  PreDeliveryTrainer,
  PreDeliveryDomain,
  ApiError,
} from "../types/api.type"
import { config } from "../config/app.config"
import { API_ENDPOINTS, APP_CONTENT } from "../constants/app.constants"
import { transformApiResponse } from "../utils/transform"
import * as mockApiService from "./mock-api.service"

interface FetchConfig {
  endpoint: string
  signal?: AbortSignal
}

async function fetchData<T>(fetchConfig: FetchConfig): Promise<T> {
  const { endpoint, signal } = fetchConfig

  try {
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      signal,
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json()
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    const rawData = await response.json()

    // Transform snake_case to camelCase
    return transformApiResponse<T>(rawData)
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(APP_CONTENT.error.fetchCancelled)
      }
      throw error
    }
    throw new Error(APP_CONTENT.error.unknownError)
  }
}

// Real API functions (internal)
async function realGetPreDeliveryOverview(
  signal?: AbortSignal
): Promise<PreDeliveryOverview> {
  return fetchData<PreDeliveryOverview>({
    endpoint: API_ENDPOINTS.preDelivery.overview,
    signal,
  })
}

async function realGetPreDeliveryByReviewer(
  signal?: AbortSignal
): Promise<PreDeliveryReviewer[]> {
  return fetchData<PreDeliveryReviewer[]>({
    endpoint: API_ENDPOINTS.preDelivery.byReviewer,
    signal,
  })
}

async function realGetPreDeliveryByTrainer(
  signal?: AbortSignal
): Promise<PreDeliveryTrainer[]> {
  return fetchData<PreDeliveryTrainer[]>({
    endpoint: API_ENDPOINTS.preDelivery.byTrainer,
    signal,
  })
}

async function realGetPreDeliveryByDomain(
  signal?: AbortSignal
): Promise<PreDeliveryDomain[]> {
  return fetchData<PreDeliveryDomain[]>({
    endpoint: API_ENDPOINTS.preDelivery.byDomain,
    signal,
  })
}

// Conditional exports: use mock API if configured, otherwise use real API
export const getPreDeliveryOverview = config.useMockApi
  ? mockApiService.getPreDeliveryOverview
  : realGetPreDeliveryOverview

export const getPreDeliveryByReviewer = config.useMockApi
  ? mockApiService.getPreDeliveryByReviewer
  : realGetPreDeliveryByReviewer

export const getPreDeliveryByTrainer = config.useMockApi
  ? mockApiService.getPreDeliveryByTrainer
  : realGetPreDeliveryByTrainer

export const getPreDeliveryByDomain = config.useMockApi
  ? mockApiService.getPreDeliveryByDomain
  : realGetPreDeliveryByDomain
