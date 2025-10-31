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
  TableSortLabel,
} from '@mui/material'
import { EmojiEvents as TrophyIcon } from '@mui/icons-material'
import { getReviewerStats } from '../../services/api'
import type { ReviewerAggregation } from '../../types'
import LoadingSpinner from '../LoadingSpinner'
import ErrorDisplay from '../ErrorDisplay'

type Order = 'asc' | 'desc'

export default function ReviewerWise() {
  const [data, setData] = useState<ReviewerAggregation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [orderBy, setOrderBy] = useState<string>('reviewer_name')
  const [order, setOrder] = useState<Order>('asc')

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getReviewerStats({})
      setData(result)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reviewer statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return <LoadingSpinner message="Loading reviewer statistics..." />
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

  // Get all unique quality dimension names from ALL reviewers (not just first one)
  const allQualityDimensionNames = Array.from(
    new Set(
      data.flatMap((reviewer) => reviewer.quality_dimensions.map((qd) => qd.name))
    )
  ).sort()

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (orderBy === 'reviewer_name') {
      const compareValue = (a.reviewer_name || '').localeCompare(b.reviewer_name || '')
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
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    fontSize: '0.75rem', 
                    minWidth: 180,
                    position: 'sticky',
                    left: 0,
                    backgroundColor: '#EAEDED',
                    zIndex: 3,
                    borderRight: '2px solid #E2E8F0',
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'reviewer_name'}
                    direction={orderBy === 'reviewer_name' ? order : 'asc'}
                    onClick={() => handleRequestSort('reviewer_name')}
                    sx={{
                      '& .MuiTableSortLabel-icon': {
                        color: '#4F7DF3 !important',
                      },
                    }}
                  >
                    Reviewer
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', minWidth: 120 }}>
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
                {/* Dynamic quality dimension columns - from ALL reviewers */}
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
              {paginatedData.map((reviewer, index) => {
                // Create a map of reviewer's quality dimensions for quick lookup
                const reviewerQDMap = new Map(
                  reviewer.quality_dimensions.map((qd) => [qd.name, qd])
                )
                return (
                  <TableRow
                    key={index}
                    sx={{
                      '&:hover': { backgroundColor: '#F9FAFB' },
                      borderBottom: '1px solid #E2E8F0',
                    }}
                  >
                    <TableCell 
                      sx={{ 
                        fontWeight: 500,
                        position: 'sticky',
                        left: 0,
                        backgroundColor: 'white',
                        zIndex: 2,
                        borderRight: '2px solid #E2E8F0',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {reviewer.reviewer_name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {reviewer.reviewer_id || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {reviewer.conversation_count}
                    </TableCell>
                    {/* Quality dimension average scores - display ALL dimensions in order */}
                    {allQualityDimensionNames.map((dimName, idx) => {
                      const qd = reviewerQDMap.get(dimName)
                      return (
                        <TableCell key={idx} align="right" sx={{ color: '#1F2937', fontWeight: 600 }}>
                          {qd?.average_score?.toFixed(2) || 'N/A'}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
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

