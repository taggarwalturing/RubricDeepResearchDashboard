import { useState } from "react"
import { useApi } from "../../hooks/use-api.hook"
import {
  getPreDeliveryOverview,
  getPreDeliveryByReviewer,
  getPreDeliveryByTrainer,
  getPreDeliveryByDomain,
} from "../../services/api.service"
import { QualityLineChart } from "../charts/quality-line-chart"
import { LoadingSpinner } from "../ui/loading-spinner"
import { ErrorMessage } from "../ui/error-message"
import { SectionHeader } from "../ui/section-header"
import { STATISTICS_CONTENT, SPINNER_SIZES } from "../../constants/app.constants"
import type {
  QualityDimensionScore,
  PreDeliveryReviewer,
  PreDeliveryTrainer,
  PreDeliveryDomain,
} from "../../types/api.type"

type FilterView = "overall" | "reviewers" | "trainers" | "domains"

interface FilterOption {
  value: FilterView
  label: string
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: "overall", label: "Overall" },
  { value: "reviewers", label: "Across Reviewers" },
  { value: "trainers", label: "Across Trainers" },
  { value: "domains", label: "Across Domains" },
]

export function FilterablePieChart() {
  const [selectedView, setSelectedView] = useState<FilterView>("overall")
  const content = STATISTICS_CONTENT.preDelivery

  const { data: overall, error: overallError, isLoading: overallLoading } = useApi({
    fetchFn: getPreDeliveryOverview,
  })

  const { data: reviewers, error: reviewersError, isLoading: reviewersLoading } = useApi({
    fetchFn: getPreDeliveryByReviewer,
  })

  const { data: trainers, error: trainersError, isLoading: trainersLoading } = useApi({
    fetchFn: getPreDeliveryByTrainer,
  })

  const { data: domains, error: domainsError, isLoading: domainsLoading } = useApi({
    fetchFn: getPreDeliveryByDomain,
  })

  const getCurrentData = () => {
    switch (selectedView) {
      case "overall":
        return overall?.qualityDimensions || []
      case "reviewers":
        if (!reviewers || reviewers.length === 0) return []
        return aggregateDimensionsByName(reviewers)
      case "trainers":
        if (!trainers || trainers.length === 0) return []
        return aggregateDimensionsByName(trainers)
      case "domains":
        if (!domains || domains.length === 0) return []
        return aggregateDimensionsByName(domains)
    }
  }

  // Aggregate dimensions by name to show distribution across quality dimensions
  const aggregateDimensionsByName = (items: PreDeliveryReviewer[] | PreDeliveryTrainer[] | PreDeliveryDomain[]) => {
    const dimensionMap = new Map<string, QualityDimensionScore & { totalCount: number }>()

    items.forEach(item => {
      item.qualityDimensions?.forEach((dim: QualityDimensionScore) => {
        const cleanName = dim.name.replace(/\[DRA\]/g, "").trim()
        const existing = dimensionMap.get(cleanName)

        if (existing) {
          existing.passCount += dim.passCount
          existing.notPassCount += dim.notPassCount
          existing.totalCount += (dim.passCount + dim.notPassCount)
        } else {
          dimensionMap.set(cleanName, {
            name: cleanName,
            passCount: dim.passCount,
            notPassCount: dim.notPassCount,
            totalCount: dim.passCount + dim.notPassCount,
            averageScore: dim.averageScore
          })
        }
      })
    })

    return Array.from(dimensionMap.values())
  }

  const getCurrentError = () => {
    switch (selectedView) {
      case "overall":
        return overallError
      case "reviewers":
        return reviewersError
      case "trainers":
        return trainersError
      case "domains":
        return domainsError
    }
  }

  const isLoading = overallLoading || reviewersLoading || trainersLoading || domainsLoading
  const error = getCurrentError()
  const data = getCurrentData()

  const dashboardContent = STATISTICS_CONTENT.dashboard

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4">
        <SectionHeader
          title={dashboardContent.sections.qualityDistribution.title}
          subtitle={dashboardContent.sections.qualityDistribution.subtitle}
        />
      </div>

      <div className="flex items-center gap-2 mb-6">
        <label htmlFor="pie-filter" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          View:
        </label>
        <select
          id="pie-filter"
          value={selectedView}
          onChange={(e) => setSelectedView(e.target.value as FilterView)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm hover:border-primary/50 transition-colors text-sm flex-1"
        >
          {FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <LoadingSpinner size={SPINNER_SIZES.medium} />
        </div>
      )}

      {error && <ErrorMessage title={content.loadingError} message={error.detail} />}

      {!isLoading && !error && data.length === 0 && (
        <p className="text-center text-muted-foreground py-8">{content.noData}</p>
      )}

      {!isLoading && !error && data.length > 0 && (
        <div className="flex-1 min-h-0">
          <QualityLineChart key={selectedView} data={data} title="" />
        </div>
      )}
    </div>
  )
}
