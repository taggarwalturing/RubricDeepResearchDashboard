import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
} from '@mui/material'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Assignment, TrendingUp } from '@mui/icons-material'
import { getOverallStats } from '../services/api'
import type { OverallAggregation, FilterParams } from '../types'
import FilterPanel from '../components/FilterPanel'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorDisplay from '../components/ErrorDisplay'

export default function OverallStats() {
  const [data, setData] = useState<OverallAggregation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterParams>({})

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

  const totalScores = data.quality_dimensions.reduce((sum, qd) => sum + qd.score_count, 0)

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Overall Statistics
      </Typography>

      <FilterPanel onFilterChange={handleFilterChange} />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Conversations"
            value={data.conversation_count.toLocaleString()}
            icon={<Assignment />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Average Score"
            value={avgScore}
            icon={<TrendingUp />}
            color="secondary"
            subtitle="Across all dimensions"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Scores"
            value={totalScores.toLocaleString()}
            icon={<Assignment />}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quality Dimensions: Task Count & Average Score Trend
              </Typography>
              <ResponsiveContainer width="100%" height={500}>
                <ComposedChart data={data.quality_dimensions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                  <YAxis yAxisId="left" label={{ value: 'Task Count', angle: -90, position: 'insideLeft' }} />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    domain={[0, 5]} 
                    label={{ value: 'Average Score', angle: 90, position: 'insideRight' }} 
                  />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    yAxisId="left" 
                    dataKey="score_count" 
                    fill="#FF9900" 
                    name="Task Count" 
                    opacity={0.8}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="average_score" 
                    stroke="#146EB4" 
                    strokeWidth={3}
                    name="Average Score"
                    dot={{ fill: '#146EB4', r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

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

