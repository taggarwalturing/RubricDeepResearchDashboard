import axios from 'axios'
import type {
  OverallAggregation,
  DomainAggregation,
  ReviewerAggregation,
  TrainerLevelAggregation,
  TaskLevelInfo,
  FilterParams,
} from '../types'

const API_BASE_URL = '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Simple in-memory cache
interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<any>>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Helper function to build query params
const buildQueryParams = (filters?: FilterParams): string => {
  if (!filters) return ''
  
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  })
  
  return params.toString() ? `?${params.toString()}` : ''
}

// Helper function to generate cache key
const getCacheKey = (endpoint: string, filters?: FilterParams): string => {
  return `${endpoint}${buildQueryParams(filters)}`
}

// Helper function to get from cache
const getFromCache = <T>(key: string): T | null => {
  const entry = cache.get(key)
  if (!entry) return null
  
  const now = Date.now()
  if (now - entry.timestamp > CACHE_DURATION) {
    cache.delete(key)
    return null
  }
  
  return entry.data as T
}

// Helper function to set cache
const setCache = <T>(key: string, data: T): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  })
}

// Function to clear cache (can be called manually)
export const clearCache = (): void => {
  cache.clear()
}

export const getOverallStats = async (filters?: FilterParams): Promise<OverallAggregation> => {
  const cacheKey = getCacheKey('/overall', filters)
  const cached = getFromCache<OverallAggregation>(cacheKey)
  if (cached) return cached
  
  const queryParams = buildQueryParams(filters)
  const response = await apiClient.get<OverallAggregation>(`/overall${queryParams}`)
  setCache(cacheKey, response.data)
  return response.data
}

export const getDomainStats = async (filters?: FilterParams): Promise<DomainAggregation[]> => {
  const cacheKey = getCacheKey('/by-domain', filters)
  const cached = getFromCache<DomainAggregation[]>(cacheKey)
  if (cached) return cached
  
  const queryParams = buildQueryParams(filters)
  const response = await apiClient.get<DomainAggregation[]>(`/by-domain${queryParams}`)
  setCache(cacheKey, response.data)
  return response.data
}

export const getReviewerStats = async (filters?: FilterParams): Promise<ReviewerAggregation[]> => {
  const cacheKey = getCacheKey('/by-reviewer', filters)
  const cached = getFromCache<ReviewerAggregation[]>(cacheKey)
  if (cached) return cached
  
  const queryParams = buildQueryParams(filters)
  const response = await apiClient.get<ReviewerAggregation[]>(`/by-reviewer${queryParams}`)
  setCache(cacheKey, response.data)
  return response.data
}

export const getTrainerStats = async (filters?: FilterParams): Promise<TrainerLevelAggregation[]> => {
  const cacheKey = getCacheKey('/by-trainer-level', filters)
  const cached = getFromCache<TrainerLevelAggregation[]>(cacheKey)
  if (cached) return cached
  
  const queryParams = buildQueryParams(filters)
  const response = await apiClient.get<TrainerLevelAggregation[]>(`/by-trainer-level${queryParams}`)
  setCache(cacheKey, response.data)
  return response.data
}

export const getTaskLevelInfo = async (filters?: FilterParams): Promise<TaskLevelInfo[]> => {
  const cacheKey = getCacheKey('/task-level', filters)
  const cached = getFromCache<TaskLevelInfo[]>(cacheKey)
  if (cached) return cached
  
  const queryParams = buildQueryParams(filters)
  const response = await apiClient.get<TaskLevelInfo[]>(`/task-level${queryParams}`)
  setCache(cacheKey, response.data)
  return response.data
}

export const checkHealth = async (): Promise<{ status: string; version: string }> => {
  const response = await apiClient.get('/health')
  return response.data
}

// Get unique filter options
export const getFilterOptions = async (): Promise<{
  domains: string[]
  quality_dimensions: string[]
  reviewers: Array<{ id: string; name: string }>
  trainers: Array<{ id: string; name: string }>
}> => {
  // Fetch data from different endpoints to build filter options
  const [domainData, overallData, reviewerData, trainerData] = await Promise.all([
    getDomainStats(),
    getOverallStats(),
    getReviewerStats(),
    getTrainerStats(),
  ])

  // Extract unique domains
  const domains = [...new Set(domainData.map(d => d.domain).filter(Boolean))] as string[]

  // Extract unique quality dimensions
  const qualityDimensions = [
    ...new Set(
      overallData.quality_dimensions.map(qd => qd.name)
    )
  ]

  // Extract reviewers
  const reviewers = reviewerData
    .filter(r => r.reviewer_id)
    .map(r => ({
      id: String(r.reviewer_id),
      name: r.reviewer_name || `Reviewer ${r.reviewer_id}`
    }))

  // Extract trainers
  const trainers = trainerData
    .filter(t => t.trainer_level_id)
    .map(t => ({
      id: String(t.trainer_level_id),
      name: t.trainer_name || `Trainer ${t.trainer_level_id}`
    }))

  return {
    domains,
    quality_dimensions: qualityDimensions,
    reviewers,
    trainers,
  }
}

