import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Typography,
  Paper,
} from '@mui/material'
import { Assignment, TrendingUp, RateReview, School } from '@mui/icons-material'
import { getOverallStats, getFilterOptions } from '../services/api'
import type { OverallAggregation, FilterParams } from '../types'
import AdvancedFilterPanel from '../components/AdvancedFilterPanel'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorDisplay from '../components/ErrorDisplay'

export default function OverallStats() {
  const [data, setData] = useState<OverallAggregation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterParams>({})
  const [filterOptions, setFilterOptions] = useState<{
    domains: string[]
    quality_dimensions: string[]
    reviewers: Array<{ id: string; name: string }>
    trainers: Array<{ id: string; name: string }>
  }>({
    domains: [],
    quality_dimensions: [],
    reviewers: [],
    trainers: [],
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getOverallStats(filters)
      setData(result)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch overall statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filters])

  useEffect(() => {
    // Fetch filter options on component mount
    const loadFilterOptions = async () => {
      try {
        const options = await getFilterOptions()
        setFilterOptions(options)
      } catch (err) {
        console.error('Failed to load filter options:', err)
      }
    }
    loadFilterOptions()
  }, [])

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters)
  }

  if (loading) {
    return <LoadingSpinner message="Loading overall statistics..." />
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchData} />
  }

  if (!data) {
    return <ErrorDisplay message="No data available" onRetry={fetchData} />
  }

  const avgScore =
    data.quality_dimensions.length > 0
      ? (
          data.quality_dimensions.reduce((sum, qd) => sum + (qd.average_score || 0), 0) /
          data.quality_dimensions.length
        ).toFixed(2)
      : '0.00'

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Overall Statistics
      </Typography>

      <AdvancedFilterPanel 
        onFilterChange={handleFilterChange}
        availableDomains={filterOptions.domains}
        availableQualityDimensions={filterOptions.quality_dimensions}
        availableReviewers={filterOptions.reviewers}
        availableTrainers={filterOptions.trainers}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Conversations"
            value={data.conversation_count.toLocaleString()}
            icon={<Assignment />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Reviewers"
            value={data.reviewer_count.toLocaleString()}
            icon={<RateReview />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Trainers"
            value={data.trainer_count.toLocaleString()}
            icon={<School />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Score"
            value={avgScore}
            icon={<TrendingUp />}
            color="secondary"
            subtitle="Across all dimensions"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Quality Dimensions Details
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                      Dimension
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
                  {data.quality_dimensions.map((qd, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
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
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

