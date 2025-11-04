export interface QualityDimensionStats {
  name: string
  average_score: number | null
  task_count: number
}

export interface DomainAggregation {
  domain: string | null
  task_count: number
  average_task_score: number | null
  quality_dimensions: QualityDimensionStats[]
}

export interface ReviewerAggregation {
  reviewer_id: number | null
  reviewer_name: string | null
  reviewer_email: string | null
  task_count: number
  average_task_score: number | null
  quality_dimensions: QualityDimensionStats[]
}

export interface TrainerLevelAggregation {
  trainer_id: number | null
  trainer_name: string | null
  trainer_email: string | null
  task_count: number
  average_task_score: number | null
  quality_dimensions: QualityDimensionStats[]
}

export interface OverallAggregation {
  task_count: number
  reviewer_count: number
  trainer_count: number
  domain_count: number
  delivered_tasks: number
  delivered_files: number
  quality_dimensions: QualityDimensionStats[]
  quality_dimensions_count?: number
}

export interface QualityDimensionDetail {
  name: string
  score_text: string | null
  score: number | null
}

export interface TaskLevelInfo {
  task_id: number | null
  task_score: number | null
  annotator_id: number | null
  annotator_name: string | null
  annotator_email: string | null
  reviewer_id: number | null
  reviewer_name: string | null
  reviewer_email: string | null
  colab_link: string | null
  updated_at: string | null
  week_number: number | null
  quality_dimensions: Record<string, number>
}

export interface FilterParams {
  domain?: string
  reviewer?: string
  trainer?: string
  quality_dimension?: string
  min_score?: number
  max_score?: number
  min_task_count?: number
  date_from?: string
  date_to?: string
}

