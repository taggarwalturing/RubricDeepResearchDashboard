import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Typography,
  Collapse,
  IconButton,
  Chip,
  Autocomplete,
  TextField,
  Slider,
  FormControl,
  FormLabel,
  Divider,
} from '@mui/material'
import { FilterList, ExpandMore, ExpandLess, Clear } from '@mui/icons-material'
import type { FilterParams } from '../types'

interface AdvancedFilterPanelProps {
  onFilterChange: (filters: FilterParams) => void
  availableDomains?: string[]
  availableQualityDimensions?: string[]
  availableReviewers?: Array<{ id: string; name: string }>
  availableTrainers?: Array<{ id: string; name: string }>
}

export default function AdvancedFilterPanel({
  onFilterChange,
  availableDomains = [],
  availableQualityDimensions = [],
  availableReviewers = [],
  availableTrainers = [],
}: AdvancedFilterPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [selectedQualityDimensions, setSelectedQualityDimensions] = useState<string[]>([])
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([])
  const [selectedTrainers, setSelectedTrainers] = useState<string[]>([])
  const [scoreRange, setScoreRange] = useState<number[]>([0, 5])
  const [taskCountMin, setTaskCountMin] = useState<number | ''>('')

  const hasActiveFilters = 
    selectedDomains.length > 0 ||
    selectedQualityDimensions.length > 0 ||
    selectedReviewers.length > 0 ||
    selectedTrainers.length > 0 ||
    scoreRange[0] !== 0 ||
    scoreRange[1] !== 5 ||
    taskCountMin !== ''

  const handleApplyFilters = () => {
    const filters: FilterParams = {}

    // For multi-select, we'll send comma-separated values
    if (selectedDomains.length > 0) {
      filters.domain = selectedDomains.join(',')
    }
    if (selectedQualityDimensions.length > 0) {
      filters.quality_dimension = selectedQualityDimensions.join(',')
    }
    if (selectedReviewers.length > 0) {
      filters.reviewer = selectedReviewers.join(',')
    }
    if (selectedTrainers.length > 0) {
      filters.trainer = selectedTrainers.join(',')
    }
    if (scoreRange[0] !== 0) {
      filters.min_score = scoreRange[0]
    }
    if (scoreRange[1] !== 5) {
      filters.max_score = scoreRange[1]
    }
    if (taskCountMin !== '') {
      filters.min_task_count = Number(taskCountMin)
    }

    onFilterChange(filters)
  }

  const handleResetFilters = () => {
    setSelectedDomains([])
    setSelectedQualityDimensions([])
    setSelectedReviewers([])
    setSelectedTrainers([])
    setScoreRange([0, 5])
    setTaskCountMin('')
    onFilterChange({})
  }

  const handleRemoveFilter = (type: string, value: string) => {
    switch (type) {
      case 'domain':
        setSelectedDomains(prev => prev.filter(d => d !== value))
        break
      case 'quality_dimension':
        setSelectedQualityDimensions(prev => prev.filter(q => q !== value))
        break
      case 'reviewer':
        setSelectedReviewers(prev => prev.filter(r => r !== value))
        break
      case 'trainer':
        setSelectedTrainers(prev => prev.filter(t => t !== value))
        break
    }
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList color="primary" />
            <Typography variant="h6">Advanced Filters</Typography>
            {hasActiveFilters && (
              <Chip 
                label={`${
                  selectedDomains.length + 
                  selectedQualityDimensions.length + 
                  selectedReviewers.length + 
                  selectedTrainers.length +
                  (scoreRange[0] !== 0 || scoreRange[1] !== 5 ? 1 : 0) +
                  (taskCountMin !== '' ? 1 : 0)
                } active`}
                color="primary"
                size="small"
              />
            )}
          </Box>
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedDomains.map(domain => (
              <Chip
                key={domain}
                label={`Domain: ${domain}`}
                onDelete={() => handleRemoveFilter('domain', domain)}
                color="primary"
                variant="outlined"
                size="small"
              />
            ))}
            {selectedQualityDimensions.map(qd => (
              <Chip
                key={qd}
                label={`Dimension: ${qd}`}
                onDelete={() => handleRemoveFilter('quality_dimension', qd)}
                color="secondary"
                variant="outlined"
                size="small"
              />
            ))}
            {selectedReviewers.map(reviewer => (
              <Chip
                key={reviewer}
                label={`Reviewer: ${reviewer}`}
                onDelete={() => handleRemoveFilter('reviewer', reviewer)}
                color="info"
                variant="outlined"
                size="small"
              />
            ))}
            {selectedTrainers.map(trainer => (
              <Chip
                key={trainer}
                label={`Trainer: ${trainer}`}
                onDelete={() => handleRemoveFilter('trainer', trainer)}
                color="success"
                variant="outlined"
                size="small"
              />
            ))}
            {(scoreRange[0] !== 0 || scoreRange[1] !== 5) && (
              <Chip
                label={`Score: ${scoreRange[0]} - ${scoreRange[1]}`}
                onDelete={() => setScoreRange([0, 5])}
                color="warning"
                variant="outlined"
                size="small"
              />
            )}
            {taskCountMin !== '' && (
              <Chip
                label={`Min Tasks: ${taskCountMin}`}
                onDelete={() => setTaskCountMin('')}
                color="error"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        )}

        <Collapse in={expanded}>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {/* Domain Multi-Select */}
            {availableDomains.length > 0 && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <FormLabel sx={{ mb: 1, fontWeight: 500 }}>Domains</FormLabel>
                  <Autocomplete
                    multiple
                    options={availableDomains}
                    value={selectedDomains}
                    onChange={(_, newValue) => setSelectedDomains(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Select domains..." size="small" />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option}
                          size="small"
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                  />
                </FormControl>
              </Grid>
            )}

            {/* Quality Dimensions Multi-Select */}
            {availableQualityDimensions.length > 0 && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <FormLabel sx={{ mb: 1, fontWeight: 500 }}>Quality Dimensions</FormLabel>
                  <Autocomplete
                    multiple
                    options={availableQualityDimensions}
                    value={selectedQualityDimensions}
                    onChange={(_, newValue) => setSelectedQualityDimensions(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Select dimensions..." size="small" />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option}
                          size="small"
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                  />
                </FormControl>
              </Grid>
            )}

            {/* Reviewers Multi-Select */}
            {availableReviewers.length > 0 && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <FormLabel sx={{ mb: 1, fontWeight: 500 }}>Reviewers</FormLabel>
                  <Autocomplete
                    multiple
                    options={availableReviewers}
                    getOptionLabel={(option) => option.name || option.id}
                    value={availableReviewers.filter(r => selectedReviewers.includes(r.id))}
                    onChange={(_, newValue) => setSelectedReviewers(newValue.map(v => v.id))}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Select reviewers..." size="small" />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.name || option.id}
                          size="small"
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                  />
                </FormControl>
              </Grid>
            )}

            {/* Trainers Multi-Select */}
            {availableTrainers.length > 0 && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <FormLabel sx={{ mb: 1, fontWeight: 500 }}>Trainers</FormLabel>
                  <Autocomplete
                    multiple
                    options={availableTrainers}
                    getOptionLabel={(option) => option.name || option.id}
                    value={availableTrainers.filter(t => selectedTrainers.includes(t.id))}
                    onChange={(_, newValue) => setSelectedTrainers(newValue.map(v => v.id))}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Select trainers..." size="small" />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.name || option.id}
                          size="small"
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                  />
                </FormControl>
              </Grid>
            )}

            {/* Score Range Slider */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <FormLabel sx={{ mb: 1, fontWeight: 500 }}>
                  Score Range: {scoreRange[0]} - {scoreRange[1]}
                </FormLabel>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={scoreRange}
                    onChange={(_, newValue) => setScoreRange(newValue as number[])}
                    valueLabelDisplay="auto"
                    min={0}
                    max={5}
                    step={0.1}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 2.5, label: '2.5' },
                      { value: 5, label: '5' },
                    ]}
                  />
                </Box>
              </FormControl>
            </Grid>

            {/* Minimum Task Count */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <FormLabel sx={{ mb: 1, fontWeight: 500 }}>Minimum Task Count</FormLabel>
                <TextField
                  type="number"
                  value={taskCountMin}
                  onChange={(e) => setTaskCountMin(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Enter minimum tasks..."
                  size="small"
                  inputProps={{ min: 1, step: 1 }}
                />
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button 
              variant="contained" 
              onClick={handleApplyFilters}
              startIcon={<FilterList />}
            >
              Apply Filters
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleResetFilters}
              startIcon={<Clear />}
              disabled={!hasActiveFilters}
            >
              Clear All
            </Button>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  )
}

