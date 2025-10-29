import { useState } from "react"
import { useApi } from "../../hooks/use-api.hook"
import {
  getPreDeliveryOverview,
  getPreDeliveryByReviewer,
  getPreDeliveryByTrainer,
  getPreDeliveryByDomain,
} from "../../services/api.service"
import { LoadingSpinner } from "../ui/loading-spinner"
import { ErrorMessage } from "../ui/error-message"
import { SectionHeader } from "../ui/section-header"
import { STATISTICS_CONTENT, SPINNER_SIZES, TABLE_STYLES } from "../../constants/app.constants"
import type {
  QualityDimensionScore,
  PreDeliveryOverview,
  PreDeliveryReviewer,
  PreDeliveryTrainer,
  PreDeliveryDomain,
} from "../../types/api.type"

type FilterView = "overall" | "reviewers" | "trainers" | "domains"

type PreDeliveryData = PreDeliveryOverview | PreDeliveryReviewer | PreDeliveryTrainer | PreDeliveryDomain

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

export function FilterableDataTable() {
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
        return overall ? [overall] : []
      case "reviewers":
        return reviewers || []
      case "trainers":
        return trainers || []
      case "domains":
        return domains || []
    }
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

  // Get all unique quality dimensions from the data
  const getAllQualityDimensions = () => {
    const dimensionsSet = new Set<string>()
    data.forEach((item: PreDeliveryData) => {
      item.qualityDimensions?.forEach((dim: QualityDimensionScore) => {
        const cleanName = dim.name.replace(/\[DRA\]/g, "").trim()
        dimensionsSet.add(cleanName)
      })
    })
    return Array.from(dimensionsSet).sort()
  }

  const qualityDimensions = data.length > 0 ? getAllQualityDimensions() : []

  const getNameColumn = () => {
    switch (selectedView) {
      case "overall":
        return "Category"
      case "reviewers":
        return "Reviewer Name"
      case "trainers":
        return "Trainer Level"
      case "domains":
        return "Domain"
    }
  }

  const getName = (item: PreDeliveryData) => {
    switch (selectedView) {
      case "overall":
        return "Overall Metrics"
      case "reviewers":
        return (item as PreDeliveryReviewer).reviewerName
      case "trainers":
        return (item as PreDeliveryTrainer).trainerName
      case "domains":
        return (item as PreDeliveryDomain).domain
    }
  }

  // Get score for a specific quality dimension
  const getDimensionScore = (item: PreDeliveryData, dimensionName: string) => {
    const dimension = item.qualityDimensions?.find(
      (dim: QualityDimensionScore) => dim.name.replace(/\[DRA\]/g, "").trim() === dimensionName
    )
    return dimension ? dimension.averageScore.toFixed(2) : "-"
  }

  const dashboardContent = STATISTICS_CONTENT.dashboard

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SectionHeader
          title={dashboardContent.sections.performanceOverview.title}
          subtitle={dashboardContent.sections.performanceOverview.subtitle}
        />
        <div className="flex items-center gap-2">
          <label htmlFor="view-filter" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            View:
          </label>
          <select
            id="view-filter"
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value as FilterView)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm hover:border-primary/50 transition-colors text-sm"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size={SPINNER_SIZES.medium} />
        </div>
      )}

      {error && <ErrorMessage title={content.loadingError} message={error.detail} />}

      {!isLoading && !error && data.length === 0 && (
        <p className="text-center text-muted-foreground py-8">{content.noData}</p>
      )}

      {!isLoading && !error && data.length > 0 && (
        <div className={TABLE_STYLES.container}>
          <div className={TABLE_STYLES.scrollContainer}>
            <table className={TABLE_STYLES.table}>
              <thead className={TABLE_STYLES.header.row}>
                <tr>
                  <th className={`${TABLE_STYLES.header.cell} ${TABLE_STYLES.header.cellSticky}`}>
                    {getNameColumn()}
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-sm whitespace-nowrap">Conversations</th>
                  <th className="text-center px-4 py-3 font-semibold text-sm whitespace-nowrap">Avg Score</th>
                  <th className="text-center px-4 py-3 font-semibold text-sm whitespace-nowrap">Pass Count</th>
                  <th className="text-center px-4 py-3 font-semibold text-sm whitespace-nowrap">Fail Count</th>
                  {qualityDimensions.map((dimension) => (
                    <th key={dimension} className="text-center px-4 py-3 font-semibold text-sm whitespace-nowrap">
                      {dimension}
                    </th>
                  ))}
                </tr>
              </thead>
            <tbody>
              {data.map((item: PreDeliveryData, index: number) => {
                const totalPass = item.qualityDimensions.reduce(
                  (sum: number, dim: QualityDimensionScore) => sum + dim.passCount,
                  0
                )
                const totalFail = item.qualityDimensions.reduce(
                  (sum: number, dim: QualityDimensionScore) => sum + dim.notPassCount,
                  0
                )
                const avgScore =
                  item.qualityDimensions.reduce(
                    (sum: number, dim: QualityDimensionScore) => sum + dim.averageScore,
                    0
                  ) / item.qualityDimensions.length

                return (
                  <tr key={index} className={TABLE_STYLES.body.row}>
                    <td className={TABLE_STYLES.body.cellName}>
                      {getName(item)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap text-sm">
                      {item.conversationCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap text-sm">
                      {avgScore.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap text-sm">
                      {totalPass.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap text-sm">
                      {totalFail.toLocaleString()}
                    </td>
                    {qualityDimensions.map((dimension) => (
                      <td key={dimension} className="px-4 py-3 text-center whitespace-nowrap text-sm">
                        {getDimensionScore(item, dimension)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        </div>
      )}
    </div>
  )
}
