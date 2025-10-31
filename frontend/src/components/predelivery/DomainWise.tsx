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
import { Business as BusinessIcon } from '@mui/icons-material'
import { getDomainStats } from '../../services/api'
import type { DomainAggregation } from '../../types'
import LoadingSpinner from '../LoadingSpinner'
import ErrorDisplay from '../ErrorDisplay'

type Order = 'asc' | 'desc'

export default function DomainWise() {
  const [data, setData] = useState<DomainAggregation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [orderBy, setOrderBy] = useState<string>('domain')
  const [order, setOrder] = useState<Order>('asc')

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getDomainStats({})
      setData(result)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch domain statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return <LoadingSpinner message="Loading domain statistics..." />
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

  // Get all unique quality dimension names from ALL domains (not just first one)
  const allQualityDimensionNames = Array.from(
    new Set(
      data.flatMap((domain) => domain.quality_dimensions.map((qd) => qd.name))
    )
  ).sort()

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (orderBy === 'domain') {
      const compareValue = (a.domain || '').localeCompare(b.domain || '')
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
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ backgroundColor: '#EAEDED' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', position: 'sticky', left: 0, backgroundColor: '#EAEDED', zIndex: 3, borderRight: '2px solid #E2E8F0' }}>
                  <TableSortLabel
                    active={orderBy === 'domain'}
                    direction={orderBy === 'domain' ? order : 'asc'}
                    onClick={() => handleRequestSort('domain')}
                    sx={{
                      '& .MuiTableSortLabel-icon': {
                        color: '#4F7DF3 !important',
                      },
                    }}
                  >
                    Domain
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
                {/* Dynamic Quality Dimension Columns - from ALL domains */}
                {allQualityDimensionNames.map((dimName, idx) => (
                  <TableCell key={idx} align="right" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', minWidth: 150 }}>
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
              {paginatedData.map((domain, index) => {
                // Create a map of domain's quality dimensions for quick lookup
                const domainQDMap = new Map(
                  domain.quality_dimensions.map((qd) => [qd.name, qd])
                )
                return (
                  <TableRow
                    key={index}
                    sx={{
                      '&:hover': { backgroundColor: '#F9FAFB' },
                      borderBottom: '1px solid #E5E7EB',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500, position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 2, borderRight: '2px solid #E2E8F0' }}>
                      {domain.domain || 'Unknown'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {domain.conversation_count}
                    </TableCell>
                    {/* Quality Dimension Values - display ALL dimensions in order */}
                    {allQualityDimensionNames.map((dimName, idx) => {
                      const qd = domainQDMap.get(dimName)
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
        </Box>

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
            '.MuiTablePagination-displayedRows': {
              fontSize: '0.875rem',
            },
          }}
        />
      </Paper>
    </Box>
  )
}

