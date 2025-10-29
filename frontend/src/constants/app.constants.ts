export const APP_CONTENT = {
  header: {
    title: "Amazon Review Dashboard",
    subtitle: "Analytics and insights for review statistics",
  },
  loading: {
    ariaLabel: "Loading",
    text: "Loading...",
  },
  error: {
    defaultTitle: "Error",
    fetchCancelled: "Request was cancelled",
    unknownError: "An unknown error occurred",
  },
  navigation: {
    preDelivery: "Pre-Delivery Insights",
    lastReviewRating: "Last Review Rating",
    postDelivery: "Post-Delivery",
    clientAcceptance: "Client's Acceptance Rate",
  },
} as const

export const STATISTICS_CONTENT = {
  qualityDimensions: {
    noData: "No quality dimensions data available",
  },
  preDelivery: {
    title: "Pre-Delivery Insights",
    subtitle: "Last review rating and quality dimensions across reviewers, trainers, and domains",
    tabs: {
      reviewers: "Across Reviewers",
      trainers: "Across Trainers",
      domains: "Across Domains",
    },
    overview: {
      conversations: "Total Conversations",
      qualityDimensions: "Quality Dimensions",
    },
    card: {
      name: "Name",
      conversations: "Conversations",
      viewDetails: "View Quality Dimensions",
    },
    qualityDimension: {
      name: "Dimension",
      passCount: "Passed",
      notPassCount: "Not Passed",
      averageScore: "Average Score",
    },
    loading: "Loading pre-delivery insights...",
    loadingError: "Failed to load pre-delivery data",
    noData: "No pre-delivery data available",
  },
  dashboard: {
    title: "Dashboard",
    subtitle: "Monitor performance insights and quality trends",
    metrics: {
      totalConversations: {
        label: "Total Conversations",
        description: "",
      },
      passRate: {
        label: "Pass Rate",
        description: "passed",
      },
      failRate: {
        label: "Fail Rate",
        description: "failed",
      },
      avgScore: {
        label: "Average Score",
        description: "across {count} quality metrics",
      },
    },
    sections: {
      performanceOverview: {
        title: "Performance Overview",
        subtitle: "Detailed metrics across different perspectives",
      },
      qualityDistribution: {
        title: "Quality Dimensions Distribution",
        subtitle: "Distribution of evaluations across quality metrics",
      },
      qualityPerformance: {
        title: "Quality Dimensions Performance",
        subtitle: "Top performing quality metrics ranked by total evaluations",
      },
    },
    loadingError: "Failed to load dashboard data",
    noData: "No dashboard data available",
  },
} as const

export const API_ENDPOINTS = {
  preDelivery: {
    overview: "/pre-delivery/overview",
    byReviewer: "/pre-delivery/by-reviewer",
    byTrainer: "/pre-delivery/by-trainer",
    byDomain: "/pre-delivery/by-domain",
  },
} as const

export const SPINNER_SIZES = {
  small: "sm",
  medium: "md",
  large: "lg",
} as const

export const HTTP_STATUS = {
  ok: 200,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  serverError: 500,
} as const

export const LAYOUT = {
  spacing: {
    section: "space-y-6",
    card: "gap-6",
    content: "space-y-4",
  },
  padding: {
    card: "p-6",
    section: "p-8",
  },
  grid: {
    metrics: "grid gap-6 md:grid-cols-2 lg:grid-cols-4",
    mainContent: "grid gap-6 lg:grid-cols-3",
  },
  height: {
    chart: "h-[500px]",
    minLoading: "min-h-[400px]",
  },
} as const

export const TYPOGRAPHY = {
  heading: {
    page: "text-3xl font-bold tracking-tight",
    section: "text-lg font-semibold",
    card: "text-sm font-medium text-muted-foreground",
  },
  value: {
    primary: "text-3xl font-bold tracking-tight",
    secondary: "text-xs text-muted-foreground",
  },
  subtitle: "text-sm text-muted-foreground",
} as const

export const ICON_SIZES = {
  metric: "w-6 h-6",
  large: "w-8 h-8",
  small: "w-4 h-4",
} as const

export const TABLE_STYLES = {
  container: "border border-border rounded-lg overflow-hidden",
  scrollContainer: "overflow-x-auto max-h-[500px] overflow-y-auto",
  table: "w-full border-collapse min-w-max",
  header: {
    row: "sticky top-0 bg-muted z-10 border-b-2 border-border",
    cell: "text-left px-4 py-3 font-semibold text-sm whitespace-nowrap",
    cellRight: "text-right px-4 py-3 font-semibold text-sm whitespace-nowrap",
    cellSticky: "sticky left-0 bg-muted",
  },
  body: {
    row: "border-b border-border last:border-0 hover:bg-muted/20 transition-colors group",
    cellName: "px-4 py-3 sticky left-0 bg-background group-hover:bg-muted text-sm",
    cell: "px-4 py-3 text-right whitespace-nowrap text-sm",
    cellPrimary: "px-4 py-3 text-right font-semibold text-primary whitespace-nowrap text-sm",
    cellSuccess: "px-4 py-3 text-right text-success font-medium whitespace-nowrap text-sm",
    cellDestructive: "px-4 py-3 text-right text-destructive font-medium whitespace-nowrap text-sm",
  },
} as const
