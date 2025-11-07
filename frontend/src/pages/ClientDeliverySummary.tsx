import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CircularProgress,
  Paper,
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  Description as FileIcon,
  Star as StarIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material'
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ResponsiveSankey } from '@nivo/sankey'
import axios from 'axios'

interface ClientDeliverySummary {
  total_tasks_delivered: number
  total_tasks_rejected: number
  total_tasks_accepted: number
  total_tasks_pending: number
  total_files: number
  average_turing_rating: number
  total_annotators: number
}

interface TimelineData {
  date: string
  total: number
  rejected: number
  approved: number
  pending: number
  average_rating: number
}

interface QualityTimelineData {
  date: string
  [key: string]: string | number  // Dynamic quality dimensions
}

interface SankeyData {
  nodes: Array<{ id: string; nodeColor?: string }>
  links: Array<{ source: string; target: string; value: number }>
}

interface SummaryCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

function SummaryCard({ title, value, icon, color, bgColor }: SummaryCardProps) {
  return (
    <Card
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        border: `1px solid #E5E7EB`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 2,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.1)`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            backgroundColor: bgColor,
            borderRadius: 2,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          color: '#1F2937',
          fontSize: '2rem',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </Typography>
    </Card>
  )
}

export default function ClientDeliverySummary() {
  const [data, setData] = useState<ClientDeliverySummary | null>(null)
  const [timelineData, setTimelineData] = useState<TimelineData[]>([])
  const [qualityTimelineData, setQualityTimelineData] = useState<QualityTimelineData[]>([])
  const [sankeyData, setSankeyData] = useState<SankeyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [summaryResponse, timelineResponse, qualityTimelineResponse, sankeyResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || ''}/api/client-delivery-summary`),
          axios.get(`${import.meta.env.VITE_API_URL || ''}/api/client-delivery-timeline`),
          axios.get(`${import.meta.env.VITE_API_URL || ''}/api/client-delivery-quality-timeline`),
          axios.get(`${import.meta.env.VITE_API_URL || ''}/api/client-delivery-sankey`)
        ])
        setData(summaryResponse.data)
        setTimelineData(timelineResponse.data)
        setQualityTimelineData(qualityTimelineResponse.data)
        setSankeyData(sankeyResponse.data)
      } catch (err: any) {
        console.error('Failed to fetch client delivery data:', err)
        setError(err.message || 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Listen for S3 sync events to refresh data
    const handleS3Synced = () => {
      console.log('🔄 S3 synced, refreshing summary data...')
      fetchData()
    }

    window.addEventListener('s3Synced', handleS3Synced)

    return () => {
      window.removeEventListener('s3Synced', handleS3Synced)
    }
  }, [])

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    )
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">
          {error || 'Failed to load client delivery summary'}
        </Typography>
      </Box>
    )
  }

  const summaryCards = [
    {
      title: 'Tasks Delivered',
      value: data.total_tasks_delivered.toLocaleString(),
      icon: <AssignmentIcon />,
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
    {
      title: 'Tasks Accepted',
      value: data.total_tasks_accepted.toLocaleString(),
      icon: <CheckCircleIcon />,
      color: '#059669',
      bgColor: '#A7F3D0',
    },
    {
      title: 'Tasks Rejected',
      value: data.total_tasks_rejected.toLocaleString(),
      icon: <CancelIcon />,
      color: '#EF4444',
      bgColor: '#FEE2E2',
    },
    {
      title: 'Tasks Pending',
      value: data.total_tasks_pending.toLocaleString(),
      icon: <PendingIcon />,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
    {
      title: 'Files Delivered',
      value: data.total_files.toLocaleString(),
      icon: <FileIcon />,
      color: '#3B82F6',
      bgColor: '#DBEAFE',
    },
    {
      title: 'Avg Turing Rating',
      value: data.average_turing_rating.toFixed(2),
      icon: <StarIcon />,
      color: '#F59E0B',
      bgColor: '#FDE68A',
    },
    {
      title: 'Total Annotators',
      value: data.total_annotators.toLocaleString(),
      icon: <PeopleIcon />,
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
    },
  ]

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#F8FAFC', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Description */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            sx={{
              color: '#6B7280',
              fontSize: '0.875rem',
              lineHeight: 1.6,
            }}
          >
            Comprehensive overview of client delivery metrics and performance indicators
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {summaryCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <SummaryCard
                title={card.title}
                value={card.value}
                icon={card.icon}
                color={card.color}
                bgColor={card.bgColor}
              />
            </Grid>
          ))}
        </Grid>

        {/* Timeline Chart */}
        {timelineData.length > 0 && (
          <Paper
            sx={{
              p: 3,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#1F2937',
                mb: 3,
              }}
            >
              Task Delivery Timeline
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={timelineData} margin={{ top: 20, right: 60, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={{ stroke: '#E5E7EB' }}
                  label={{ value: 'Tasks', angle: -90, position: 'insideLeft', style: { fill: '#6B7280', fontSize: 12 } }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 5]}
                  tick={{ fill: '#8B5CF6', fontSize: 12 }}
                  tickLine={{ stroke: '#8B5CF6' }}
                  label={{ value: 'Rating', angle: 90, position: 'insideRight', style: { fill: '#8B5CF6', fontSize: 12 } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                  }}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="rejected" 
                  stackId="1"
                  fill="#EF4444" 
                  name="Rejected"
                />
                <Bar 
                  yAxisId="left"
                  dataKey="pending" 
                  stackId="1"
                  fill="#F59E0B" 
                  name="Pending"
                />
                <Bar 
                  yAxisId="left"
                  dataKey="approved" 
                  stackId="1"
                  fill="#10B981" 
                  name="Approved"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="average_rating"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', r: 5 }}
                  name="Avg Rating"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        )}

        {/* Quality Dimensions Timeline Chart */}
        {qualityTimelineData.length > 0 && (() => {
          // Get all unique quality dimensions from the data
          const dimensions = new Set<string>()
          qualityTimelineData.forEach(item => {
            Object.keys(item).forEach(key => {
              if (key !== 'date') {
                dimensions.add(key)
              }
            })
          })
          const dimensionList = Array.from(dimensions)
          
          // Color palette for quality dimensions
          const colors = [
            '#3B82F6', // Blue
            '#10B981', // Green
            '#F59E0B', // Amber
            '#EF4444', // Red
            '#8B5CF6', // Purple
            '#EC4899', // Pink
            '#14B8A6', // Teal
            '#F97316', // Orange
          ]

          return (
            <Paper
              sx={{
                p: 3,
                mt: 3,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#1F2937',
                  mb: 3,
                }}
              >
                Quality Dimensions Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={qualityTimelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis
                    domain={[0, 5]}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickLine={{ stroke: '#E5E7EB' }}
                    label={{ value: 'Average Score', angle: -90, position: 'insideLeft', style: { fill: '#6B7280', fontSize: 12 } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: '20px',
                    }}
                  />
                  {dimensionList.map((dimension, index) => (
                    <Line
                      key={dimension}
                      type="monotone"
                      dataKey={dimension}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ fill: colors[index % colors.length], r: 4 }}
                      name={dimension}
                      connectNulls
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </Paper>
          )
        })()}

        {/* Sankey Diagram - Domain to Status Flow */}
        {sankeyData && sankeyData.nodes.length > 0 && (
          <Paper
            sx={{
              p: 3,
              mt: 3,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#1F2937',
                mb: 3,
              }}
            >
              Domain Distribution by Status
            </Typography>
            <Box sx={{ height: 500 }}>
              <ResponsiveSankey
                data={sankeyData}
                margin={{ top: 20, right: 180, bottom: 20, left: 180 }}
                align="justify"
                colors={(node: any) => node.nodeColor || '#3B82F6'}
                nodeOpacity={1}
                nodeHoverOthersOpacity={0.35}
                nodeThickness={18}
                nodeSpacing={24}
                nodeBorderWidth={0}
                nodeBorderColor={{
                  from: 'color',
                  modifiers: [['darker', 0.8]]
                }}
                nodeBorderRadius={3}
                linkOpacity={0.5}
                linkHoverOthersOpacity={0.1}
                linkContract={3}
                enableLinkGradient={true}
                label={(node: any) => {
                  const id = node.id
                  // Handle different node types
                  if (id.startsWith('date_')) {
                    return id.replace(/^date_/, '')
                  } else if (id.startsWith('domain_')) {
                    // Extract domain name from "domain_YYYY-MM-DD_DomainName"
                    // Remove "domain_" prefix (7 chars), then skip date (10 chars) and underscore (1 char)
                    const afterPrefix = id.substring(7) // Remove "domain_"
                    const domainName = afterPrefix.substring(11) // Skip "YYYY-MM-DD_"
                    return domainName
                  }
                  // Return status as is (APPROVED, REJECTED, PENDING)
                  return id
                }}
                labelPosition="outside"
                labelOrientation="horizontal"
                labelPadding={16}
                labelTextColor="#1F2937"
                theme={{
                  labels: {
                    text: {
                      fontSize: 12,
                      fontWeight: 600,
                      fill: '#1F2937'
                    }
                  },
                  tooltip: {
                    container: {
                      background: '#FFFFFF',
                      color: '#1F2937',
                      fontSize: 12,
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #E5E7EB'
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  )
}

