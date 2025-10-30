import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material'
import { FilterList, ExpandMore, ExpandLess } from '@mui/icons-material'
import type { FilterParams } from '../types'

interface FilterPanelProps {
  onFilterChange: (filters: FilterParams) => void
  showDomainFilter?: boolean
  showReviewerFilter?: boolean
  showTrainerFilter?: boolean
}

export default function FilterPanel({
  onFilterChange,
  showDomainFilter = true,
  showReviewerFilter = true,
  showTrainerFilter = true,
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterParams>({})

  const handleFilterChange = (key: keyof FilterParams, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value === '' ? undefined : value,
    }
    setFilters(newFilters)
  }

  const handleApplyFilters = () => {
    onFilterChange(filters)
  }

  const handleResetFilters = () => {
    setFilters({})
    onFilterChange({})
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList color="primary" />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Grid container spacing={2}>
            {showDomainFilter && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Domain"
                  value={filters.domain || ''}
                  onChange={(e) => handleFilterChange('domain', e.target.value)}
                  size="small"
                />
              </Grid>
            )}
            {showReviewerFilter && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Reviewer ID"
                  value={filters.reviewer || ''}
                  onChange={(e) => handleFilterChange('reviewer', e.target.value)}
                  size="small"
                />
              </Grid>
            )}
            {showTrainerFilter && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Trainer Level ID"
                  value={filters.trainer || ''}
                  onChange={(e) => handleFilterChange('trainer', e.target.value)}
                  size="small"
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Quality Dimension"
                value={filters.quality_dimension || ''}
                onChange={(e) => handleFilterChange('quality_dimension', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Min Score"
                type="number"
                value={filters.min_score || ''}
                onChange={(e) => handleFilterChange('min_score', e.target.value)}
                inputProps={{ min: 0, max: 5, step: 0.1 }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Max Score"
                type="number"
                value={filters.max_score || ''}
                onChange={(e) => handleFilterChange('max_score', e.target.value)}
                inputProps={{ min: 0, max: 5, step: 0.1 }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Min Task Count"
                type="number"
                value={filters.min_task_count || ''}
                onChange={(e) => handleFilterChange('min_task_count', e.target.value)}
                inputProps={{ min: 1, step: 1 }}
                size="small"
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button variant="contained" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
            <Button variant="outlined" onClick={handleResetFilters}>
              Reset
            </Button>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  )
}

