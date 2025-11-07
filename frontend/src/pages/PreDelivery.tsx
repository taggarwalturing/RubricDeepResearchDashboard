import { useState, useEffect } from 'react'
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  Card,
  CircularProgress,
  Chip,
} from '@mui/material'
import {
  Business as BusinessIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  VerifiedUser as CalibratorIcon,
  Assignment as AssignmentIcon,
  RateReview as ReviewIcon,
  Category as CategoryIcon,
  Public as DomainIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material'
import DomainWise from '../components/predelivery/DomainWise'
import TrainerWise from '../components/predelivery/TrainerWise'
import ReviewerWise from '../components/predelivery/ReviewerWise'
import TaskWise from '../components/predelivery/TaskWise'
import { getOverallStats, getDomainStats } from '../services/api'
import type { OverallAggregation, DomainAggregation } from '../types'
import axios from 'axios'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`predelivery-tabpanel-${index}`}
      aria-labelledby={`predelivery-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: string
}

function SummaryCard({ title, value, icon, color }: SummaryCardProps) {
  return (
    <Card
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        border: `1px solid #E5E7EB`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 2,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 2px 8px rgba(0, 0, 0, 0.08)`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            fontWeight: 600, 
            fontSize: '0.75rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px' 
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            backgroundColor: `${color}10`,
            borderRadius: 1.5,
            p: 0.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            '& svg': {
              fontSize: '1.1rem',
            },
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 700, 
          color: '#1F2937',
          fontSize: '1.75rem',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
    </Card>
  )
}

interface SyncInfo {
  current_utc_time: string
  last_sync_time: string | null
  last_sync_type: string | null
}

export default function PreDelivery() {
  const [activeTab, setActiveTab] = useState(0)
  const [overallData, setOverallData] = useState<OverallAggregation | null>(null)
  const [domainData, setDomainData] = useState<DomainAggregation[]>([])
  const [syncInfo, setSyncInfo] = useState<SyncInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [overall, domains, sync] = await Promise.all([
          getOverallStats(),
          getDomainStats(),
          axios.get(`${import.meta.env.VITE_API_URL || ''}/api/sync-info`)
        ])
        setOverallData(overall)
        setDomainData(domains)
        setSyncInfo(sync.data)
      } catch (error) {
        console.error('Failed to fetch pre-delivery summary data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    
    // Update current time every second
    const interval = setInterval(() => {
      setSyncInfo(prev => prev ? {
        ...prev,
        current_utc_time: new Date().toISOString()
      } : null)
    }, 1000) // Update every second
    
    return () => clearInterval(interval)
  }, [])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'N/A'
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    })
  }

  const getRelativeTime = (isoString: string | null) => {
    if (!isoString) return 'N/A'
    const now = new Date()
    const past = new Date(isoString)
    const diffMs = now.getTime() - past.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `Synced ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffMinutes > 0) {
      return `Synced ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    } else {
      return 'Synced just now'
    }
  }

  return (
    <Box>
      {/* Description and Sync Info */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#6B7280',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            flex: 1,
            minWidth: '200px',
          }}
        >
          Comprehensive overview of delivery metrics and performance indicators
        </Typography>
        
        {/* Sync Information */}
        {syncInfo && (
          <Chip
            icon={<AccessTimeIcon />}
            label={`${formatTime(syncInfo.current_utc_time)} ${getRelativeTime(syncInfo.last_sync_time)}`}
            sx={{
              height: 'auto',
              py: 1,
              px: 2,
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              fontSize: '0.875rem',
              '& .MuiChip-icon': { 
                color: '#6B7280',
                marginLeft: 1,
              },
            }}
          />
        )}
      </Box>

      {/* Summary Cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={40} thickness={4} />
        </Box>
      ) : overallData && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <SummaryCard
              title="Total Tasks"
              value={overallData.task_count.toLocaleString()}
              icon={<AssignmentIcon />}
              color="#6B7280"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <SummaryCard
              title="Total Trainers"
              value={overallData.trainer_count.toLocaleString()}
              icon={<SchoolIcon />}
              color="#3B82F6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <SummaryCard
              title="Total Reviewers"
              value={overallData.reviewer_count.toLocaleString()}
              icon={<ReviewIcon />}
              color="#8B5CF6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <SummaryCard
              title="Total Domains"
              value={overallData.domain_count.toLocaleString()}
              icon={<DomainIcon />}
              color="#f39c12"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <SummaryCard
              title="Quality Dimensions"
              value={overallData.quality_dimensions.length.toLocaleString()}
              icon={<CategoryIcon />}
              color="#2ecc71"
            />
          </Grid>
        </Grid>
      )}

      <Box 
        sx={{ 
          borderBottom: '1px solid #E5E7EB',
          backgroundColor: 'white',
          borderRadius: '8px 8px 0 0',
          px: 0,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="pre-delivery tabs"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '0.9375rem',
              fontWeight: 500,
              minHeight: 48,
              px: 3,
              color: '#6B7280',
              transition: 'color 0.2s ease',
              '&.Mui-selected': {
                color: '#f39c12',
                fontWeight: 600,
              },
              '&:hover': {
                color: '#374151',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#f39c12',
              height: 2,
            },
          }}
        >
          <Tab
            icon={<BusinessIcon />}
            iconPosition="start"
            label="Domain wise"
            id="predelivery-tab-0"
            aria-controls="predelivery-tabpanel-0"
          />
          <Tab
            icon={<SchoolIcon />}
            iconPosition="start"
            label="Trainer wise"
            id="predelivery-tab-1"
            aria-controls="predelivery-tabpanel-1"
          />
          <Tab
            icon={<TrophyIcon />}
            iconPosition="start"
            label="Reviewer wise"
            id="predelivery-tab-2"
            aria-controls="predelivery-tabpanel-2"
          />
          <Tab
            icon={<CalibratorIcon />}
            iconPosition="start"
            label="Task wise"
            id="predelivery-tab-3"
            aria-controls="predelivery-tabpanel-3"
          />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <DomainWise />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <TrainerWise />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <ReviewerWise />
      </TabPanel>
      <TabPanel value={activeTab} index={3}>
        <TaskWise />
      </TabPanel>
    </Box>
  )
}

