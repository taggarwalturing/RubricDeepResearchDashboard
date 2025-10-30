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
  LineChart,
  Line,
} from 'recharts'
import { ExpandMore, Business } from '@mui/icons-material'
import { getDomainStats } from '../services/api'
import type { DomainAggregation, FilterParams } from '../types'
import FilterPanel from '../components/FilterPanel'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorDisplay from '../components/ErrorDisplay'

export default function DomainStats() {
  const [data, setData] = useState<DomainAggregation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterParams>({})

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getDomainStats(filters)
      setData(result)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch domain statistics')
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
    return <LoadingSpinner message="Loading domain statistics..." />
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchData} />
  }

  if (!data || data.length === 0) {
    return <ErrorDisplay message="No domain data available" onRetry={fetchData} />
  }

  const totalConversations = data.reduce((sum, domain) => sum + domain.conversation_count, 0)
  const totalDomains = data.length

  // Prepare data for charts
  const chartData = data.map((domain) => ({
    domain: domain.domain || 'Unknown',
    conversations: domain.conversation_count,
    avgScore:
      domain.quality_dimensions.length > 0
        ? (
            domain.quality_dimensions.reduce((sum, qd) => sum + (qd.average_score || 0), 0) /
            domain.quality_dimensions.length
          ).toFixed(2)
        : 0,
  }))

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Domain Statistics
      </Typography>

      <FilterPanel onFilterChange={handleFilterChange} showDomainFilter={false} />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Domains"
            value={totalDomains}
            icon={<Business />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Conversations"
            value={totalConversations.toLocaleString()}
            icon={<Business />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Avg Conversations/Domain"
            value={(totalConversations / totalDomains).toFixed(0)}
            icon={<Business />}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Conversations by Domain
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="domain" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="conversations" fill="#FF9900" name="Conversations" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Average Score by Domain
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="domain" angle={-45} textAnchor="end" height={120} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgScore" stroke="#146EB4" name="Avg Score" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Domain Details
          </Typography>
          {data.map((domain, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography sx={{ fontWeight: 500 }}>{domain.domain || 'Unknown Domain'}</Typography>
                  <Chip
                    label={`${domain.conversation_count} conversations`}
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
                      {domain.quality_dimensions.map((qd, qIndex) => (
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

