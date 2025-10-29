// API error response
export interface ApiError {
  detail: string
}

// Pre-Delivery Insights Types
export interface QualityDimensionScore {
  name: string
  passCount: number
  notPassCount: number
  averageScore: number
}

export interface PreDeliveryOverview {
  conversationCount: number
  qualityDimensions: QualityDimensionScore[]
}

export interface PreDeliveryReviewer {
  reviewerId: number
  reviewerName: string
  conversationCount: number
  qualityDimensions: QualityDimensionScore[]
}

export interface PreDeliveryTrainer {
  trainerLevelId: number
  trainerName: string
  conversationCount: number
  qualityDimensions: QualityDimensionScore[]
}

export interface PreDeliveryDomain {
  domain: string
  conversationCount: number
  qualityDimensions: QualityDimensionScore[]
}

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
  isLoading: boolean
}
