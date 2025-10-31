import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { VerifiedUser as CalibratorIcon, Search } from '@mui/icons-material'
import { getTaskLevelInfo } from '../../services/api'
import type { TaskLevelInfo } from '../../types'
import LoadingSpinner from '../LoadingSpinner'
import ErrorDisplay from '../ErrorDisplay'

export default function TaskWise() {
  const [data, setData] = useState<TaskLevelInfo[]>([])
  const [filteredData, setFilteredData] = useState<TaskLevelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0,
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getTaskLevelInfo({})
      setData(result)
      setFilteredData(result)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch task-level information')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = data.filter(
        (task) =>
          task.task_id?.toString().includes(searchTerm) ||
          task.annotator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.reviewer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    } else {
      setFilteredData(data)
    }
    setPaginationModel({ ...paginationModel, page: 0 })
  }, [searchTerm, data])

  if (loading) {
    return <LoadingSpinner message="Loading task details..." />
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchData} />
  }

  // Get all unique quality dimension names from ALL tasks
  const allQualityDimensionNames = Array.from(
    new Set(
      filteredData.flatMap((task) => task.quality_dimensions.map((qd) => qd.name))
    )
  ).sort()

  // Build dynamic columns
  const columns: GridColDef[] = [
    {
      field: 'task_id',
      headerName: 'Task ID',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || 'N/A'}
          size="small"
          variant="outlined"
          sx={{
            borderColor: '#E5E7EB',
            color: '#1F2937',
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      field: 'annotator_name',
      headerName: 'Annotator',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#1F2937' }}>
            {params.value || 'Unknown'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {params.row.annotator_id || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'reviewer_name',
      headerName: 'Reviewer',
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#1F2937' }}>
            {params.value || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {params.row.reviewer_id || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    // Dynamic quality dimension columns
    ...allQualityDimensionNames.map((dimName) => ({
      field: `qd_${dimName}`,
      headerName: dimName,
      minWidth: 200,
      flex: 1,
      align: 'right' as const,
      headerAlign: 'right' as const,
      sortable: true,
      filterable: true,
      renderHeader: (params: any) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            width: '100%',
            whiteSpace: 'normal',
            lineHeight: '1.2',
            py: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              textAlign: 'right',
              wordWrap: 'break-word',
            }}
          >
            {dimName}
          </Typography>
        </Box>
      ),
      renderCell: (params: any) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: params.value !== 'N/A' ? '#1F2937' : 'text.secondary',
          }}
        >
          {params.value}
        </Typography>
      ),
    })),
  ]

  // Build rows with quality dimensions as separate fields
  const rows = filteredData.map((task, index) => {
    const row: any = {
      id: index,
      task_id: task.task_id,
      annotator_id: task.annotator_id,
      annotator_name: task.annotator_name,
      reviewer_id: task.reviewer_id,
      reviewer_name: task.reviewer_name,
    }
    
    // Add each quality dimension as a separate field
    const taskQDMap = new Map(
      task.quality_dimensions.map((qd) => [qd.name, qd])
    )
    
    allQualityDimensionNames.forEach((dimName) => {
      const qd = taskQDMap.get(dimName)
      row[`qd_${dimName}`] = qd?.score?.toFixed(2) || qd?.score_text || 'N/A'
    })
    
    return row
  })

  return (
    <Box>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, backgroundColor: '#F7F7F7' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by Task ID, Annotator, or Reviewer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ backgroundColor: 'white' }}
          />
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50]}
            disableRowSelectionOnClick
            disableColumnFilter={false}
            disableColumnMenu={false}
            sortingOrder={['asc', 'desc']}
            pinnedColumns={{ left: ['task_id', 'annotator_name'] }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #E2E8F0',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#F8FAFC',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#F9FAFB',
              },
              '& .MuiDataGrid-columnHeader': {
                '&:hover': {
                  '& .MuiDataGrid-menuIcon': {
                    opacity: 1,
                  },
                },
              },
              '& .MuiDataGrid-menuIcon': {
                opacity: 0.5,
              },
              '& .MuiDataGrid-sortIcon': {
                opacity: 0.7,
                color: '#4F7DF3',
              },
              '& .MuiDataGrid-pinnedColumnHeaders': {
                backgroundColor: '#F8FAFC',
                boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)',
              },
              '& .MuiDataGrid-pinnedColumns': {
                boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)',
                backgroundColor: 'white',
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  )
}
