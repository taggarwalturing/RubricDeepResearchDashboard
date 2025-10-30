export interface QualityDimensionStats {
  name: string
  average_score: number | null
  score_count: number
}

export interface DomainAggregation {
  domain: string | null
  conversation_count: number
  quality_dimensions: QualityDimensionStats[]
}

export interface ReviewerAggregation {
  reviewer_id: number | null
  reviewer_name: string | null
  conversation_count: number
  quality_dimensions: QualityDimensionStats[]
}

export interface TrainerLevelAggregation {
  trainer_level_id: number | null
  trainer_name: string | null
  conversation_count: number
  quality_dimensions: QualityDimensionStats[]
}

export interface OverallAggregation {
  conversation_count: number
  quality_dimensions: QualityDimensionStats[]
}

export interface QualityDimensionDetail {
  name: string
  score_text: string | null
  score: number | null
}

export interface TaskLevelInfo {
  task_id: number | null
  annotator_id: number | null
  annotator_name: string | null
  quality_dimensions: QualityDimensionDetail[]
}

export interface FilterParams {
  domain?: string
  reviewer?: string
  trainer?: string
  quality_dimension?: string
  min_score?: number
  max_score?: number
  min_task_count?: number
}

