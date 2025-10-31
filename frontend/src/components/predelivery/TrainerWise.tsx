import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Collapse,
  TableSortLabel,
} from '@mui/material'
import {
  School as SchoolIcon,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material'
import { getTrainerStats, getTaskLevelInfo } from '../../services/api'
import type { TrainerLevelAggregation, TaskLevelInfo } from '../../types'
import LoadingSpinner from '../LoadingSpinner'
import ErrorDisplay from '../ErrorDisplay'

type Order = 'asc' | 'desc'

interface TrainerRowProps {
  trainer: TrainerLevelAggregation
  taskLevelData: TaskLevelInfo[]
  allQualityDimensionNames: string[]
}

function TrainerRow({ trainer, taskLevelData, allQualityDimensionNames }: TrainerRowProps) {
  const [open, setOpen] = useState(false)

  // Create a map of trainer's quality dimensions for quick lookup
  const trainerQDMap = new Map(
    trainer.quality_dimensions.map((qd) => [qd.name, qd])
  )

  // Get reviewer data for this trainer
  const reviewerData = taskLevelData
    .filter((task) => task.annotator_id === trainer.trainer_level_id)
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
      task.quality_dimensions.forEach((qd) => {
        if (qd.score !== null) {
          if (!acc[reviewerId].qualityDimensions[qd.name]) {
            acc[reviewerId].qualityDimensions[qd.name] = { total: 0, count: 0 }
          }
          acc[reviewerId].qualityDimensions[qd.name].total += qd.score
          acc[reviewerId].qualityDimensions[qd.name].count += 1
        }
      })

      return acc
    }, {} as Record<number, any>)

  const reviewers = Object.values(reviewerData)

  return (
    <>
      <TableRow
        sx={{
          '&:hover': { backgroundColor: '#F9FAFB' },
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <TableCell
          sx={{
            position: 'sticky',
            left: 0,
            backgroundColor: 'white',
            zIndex: 2,
          }}
        >
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell 
          sx={{ 
            fontWeight: 500,
            position: 'sticky',
            left: 50,
            backgroundColor: 'white',
            zIndex: 2,
            borderRight: '2px solid #E2E8F0',
          }}
        >
          {trainer.trainer_name || `ID: ${trainer.trainer_level_id}` || 'Unknown'}
        </TableCell>
        <TableCell align="right" sx={{ fontWeight: 600 }}>{trainer.conversation_count}</TableCell>
        {/* Quality dimension average scores - display ALL dimensions in order */}
        {allQualityDimensionNames.map((dimName, idx) => {
          const qd = trainerQDMap.get(dimName)
          return (
            <TableCell key={idx} align="right" sx={{ color: '#1F2937', fontWeight: 600 }}>
              {qd?.average_score?.toFixed(2) || 'N/A'}
            </TableCell>
          )
        })}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3 + allQualityDimensionNames.length}>
          <Collapse in={open} timeout="auto" unmountOnExit>
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
                        {/* Dynamic quality dimension columns - use ALL dimensions */}
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
                      {reviewers.map((reviewer) => (
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
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

export default function TrainerWise() {
  const [data, setData] = useState<TrainerLevelAggregation[]>([])
  const [taskLevelData, setTaskLevelData] = useState<TaskLevelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [orderBy, setOrderBy] = useState<string>('trainer_name')
  const [order, setOrder] = useState<Order>('asc')

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [trainerResult, taskResult] = await Promise.all([
        getTrainerStats({}),
        getTaskLevelInfo({}),
      ])
      setData(trainerResult)
      setTaskLevelData(taskResult)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trainer statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return <LoadingSpinner message="Loading trainer statistics..." />
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchData} />
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  // Get all unique quality dimension names from ALL trainers (not just first one)
  const allQualityDimensionNames = Array.from(
    new Set(
      data.flatMap((trainer) => trainer.quality_dimensions.map((qd) => qd.name))
    )
  ).sort()

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (orderBy === 'trainer_name') {
      const compareValue = (a.trainer_name || `ID: ${a.trainer_level_id}`).localeCompare(
        b.trainer_name || `ID: ${b.trainer_level_id}`
      )
      return order === 'asc' ? compareValue : -compareValue
    } else if (orderBy === 'conversation_count') {
      return order === 'asc' 
        ? a.conversation_count - b.conversation_count
        : b.conversation_count - a.conversation_count
    } else {
      // Sort by quality dimension
      const aQD = a.quality_dimensions.find(qd => qd.name === orderBy)
      const bQD = b.quality_dimensions.find(qd => qd.name === orderBy)
      const aValue = aQD?.average_score ?? -1
      const bValue = bQD?.average_score ?? -1
      return order === 'asc' ? aValue - bValue : bValue - aValue
    }
  })

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Box>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ backgroundColor: '#EAEDED' }}>
              <TableRow>
                <TableCell 
                  sx={{ 
                    width: 50,
                    position: 'sticky',
                    left: 0,
                    backgroundColor: '#EAEDED',
                    zIndex: 3,
                  }} 
                />
                <TableCell
                  sx={{ 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    fontSize: '0.75rem', 
                    minWidth: 180,
                    position: 'sticky',
                    left: 50,
                    backgroundColor: '#EAEDED',
                    zIndex: 3,
                    borderRight: '2px solid #E2E8F0',
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'trainer_name'}
                    direction={orderBy === 'trainer_name' ? order : 'asc'}
                    onClick={() => handleRequestSort('trainer_name')}
                    sx={{
                      '& .MuiTableSortLabel-icon': {
                        color: '#4F7DF3 !important',
                      },
                    }}
                  >
                    Trainer
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', minWidth: 120 }}
                >
                  <TableSortLabel
                    active={orderBy === 'conversation_count'}
                    direction={orderBy === 'conversation_count' ? order : 'asc'}
                    onClick={() => handleRequestSort('conversation_count')}
                    sx={{
                      '& .MuiTableSortLabel-icon': {
                        color: '#4F7DF3 !important',
                      },
                    }}
                  >
                    Total Tasks
                  </TableSortLabel>
                </TableCell>
                {/* Dynamic quality dimension columns - from ALL trainers */}
                {allQualityDimensionNames.map((dimName, idx) => (
                  <TableCell
                    key={idx}
                    align="right"
                    sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', minWidth: 150 }}
                  >
                    <TableSortLabel
                      active={orderBy === dimName}
                      direction={orderBy === dimName ? order : 'asc'}
                      onClick={() => handleRequestSort(dimName)}
                      sx={{
                        '& .MuiTableSortLabel-icon': {
                          color: '#4F7DF3 !important',
                        },
                      }}
                    >
                      {dimName}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((trainer, index) => (
                <TrainerRow
                  key={index}
                  trainer={trainer}
                  taskLevelData={taskLevelData}
                  allQualityDimensionNames={allQualityDimensionNames}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid #EAEDED',
          }}
        />
      </Paper>
    </Box>
  )
}

