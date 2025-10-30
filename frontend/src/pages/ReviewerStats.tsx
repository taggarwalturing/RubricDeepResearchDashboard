import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Avatar,
} from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ExpandMore, People } from '@mui/icons-material'
import { getReviewerStats } from '../services/api'
import type { ReviewerAggregation, FilterParams } from '../types'
import FilterPanel from '../components/FilterPanel'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorDisplay from '../components/ErrorDisplay'

export default function ReviewerStats() {
  const [data, setData] = useState<ReviewerAggregation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterParams>({})

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getReviewerStats(filters)
      setData(result)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reviewer statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filters])

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters)
  }

  if (loading) {
    return <LoadingSpinner message="Loading reviewer statistics..." />
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchData} />
  }

  if (!data || data.length === 0) {
    return <ErrorDisplay message="No reviewer data available" onRetry={fetchData} />
  }

  const totalConversations = data.reduce((sum, reviewer) => sum + reviewer.conversation_count, 0)
  const totalReviewers = data.length

  // Prepare data for charts
  const chartData = data.map((reviewer) => ({
    reviewer: reviewer.reviewer_name || `ID: ${reviewer.reviewer_id}`,
    conversations: reviewer.conversation_count,
    avgScore:
      reviewer.quality_dimensions.length > 0
        ? parseFloat(
            (
              reviewer.quality_dimensions.reduce((sum, qd) => sum + (qd.average_score || 0), 0) /
              reviewer.quality_dimensions.length
            ).toFixed(2)
          )
        : 0,
  }))

  // Sort by conversations for top reviewers
  const topReviewers = [...chartData].sort((a, b) => b.conversations - a.conversations).slice(0, 10)

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Reviewer Statistics
      </Typography>

      <FilterPanel onFilterChange={handleFilterChange} showReviewerFilter={false} />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Reviewers"
            value={totalReviewers}
            icon={<People />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Reviews"
            value={totalConversations.toLocaleString()}
            icon={<People />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Avg Reviews/Reviewer"
            value={(totalConversations / totalReviewers).toFixed(0)}
            icon={<People />}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Top 10 Reviewers by Reviews
              </Typography>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={topReviewers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="reviewer" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="conversations" fill="#FF9900" name="Reviews" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Reviewer Details
          </Typography>
          {data.map((reviewer, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {reviewer.reviewer_name?.[0] || 'R'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 500 }}>
                      {reviewer.reviewer_name || `Reviewer ID: ${reviewer.reviewer_id}`}
                    </Typography>
                    {reviewer.reviewer_id && (
                      <Typography variant="caption" color="text.secondary">
                        ID: {reviewer.reviewer_id}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={`${reviewer.conversation_count} reviews`}
                    color="primary"
                    size="small"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                          Quality Dimension
                        </th>
                        <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>
                          Average Score
                        </th>
                        <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>
                          Task Count
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewer.quality_dimensions.map((qd, qIndex) => (
                        <tr key={qIndex} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px' }}>{qd.name}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            {qd.average_score?.toFixed(2) || 'N/A'}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>{qd.score_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>
    </Box>
  )
}

