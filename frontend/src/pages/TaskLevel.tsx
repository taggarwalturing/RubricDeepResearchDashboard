import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Pagination,
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Search, Assignment } from '@mui/icons-material'
import { getTaskLevelInfo } from '../services/api'
import type { TaskLevelInfo, FilterParams } from '../types'
import FilterPanel from '../components/FilterPanel'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorDisplay from '../components/ErrorDisplay'

export default function TaskLevel() {
  const [data, setData] = useState<TaskLevelInfo[]>([])
  const [filteredData, setFilteredData] = useState<TaskLevelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterParams>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getTaskLevelInfo(filters)
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
  }, [filters])

  useEffect(() => {
    // Filter data based on search term
    if (searchTerm) {
      const filtered = data.filter(
        (task) =>
          task.task_id?.toString().includes(searchTerm) ||
          task.annotator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.annotator_id?.toString().includes(searchTerm) ||
          task.reviewer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.reviewer_id?.toString().includes(searchTerm)
      )
      setFilteredData(filtered)
    } else {
      setFilteredData(data)
    }
    setPage(0)
  }, [searchTerm, data])

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters)
  }

  if (loading) {
    return <LoadingSpinner message="Loading task-level information..." />
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchData} />
  }

  const columns: GridColDef[] = [
    {
      field: 'task_id',
      headerName: 'Task ID',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || 'N/A'}
          color="primary"
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'annotator_name',
      headerName: 'Annotator',
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {params.row.reviewer_id || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'quality_dimensions',
      headerName: 'Quality Dimensions',
      flex: 1,
      minWidth: 400,
      renderCell: (params) => {
        const dimensions = params.value as TaskLevelInfo['quality_dimensions']
        return (
          <Box sx={{ py: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {dimensions.map((qd, index) => (
              <Chip
                key={index}
                label={`${qd.name}: ${qd.score?.toFixed(2) || qd.score_text || 'N/A'}`}
                size="small"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        )
      },
    },
  ]

  const rows = filteredData.map((task, index) => ({
    id: index,
    task_id: task.task_id,
    annotator_id: task.annotator_id,
    annotator_name: task.annotator_name,
    reviewer_id: task.reviewer_id,
    reviewer_name: task.reviewer_name,
    quality_dimensions: task.quality_dimensions,
  }))

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Task Level Information
      </Typography>

      <FilterPanel onFilterChange={handleFilterChange} />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Assignment color="primary" />
            <Typography variant="h6">Task Details</Typography>
            <Chip
              label={`${filteredData.length} tasks`}
              color="primary"
              size="small"
            />
          </Box>

          <TextField
            fullWidth
            placeholder="Search by Task ID, Annotator, Reviewer Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25, page: 0 },
                },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              getRowHeight={() => 'auto'}
              sx={{
                '& .MuiDataGrid-cell': {
                  py: 1,
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {filteredData.length === 0 && !loading && (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              No tasks found matching your criteria. Try adjusting your filters or search term.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

