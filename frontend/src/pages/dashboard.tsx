import { useApi } from "../hooks/use-api.hook"
import {
  getPreDeliveryOverview,
  getPreDeliveryByReviewer,
} from "../services/api.service"
import { Card, CardContent } from "../components/ui/card"
import { LoadingSpinner } from "../components/ui/loading-spinner"
import { ErrorMessage } from "../components/ui/error-message"
import { ConversationIcon, CheckCircleIcon, AlertCircleIcon, StarIcon } from "../components/ui/icons"
import { MetricCard } from "../components/dashboard/metric-card"
import { FilterableDataTable } from "../components/dashboard/filterable-data-table"
import { FilterablePieChart } from "../components/dashboard/filterable-pie-chart"
import { 
  STATISTICS_CONTENT, 
  SPINNER_SIZES, 
  LAYOUT
} from "../constants/app.constants"

export function Dashboard() {
  const content = STATISTICS_CONTENT.dashboard

  const { data: overview, error: overviewError, isLoading: overviewLoading } = useApi({
    fetchFn: getPreDeliveryOverview,
  })

  const { data: reviewers, error: reviewersError, isLoading: reviewersLoading } = useApi({
    fetchFn: getPreDeliveryByReviewer,
  })

  const isLoading = overviewLoading || reviewersLoading
  const error = overviewError || reviewersError

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${LAYOUT.height.minLoading}`}>
        <LoadingSpinner size={SPINNER_SIZES.large} />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage title={content.loadingError} message={error.detail} />
  }

  if (!overview || !reviewers) {
    return (
      <Card>
        <CardContent className={LAYOUT.padding.section}>
          <p className="text-center text-muted-foreground">{content.noData}</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate metrics
  const totalPass = overview.qualityDimensions.reduce((sum, dim) => sum + dim.passCount, 0)
  const totalFail = overview.qualityDimensions.reduce((sum, dim) => sum + dim.notPassCount, 0)
  const total = totalPass + totalFail
  const passRate = total > 0 ? (totalPass / total) * 100 : 0
  const avgScore = overview.qualityDimensions.length > 0
    ? overview.qualityDimensions.reduce((sum, dim) => sum + dim.averageScore, 0) / overview.qualityDimensions.length
    : 0
  
  // Format metric descriptions
  const metricsData = [
    {
      label: content.metrics.totalConversations.label,
      value: overview.conversationCount.toLocaleString(),
      description: content.metrics.totalConversations.description,
      icon: <ConversationIcon />,
      variant: "primary" as const,
    },
    {
      label: content.metrics.passRate.label,
      value: `${passRate.toFixed(1)}%`,
      description: `${totalPass.toLocaleString()} ${content.metrics.passRate.description}`,
      icon: <CheckCircleIcon />,
      variant: "success" as const,
    },
    {
      label: content.metrics.failRate.label,
      value: `${(100 - passRate).toFixed(1)}%`,
      description: `${totalFail.toLocaleString()} ${content.metrics.failRate.description}`,
      icon: <AlertCircleIcon />,
      variant: "destructive" as const,
    },
    {
      label: content.metrics.avgScore.label,
      value: avgScore.toFixed(2),
      description: content.metrics.avgScore.description.replace(
        '{count}', 
        overview.qualityDimensions.length.toString()
      ),
      icon: <StarIcon />,
      variant: "warning" as const,
    },
  ]

  return (
    <div className={LAYOUT.spacing.section}>
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
      </div>

      {/* Key Metrics */}
      <div className={LAYOUT.grid.metrics}>
        {metricsData.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            description={metric.description}
            icon={metric.icon}
            variant={metric.variant}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className={LAYOUT.grid.mainContent}>
        {/* Data Table */}
        <Card className="lg:col-span-2">
          <CardContent className={LAYOUT.padding.card}>
            <FilterableDataTable />
          </CardContent>
        </Card>

        {/* Quality Distribution Chart */}
        <Card>
          <CardContent className={`${LAYOUT.padding.card} ${LAYOUT.height.chart}`}>
            <FilterablePieChart />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
