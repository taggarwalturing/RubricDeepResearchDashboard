import { useState, useEffect } from 'react'
import {
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Typography,
  Tooltip,
} from '@mui/material'
import {
  Sync as SyncIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as ClockIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import { triggerS3Sync, type SyncResult } from '../../services/api'

const LAST_SYNC_KEY = 'lastS3SyncTime'

export default function S3SyncButton() {
  const [syncing, setSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success')

  useEffect(() => {
    // Load last sync time from localStorage
    const lastSync = localStorage.getItem(LAST_SYNC_KEY)
    if (lastSync) {
      const lastSyncDate = new Date(parseInt(lastSync))
      setLastSyncTime(lastSyncDate)
    }
  }, [])

  useEffect(() => {
    // Update display every 30 seconds for better UX
    const interval = setInterval(() => {
      if (lastSyncTime) {
        // Force re-render to update time ago display
        setLastSyncTime(new Date(lastSyncTime))
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [lastSyncTime])

  const handleSync = async () => {
    if (syncing) return

    setSyncing(true)
    setSnackbarOpen(false)

    try {
      const result: SyncResult = await triggerS3Sync()
      
      if (result.overall_status === 'completed') {
        const now = new Date()
        setLastSyncTime(now)
        localStorage.setItem(LAST_SYNC_KEY, now.getTime().toString())

        const filesProcessed = result.s3_ingestion?.files_processed || 0
        const workItemsIngested = result.s3_ingestion?.work_items_ingested || 0
        
        setSnackbarMessage(
          `Sync completed! Processed ${filesProcessed} files, ingested ${workItemsIngested} work items.`
        )
        setSnackbarSeverity('success')
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('s3Synced'))
      } else if (result.overall_status === 'partial_failure') {
        setSnackbarMessage('Sync partially completed with some errors.')
        setSnackbarSeverity('info')
      } else {
        const errorMsg = result.s3_ingestion?.error || 'Sync failed'
        setSnackbarMessage(`Sync failed: ${errorMsg}`)
        setSnackbarSeverity('error')
      }
    } catch (error: any) {
      console.error('Sync error:', error)
      setSnackbarMessage(`Sync error: ${error.response?.data?.detail || error.message}`)
      setSnackbarSeverity('error')
    } finally {
      setSyncing(false)
      setSnackbarOpen(true)
    }
  }

  const getButtonTooltip = () => {
    if (syncing) return 'Syncing...'
    return 'Sync data from S3'
  }

  const formatLastSyncTimeUTC = () => {
    if (!lastSyncTime) return ''
    
    // Format in UTC HH:MM:SS
    const hours = String(lastSyncTime.getUTCHours()).padStart(2, '0')
    const minutes = String(lastSyncTime.getUTCMinutes()).padStart(2, '0')
    const seconds = String(lastSyncTime.getUTCSeconds()).padStart(2, '0')
    
    return `${hours}:${minutes}:${seconds}`
  }
  
  const getTimeAgoText = () => {
    if (!lastSyncTime) return 'Never synced'
    
    const now = new Date()
    const diffMs = now.getTime() - lastSyncTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) return `Synced ${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `Synced ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffMins > 0) return `Synced ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    return 'Synced just now'
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Tooltip title={getButtonTooltip()} arrow>
        <span>
          <Button
            variant="contained"
            size="small"
            startIcon={syncing ? <CircularProgress size={16} color="inherit" /> : <SyncIcon />}
            onClick={handleSync}
            disabled={syncing}
            sx={{
              backgroundColor: '#10B981',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#059669',
              },
              '&:disabled': {
                backgroundColor: '#D1D5DB',
              },
            }}
          >
            {syncing ? 'Syncing S3...' : 'Sync S3'}
          </Button>
        </span>
      </Tooltip>
      
      {lastSyncTime && (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            px: 2,
            py: 1,
            backgroundColor: '#F9FAFB',
            borderRadius: 2,
            border: '1px solid #E5E7EB',
          }}
        >
          <ClockIcon sx={{ fontSize: '1.25rem', color: '#6B7280' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#1F2937', 
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {formatLastSyncTimeUTC()}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6B7280',
                fontSize: '0.875rem',
              }}
            >
              {getTimeAgoText()}
            </Typography>
          </Box>
          <Tooltip title="Last sync time in UTC" arrow>
            <InfoIcon sx={{ fontSize: '1rem', color: '#9CA3AF', cursor: 'help' }} />
          </Tooltip>
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          icon={snackbarSeverity === 'success' ? <SuccessIcon /> : <ErrorIcon />}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

