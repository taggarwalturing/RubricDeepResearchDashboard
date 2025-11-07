import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Autocomplete,
  TextField,
  Chip,
  IconButton,
  Button,
  Slider,
  Popover,
  Divider,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import SortIcon from '@mui/icons-material/Sort'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import FilterListIcon from '@mui/icons-material/FilterList'
import { DataGrid, GridColDef, GridRowsProp, GridSortModel } from '@mui/x-data-grid'
import { getTrainerStats, getTaskLevelInfo, getClientDeliveryTrainerStats } from '../../services/api'
import type { TrainerLevelAggregation, TaskLevelInfo } from '../../types'
import LoadingSpinner from '../LoadingSpinner'
import ErrorDisplay from '../ErrorDisplay'

interface NumericFilter {
  min: number
  max: number
  currentRange: [number, number]
}

interface TextFilter {
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith'
  value: string
}

interface TrainerWiseProps {
  isClientDelivery?: boolean
}

export default function TrainerWise({ isClientDelivery = false }: TrainerWiseProps) {
  const [data, setData] = useState<TrainerLevelAggregation[]>([])
  const [filteredData, setFilteredData] = useState<TrainerLevelAggregation[]>([])
  const [taskLevelData, setTaskLevelData] = useState<TaskLevelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTrainers, setSelectedTrainers] = useState<string[]>([])
  const [numericFilters, setNumericFilters] = useState<Record<string, NumericFilter>>({})
  const [textFilters, setTextFilters] = useState<Record<string, TextFilter>>({})
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null)
  const [activeFilterColumn, setActiveFilterColumn] = useState<string>('')
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0,
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filters: any = {}      
      const [trainerResult, taskResult] = await Promise.all([
        isClientDelivery ? getClientDeliveryTrainerStats(filters) : getTrainerStats(filters),
        getTaskLevelInfo({}),
      ])
      setData(trainerResult)
      setFilteredData(trainerResult)
      setTaskLevelData(taskResult)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trainer statistics')
    } finally{
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [isClientDelivery])

  // Initialize numeric filters when data changes
  const initializeNumericFilters = (trainers: TrainerLevelAggregation[]) => {
    const filters: Record<string, NumericFilter> = {}

    if (trainers.length === 0) return filters

    // Initialize filter for task_score
    const taskScores = trainers
      .map(t => t.average_task_score)
      .filter(val => val !== null && val !== undefined && val !== 'N/A')
      .map(val => typeof val === 'string' ? parseFloat(val) : val)
    if (taskScores.length > 0) {
      const minScore = Math.min(...taskScores)
      const maxScore = Math.max(...taskScores)
      filters['task_score'] = { min: minScore, max: maxScore, currentRange: [minScore, maxScore] }
    }

    // Initialize filter for task_count
    const taskCounts = trainers.map(t => t.task_count).filter(val => val !== null && val !== undefined)
    if (taskCounts.length > 0) {
      const minTask = Math.min(...taskCounts)
      const maxTask = Math.max(...taskCounts)
      filters['task_count'] = { min: minTask, max: maxTask, currentRange: [minTask, maxTask] }
    }

    // Initialize filter for total_rework_count
    const totalReworkCounts = trainers.map(t => t.total_rework_count || 0).filter(val => val !== null && val !== undefined)
    if (totalReworkCounts.length > 0) {
      const minRework = Math.min(...totalReworkCounts)
      const maxRework = Math.max(...totalReworkCounts)
      filters['total_rework_count'] = { min: minRework, max: maxRework, currentRange: [minRework, maxRework] }
    }

    // Initialize filter for average_rework_count
    const avgReworkCounts = trainers.map(t => t.average_rework_count || 0).filter(val => val !== null && val !== undefined)
    if (avgReworkCounts.length > 0) {
      const minAvgRework = Math.min(...avgReworkCounts)
      const maxAvgRework = Math.max(...avgReworkCounts)
      filters['average_rework_count'] = { min: minAvgRework, max: maxAvgRework, currentRange: [minAvgRework, maxAvgRework] }
    }

    // Initialize filters for quality dimensions
    const allQualityDims = Array.from(new Set(trainers.flatMap(t => t.quality_dimensions.map(qd => qd.name))))
    
    allQualityDims.forEach(dimName => {
      const scores = trainers
        .flatMap(t => t.quality_dimensions.filter(qd => qd.name === dimName).map(qd => qd.average_score))
        .filter(val => val !== null && val !== undefined)
      
      if (scores.length > 0) {
        const minScore = Math.min(...scores)
        const maxScore = Math.max(...scores)
        filters[`qd_${dimName}`] = { min: minScore, max: maxScore, currentRange: [minScore, maxScore] }
      }
    })

    return filters
  }

  useEffect(() => {
    if (data.length > 0) {
      const initialFilters = initializeNumericFilters(data)
      setNumericFilters(initialFilters)
    }
  }, [data])

  // Apply all filters (search + text + numeric)
  useEffect(() => {
    let filtered = [...data]

    // Apply search filter (from Autocomplete)
    if (selectedTrainers.length > 0) {
      filtered = filtered.filter(trainer => {
        const name = trainer.trainer_name || `ID: ${trainer.trainer_id}`
        const email = trainer.trainer_email ? ` (${trainer.trainer_email})` : ''
        const fullOption = `${name}${email}`
        return selectedTrainers.includes(fullOption)
      })
    }

    // Apply text filters
    Object.entries(textFilters).forEach(([key, filter]) => {
      if (filter.value.trim()) {
        filtered = filtered.filter((trainer) => {
          let fieldValue: string = ''

          if (key === 'trainer_name') {
            fieldValue = trainer.trainer_name || `ID: ${trainer.trainer_id}`
          } else if (key === 'trainer_email') {
            fieldValue = trainer.trainer_email || ''
          }

          const searchValue = filter.value.toLowerCase()
          const targetValue = fieldValue.toLowerCase()

          switch (filter.operator) {
            case 'contains':
              return targetValue.includes(searchValue)
            case 'equals':
              return targetValue === searchValue
            case 'startsWith':
              return targetValue.startsWith(searchValue)
            case 'endsWith':
              return targetValue.endsWith(searchValue)
            default:
              return true
          }
        })
      }
    })

    // Apply numeric range filters (only if actively modified)
    Object.entries(numericFilters).forEach(([key, filter]) => {
      const isFilterActive = filter.currentRange[0] !== filter.min || filter.currentRange[1] !== filter.max

      if (isFilterActive) {
        filtered = filtered.filter((trainer) => {
          let value: number | null = null

          if (key === 'task_score') {
            // Handle task_score - convert from string if needed
            const taskScore = trainer.average_task_score
            if (taskScore !== null && taskScore !== undefined && taskScore !== 'N/A') {
              value = typeof taskScore === 'string' ? parseFloat(taskScore) : taskScore
            }
          } else if (key === 'task_count') {
            value = trainer.task_count
          } else if (key.startsWith('qd_')) {
            const dimName = key.substring(3)
            const qd = trainer.quality_dimensions.find(q => q.name === dimName)
            value = qd ? qd.average_score : null
          }

          if (value === null || value === undefined || isNaN(value)) return false
          return value >= filter.currentRange[0] && value <= filter.currentRange[1]
        })
      }
    })

    setFilteredData(filtered)
    setPaginationModel({ ...paginationModel, page: 0 })
  }, [selectedTrainers, textFilters, numericFilters, data])

  // Get unique trainer names for autocomplete
  // Create search options including name and email
  const trainerOptions = data.map(t => {
    const name = t.trainer_name || `ID: ${t.trainer_id}`
    const email = t.trainer_email ? ` (${t.trainer_email})` : ''
    return `${name}${email}`
  })

  if (loading) {
    return <LoadingSpinner message="Loading trainer statistics..." />
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchData} />
  }

  // Get all unique quality dimension names
  const allQualityDimensionNames = Array.from(
    new Set(
      filteredData.flatMap((trainer) => trainer.quality_dimensions.map((qd) => qd.name))
    )
  ).sort()

  // Helper functions for filters
  const resetNumericFilter = (columnKey: string) => {
    setNumericFilters(prev => {
      if (!prev[columnKey]) return prev
      return {
        ...prev,
        [columnKey]: {
          ...prev[columnKey],
          currentRange: [prev[columnKey].min, prev[columnKey].max]
        }
      }
    })
  }

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortModel([{ field, sort: direction }])
    setFilterAnchorEl(null)
    setActiveFilterColumn('')
  }

  // Custom header renderer with dropdown arrow
  const renderHeaderWithDropdown = (headerName: string, isNumeric: boolean = false, fieldKey: string = '') => (params: any) => {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '100%',
          gap: 0.5,
          py: 1,
        }}
      >
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            if (fieldKey) {
              setFilterAnchorEl(e.currentTarget)
              setActiveFilterColumn(fieldKey)
            } else {
              const button = e.currentTarget.closest('.MuiDataGrid-columnHeader')?.querySelector('.MuiDataGrid-menuIcon button') as HTMLButtonElement
              if (button) button.click()
            }
          }}
          sx={{
            padding: 0,
            minWidth: 'auto',
            color: '#6B7280',
            '&:hover': {
              color: '#374151',
              backgroundColor: 'transparent',
            },
          }}
        >
          <ArrowDropDownIcon fontSize="small" />
        </IconButton>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            overflow: 'visible',
          }}
        >
          {headerName}
        </Typography>
      </Box>
    )
  };

  // Calculate column width based on content - exact fit
  const calculateColumnWidth = (headerName: string, data: any[], fieldName: string) => {
    // Calculate header width (including dropdown arrow icon)
    const headerWidth = headerName.length * 9 + 50
    
    // Calculate max content width
    let maxContentWidth = headerWidth
    if (data.length > 0) {
      const contentLengths = data.map(row => {
        const value = row[fieldName]
        return String(value || '').length * 8.5 + 16
      })
      maxContentWidth = Math.max(headerWidth, ...contentLengths)
    }
    
    // Return exact width needed (no artificial max cap)
    return Math.max(maxContentWidth, 100)
  }

  // Build columns
  const columns: GridColDef[] = [
    {
      field: 'trainer_name',
      headerName: 'Trainer',
      width: calculateColumnWidth('Trainer', filteredData, 'trainer_name'),
      align: 'center' as const,
      headerAlign: 'left' as const,
      renderHeader: renderHeaderWithDropdown('Trainer', false, 'trainer_name'),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
            {params.value || 'Unknown'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            ID: {params.row.trainer_id || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'trainer_email',
      headerName: 'Trainer Email',
      width: Math.max(calculateColumnWidth('Trainer Email', filteredData, 'trainer_email'), 200),
      align: 'center' as const,
      headerAlign: 'left' as const,
      renderHeader: renderHeaderWithDropdown('Trainer Email', false, 'trainer_email'),
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: '#1F2937', textAlign: 'center', width: '100%', fontSize: '0.875rem' }}>
          {params.value || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'task_score',
      headerName: 'Task Score',
      width: calculateColumnWidth('Task Score', filteredData, 'task_score'),
      type: 'number',
      align: 'center' as const,
      headerAlign: 'left' as const,
      renderHeader: renderHeaderWithDropdown('Task Score', true, 'task_score'),
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937', textAlign: 'center', width: '100%' }}>
          {params.value !== null && params.value !== undefined ? params.value : 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'task_count',
      headerName: 'Total Tasks',
      width: calculateColumnWidth('Total Tasks', filteredData, 'task_count'),
      type: 'number',
      align: 'center' as const,
      headerAlign: 'left' as const,
      renderHeader: renderHeaderWithDropdown('Total Tasks', true, 'task_count'),
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937', textAlign: 'center', width: '100%' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'total_rework_count',
      headerName: 'Total Reworks',
      width: calculateColumnWidth('Total Reworks', filteredData, 'total_rework_count'),
      type: 'number',
      align: 'center' as const,
      headerAlign: 'left' as const,
      renderHeader: renderHeaderWithDropdown('Total Reworks', true, 'total_rework_count'),
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937', textAlign: 'center', width: '100%' }}>
          {params.value || 0}
        </Typography>
      ),
    },
    {
      field: 'average_rework_count',
      headerName: 'Avg Rework',
      width: calculateColumnWidth('Avg Rework', filteredData, 'average_rework_count'),
      type: 'number',
      align: 'center' as const,
      headerAlign: 'left' as const,
      renderHeader: renderHeaderWithDropdown('Avg Rework', true, 'average_rework_count'),
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937', textAlign: 'center', width: '100%' }}>
          {params.value !== null && params.value !== undefined ? params.value.toFixed(2) : '0.00'}
        </Typography>
      ),
    },
    ...allQualityDimensionNames.map((dimName) => ({
      field: `qd_${dimName}`,
      headerName: dimName,
      width: Math.max(dimName.length * 9 + 50, 100),
      align: 'center' as const,
      headerAlign: 'left' as const,
      sortable: true,
      filterable: true,
      renderHeader: renderHeaderWithDropdown(dimName, true, `qd_${dimName}`),
      renderCell: (params: any) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: params.value !== 'N/A' ? '#1F2937' : 'text.secondary',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {params.value}
        </Typography>
      ),
    })),
  ]

  // Check if any filters are active
  const hasActiveFilters = () => {
    // Check text filters (with safety check)
    const hasTextFilters = textFilters && Object.values(textFilters).some(filter => filter.value.trim() !== '')
    
    // Check numeric filters (with safety check)
    const hasNumericFilters = numericFilters && Object.values(numericFilters).some(filter =>
      filter.currentRange[0] !== filter.min || filter.currentRange[1] !== filter.max
    )
    
    return hasTextFilters || hasNumericFilters
  }

  // Build rows
  const rows: GridRowsProp = filteredData.map((trainer, index) => {
    const row: any = {
      id: index,
      trainer_name: trainer.trainer_name,
      trainer_id: trainer.trainer_id,
      trainer_email: trainer.trainer_email,
      task_score: trainer.average_task_score?.toFixed(2) || 'N/A',
      task_count: trainer.task_count,
      total_rework_count: trainer.total_rework_count || 0,
      average_rework_count: trainer.average_rework_count || 0,
    }
    
    allQualityDimensionNames.forEach((dimName) => {
      const qd = trainer.quality_dimensions.find(q => q.name === dimName)
      row[`qd_${dimName}`] = qd?.average_score?.toFixed(2) || 'N/A'
    })
    
    return row
  })

  // Detail panel content (expandable rows)
  const getDetailPanelContent = ({ row }: any) => {
    const trainer = filteredData[row.id]
    
    // Get reviewer data for this trainer
    const reviewerData = taskLevelData
      .filter((task) => task.annotator_id === trainer.trainer_id)
      .reduce((acc, task) => {
        const reviewerId = task.reviewer_id
        if (!reviewerId) return acc

        if (!acc[reviewerId]) {
          acc[reviewerId] = {
            reviewer_id: reviewerId,
            reviewer_name: task.reviewer_name,
            tasks: 0,
            qualityDimensions: {} as Record<string, { total: number; count: number }>,
          }
        }

        acc[reviewerId].tasks += 1

        // Aggregate quality dimensions
        Object.entries(task.quality_dimensions).forEach(([dimName, score]) => {
          if (score !== null && score !== undefined) {
            if (!acc[reviewerId].qualityDimensions[dimName]) {
              acc[reviewerId].qualityDimensions[dimName] = { total: 0, count: 0 }
            }
            acc[reviewerId].qualityDimensions[dimName].total += score
            acc[reviewerId].qualityDimensions[dimName].count += 1
          }
        })

        return acc
      }, {} as Record<number, any>)

    const reviewers = Object.values(reviewerData)

    return (
      <Box sx={{ margin: 2, backgroundColor: '#F7F7F7', p: 2, borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 600, mb: 2 }}>
          Reviewer Details
        </Typography>
        {reviewers.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No reviewer data available for this trainer.
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#EAEDED' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Reviewer</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Total Tasks
                  </TableCell>
                  {allQualityDimensionNames.map((dimName) => (
                    <TableCell
                      key={dimName}
                      align="right"
                      sx={{ fontWeight: 600, minWidth: 150 }}
                    >
                      {dimName}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {reviewers.map((reviewer: any) => (
                  <TableRow key={reviewer.reviewer_id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {reviewer.reviewer_name || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {reviewer.reviewer_id}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {reviewer.tasks}
                    </TableCell>
                    {allQualityDimensionNames.map((dimName) => {
                      const dim = reviewer.qualityDimensions[dimName]
                      const avgScore = dim
                        ? (dim.total / dim.count).toFixed(2)
                        : 'N/A'
                      return (
                        <TableCell
                          key={dimName}
                          align="right"
                          sx={{ color: '#2563EB', fontWeight: 600 }}
                        >
                          {avgScore}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Box>
    )
  }

  const getDetailPanelHeight = () => 'auto' as const

  return (
    <Box>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, backgroundColor: '#F7F7F7', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1 }}>
            <Autocomplete
            multiple
            options={trainerOptions}
            value={selectedTrainers}
            onChange={(event, newValue) => setSelectedTrainers(newValue)}
            filterOptions={(options, { inputValue }) => {
              // Custom filter to search in entire option string (includes email)
              const searchTerm = inputValue.toLowerCase()
              return options.filter(option => 
                option.toLowerCase().includes(searchTerm)
              )
            }}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props
              return (
                <li 
                  {...otherProps} 
                  key={key || option}
                  style={{ 
                    padding: 0,
                    display: 'block',
                    width: '100%',
                  }}
                >
                  <Typography
                    sx={{
                      padding: '8px 12px',
                      fontSize: '12px',
                      display: 'block',
                      width: '100%',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                    }}
                  >
                    {option}
                  </Typography>
                </li>
              )
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Search and select trainers..."
                size="small"
                sx={{ 
                  backgroundColor: 'white',
                  '& .MuiInputBase-input': {
                    fontSize: '12px',
                  }
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                  size="small"
                  sx={{
                    backgroundColor: '#E5E7EB',
                    color: '#374151',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    '& .MuiChip-label': {
                      fontSize: '0.75rem',
                      px: 1,
                    },
                    '& .MuiChip-deleteIcon': {
                      color: '#6B7280',
                      fontSize: '0.9rem',
                      '&:hover': {
                        color: '#374151',
                      },
                    },
                  }}
                />
              ))
            }
            sx={{
              '& .MuiAutocomplete-tag': {
                margin: '2px',
              },
              '& .MuiAutocomplete-option': {
                fontSize: '12px',
                padding: '0 !important',
                minHeight: '40px',
              },
            }}
          />
          </Box>
          
          {/* Individual Filter Chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {/* Text Filters */}
            {textFilters && Object.entries(textFilters).map(([key, filter]) => {
              if (!filter.value.trim()) return null
              const columnName = key === 'trainer_name' ? 'Trainer' : 
                               key === 'trainer_email' ? 'Trainer Email' : key
              return (
                <Chip
                  key={`text-${key}`}
                  label={`${columnName}: ${filter.value}`}
                  size="small"
                  onDelete={() => {
                    const newFilters = { ...textFilters }
                    delete newFilters[key]
                    setTextFilters(newFilters)
                  }}
                  sx={{
                    backgroundColor: '#EEF2FF',
                    color: '#2E5CFF',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    '& .MuiChip-deleteIcon': {
                      color: '#2E5CFF',
                      '&:hover': {
                        color: '#1E40AF',
                      },
                    },
                  }}
                />
              )
            })}
            
            {/* Numeric Filters */}
            {numericFilters && Object.entries(numericFilters).map(([key, filter]) => {
              const isActive = filter.currentRange[0] !== filter.min || filter.currentRange[1] !== filter.max
              if (!isActive) return null
              
              let columnName = key
              if (key === 'task_count') {
                columnName = 'Total Tasks'
              } else if (key === 'task_score') {
                columnName = 'Task Score'
              } else if (key.startsWith('qd_')) {
                columnName = key.substring(3)
              }
              
              const displayValue = `${filter.currentRange[0]}-${filter.currentRange[1]}`
              
              return (
                <Chip
                  key={`numeric-${key}`}
                  label={`${columnName}: ${displayValue}`}
                  size="small"
                  onDelete={() => {
                    const newFilters = { ...numericFilters }
                    newFilters[key] = {
                      ...filter,
                      currentRange: [filter.min, filter.max]
                    }
                    setNumericFilters(newFilters)
                  }}
                  sx={{
                    backgroundColor: '#EEF2FF',
                    color: '#2E5CFF',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    '& .MuiChip-deleteIcon': {
                      color: '#2E5CFF',
                      '&:hover': {
                        color: '#1E40AF',
                      },
                    },
                  }}
                />
              )
            })}
            
            {/* Search Selection Chips */}
            {selectedTrainers.length > 0 && selectedTrainers.map((trainer, index) => (
              <Chip
                key={`search-${index}`}
                label={`Selected: ${trainer}`}
                size="small"
                onDelete={() => {
                  setSelectedTrainers(prev => prev.filter((_, i) => i !== index))
                }}
                sx={{
                  backgroundColor: '#F3F4F6',
                  color: '#1F2937',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  '& .MuiChip-deleteIcon': {
                    color: '#6B7280',
                    '&:hover': {
                      color: '#1F2937',
                    },
                  },
                }}
              />
            ))}
            
            {/* Clear All Button */}
            {hasActiveFilters() && (
              <Chip
                icon={<FilterListIcon />}
                label="Clear All"
                size="small"
                onClick={() => {
                  setSelectedTrainers([])
                  setTextFilters({})
                  const resetFilters = initializeNumericFilters(data)
                  setNumericFilters(resetFilters)
                  setSortModel([])                }}
                sx={{
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  '& .MuiChip-icon': {
                    color: '#DC2626',
                  },
                  '&:hover': {
                    backgroundColor: '#FECACA',
                  },
                }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50, 100]}
            disableRowSelectionOnClick
            disableColumnMenu={true}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            getDetailPanelContent={getDetailPanelContent}
            getDetailPanelHeight={getDetailPanelHeight}
            sx={{
              border: 'none',
              backgroundColor: 'white',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #E5E7EB',
                color: '#111827',
                fontSize: '0.875rem',
                paddingX: 1.5,
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
                minHeight: '48px !important',
                maxHeight: '48px !important',
              },
              '& .MuiDataGrid-columnHeader': {
                cursor: 'pointer',
                paddingX: 1.5,
                '&:hover': {
                  backgroundColor: '#F3F4F6',
                },
                '&:focus': {
                  outline: 'none',
                },
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 600,
                fontSize: '0.75rem',
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              },
              '& .MuiDataGrid-columnSeparator': {
                display: 'none',
              },
              '& .MuiDataGrid-menuIcon': {
                visibility: 'hidden',
                width: 0,
                opacity: 0,
              },
              '& .MuiDataGrid-iconButtonContainer': {
                visibility: 'hidden',
                width: 0,
              },
              '& .MuiDataGrid-row': {
                '&:hover': {
                  backgroundColor: '#F9FAFB',
                },
                '&:last-child .MuiDataGrid-cell': {
                  borderBottom: 'none',
                },
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid #E5E7EB',
                backgroundColor: '#F9FAFB',
              },
              '& .MuiDataGrid-sortIcon': {
                display: 'none',
              },
            }}
          />
        </Box>
      </Paper>

      {/* Filter Popover */}
      <Popover
        open={Boolean(filterAnchorEl) && Boolean(activeFilterColumn)}
        anchorEl={filterAnchorEl}
        onClose={() => {
          setFilterAnchorEl(null)
          setActiveFilterColumn('')
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              borderRadius: 2,
            }
          }
        }}
      >
        {activeFilterColumn && (
          <Box sx={{ minWidth: 320 }}>
            {/* Sort Options - Show for all columns */}
            <Box sx={{ p: 2 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 1.5, 
                  color: '#1F2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <SortIcon fontSize="small" />
                Sort
              </Typography>
              
              <MenuItem
                onClick={() => handleSort(activeFilterColumn.startsWith('qd_') ? activeFilterColumn : activeFilterColumn, 'asc')}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemIcon>
                  <ArrowUpwardIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Sort Ascending</ListItemText>
              </MenuItem>
              
              <MenuItem
                onClick={() => handleSort(activeFilterColumn.startsWith('qd_') ? activeFilterColumn : activeFilterColumn, 'desc')}
                sx={{ borderRadius: 1 }}
              >
                <ListItemIcon>
                  <ArrowDownwardIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Sort Descending</ListItemText>
              </MenuItem>
            </Box>

            {/* Text Filter - Show for trainer_name and trainer_email columns */}
            {(activeFilterColumn === 'trainer_name' || activeFilterColumn === 'trainer_email') && (
              <>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 1.5, 
                      color: '#1F2937',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <FilterListIcon fontSize="small" />
                    Filter
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Operator</InputLabel>
                      <Select
                        value={textFilters[activeFilterColumn]?.operator || 'contains'}
                        label="Operator"
                        onChange={(e) => {
                          setTextFilters(prev => ({
                            ...prev,
                            [activeFilterColumn]: {
                              ...prev[activeFilterColumn],
                              operator: e.target.value as any,
                              value: prev[activeFilterColumn]?.value || ''
                            }
                          }))
                        }}
                      >
                        <MenuItem value="contains">Contains</MenuItem>
                        <MenuItem value="equals">Equals</MenuItem>
                        <MenuItem value="startsWith">Starts With</MenuItem>
                        <MenuItem value="endsWith">Ends With</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      size="small"
                      label="Filter Value"
                      value={textFilters[activeFilterColumn]?.value || ''}
                      onChange={(e) => {
                        setTextFilters(prev => ({
                          ...prev,
                          [activeFilterColumn]: {
                            operator: prev[activeFilterColumn]?.operator || 'contains',
                            value: e.target.value
                          }
                        }))
                      }}
                      placeholder="Enter filter value..."
                    />
                  </Box>
                </Box>
              </>
            )}

            {/* Filter Range - Only show for numeric columns */}
            {numericFilters[activeFilterColumn] && (
              <>
                <Divider />
                <Box sx={{ p: 3 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 2, 
                      color: '#1F2937',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <FilterListIcon fontSize="small" />
                    Filter Range
                  </Typography>
                  
                  <Slider
                    value={numericFilters[activeFilterColumn].currentRange}
                    onChange={(_, newValue) => {
                      setNumericFilters(prev => ({
                        ...prev,
                        [activeFilterColumn]: {
                          ...prev[activeFilterColumn],
                          currentRange: newValue as [number, number]
                        }
                      }))
                    }}
                    valueLabelDisplay="on"
                    min={numericFilters[activeFilterColumn].min}
                    max={numericFilters[activeFilterColumn].max}
                    step={activeFilterColumn === 'task_count' ? 1 : 0.01}
                    valueLabelFormat={(value) => 
                      activeFilterColumn === 'task_count' ? value.toString() : value.toFixed(2)
                    }
                    sx={{
                      color: '#2E5CFF',
                      '& .MuiSlider-thumb': {
                        backgroundColor: '#2E5CFF',
                      },
                      '& .MuiSlider-track': {
                        backgroundColor: '#2E5CFF',
                      },
                      '& .MuiSlider-rail': {
                        backgroundColor: '#E5E7EB',
                      },
                      '& .MuiSlider-valueLabel': {
                        backgroundColor: '#2E5CFF',
                        borderRadius: 1,
                        padding: '4px 8px',
                      },
                    }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      Min: {activeFilterColumn === 'task_count' 
                        ? numericFilters[activeFilterColumn].min 
                        : numericFilters[activeFilterColumn].min.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      Max: {activeFilterColumn === 'task_count' 
                        ? numericFilters[activeFilterColumn].max 
                        : numericFilters[activeFilterColumn].max.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}

            <Divider />

            {/* Action Buttons */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  // Reset numeric filter if exists
                  if (numericFilters[activeFilterColumn]) {
                    resetNumericFilter(activeFilterColumn)
                  }
                  // Reset text filter if exists
                  if (textFilters[activeFilterColumn]) {
                    setTextFilters(prev => {
                      const newFilters = { ...prev }
                      delete newFilters[activeFilterColumn]
                      return newFilters
                    })
                  }
                  // Reset sort
                  setSortModel([])
                }}
                sx={{
                  color: '#6B7280',
                  borderColor: '#D1D5DB',
                  '&:hover': {
                    borderColor: '#9CA3AF',
                    backgroundColor: '#F9FAFB',
                  },
                }}
              >
                Reset All
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setFilterAnchorEl(null)
                  setActiveFilterColumn('')
                }}
                sx={{
                  backgroundColor: '#2E5CFF',
                  '&:hover': {
                    backgroundColor: '#2347D5',
                  },
                }}
              >
                Apply
              </Button>
            </Box>
          </Box>
        )}
      </Popover>
    </Box>
  )
}
