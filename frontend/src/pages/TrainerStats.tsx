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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { ExpandMore, School } from '@mui/icons-material'
import { getTrainerStats } from '../services/api'
import type { TrainerLevelAggregation, FilterParams } from '../types'
import FilterPanel from '../components/FilterPanel'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorDisplay from '../components/ErrorDisplay'

export default function TrainerStats() {
  const [data, setData] = useState<TrainerLevelAggregation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterParams>({})

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getTrainerStats(filters)
      setData(result)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trainer statistics')
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
    return <LoadingSpinner message="Loading trainer statistics..." />
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchData} />
  }

  if (!data || data.length === 0) {
    return <ErrorDisplay message="No trainer data available" onRetry={fetchData} />
  }

  const totalConversations = data.reduce((sum, trainer) => sum + trainer.conversation_count, 0)
  const totalTrainers = data.length

  // Prepare data for charts
  const chartData = data.map((trainer) => ({
    trainer: trainer.trainer_name || `Level ID: ${trainer.trainer_level_id}`,
    conversations: trainer.conversation_count,
    avgScore:
      trainer.quality_dimensions.length > 0
        ? parseFloat(
            (
              trainer.quality_dimensions.reduce((sum, qd) => sum + (qd.average_score || 0), 0) /
              trainer.quality_dimensions.length
            ).toFixed(2)
          )
        : 0,
  }))

  // Prepare radar chart data for top trainer
  const topTrainer = data.reduce((prev, current) =>
    prev.conversation_count > current.conversation_count ? prev : current
  )
  const radarData = topTrainer.quality_dimensions.map((qd) => ({
    dimension: qd.name,
    score: qd.average_score || 0,
    fullMark: 5,
  }))

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Trainer Statistics
      </Typography>

      <FilterPanel onFilterChange={handleFilterChange} showTrainerFilter={false} />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Trainers"
            value={totalTrainers}
            icon={<School />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Training Sessions"
            value={totalConversations.toLocaleString()}
            icon={<School />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Avg Sessions/Trainer"
            value={(totalConversations / totalTrainers).toFixed(0)}
            icon={<School />}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Training Sessions by Trainer
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="trainer" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="conversations" fill="#FF9900" name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Performance Profile - Top Trainer
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {topTrainer.trainer_name || `Trainer Level ID: ${topTrainer.trainer_level_id}`}
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" />
                  <PolarRadiusAxis domain={[0, 5]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#146EB4"
                    fill="#146EB4"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Trainer Details
          </Typography>
          {data.map((trainer, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {trainer.trainer_name?.[0] || 'T'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 500 }}>
                      {trainer.trainer_name || `Trainer Level ID: ${trainer.trainer_level_id}`}
                    </Typography>
                    {trainer.trainer_level_id && (
                      <Typography variant="caption" color="text.secondary">
                        Level ID: {trainer.trainer_level_id}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={`${trainer.conversation_count} sessions`}
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
                      {trainer.quality_dimensions.map((qd, qIndex) => (
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

