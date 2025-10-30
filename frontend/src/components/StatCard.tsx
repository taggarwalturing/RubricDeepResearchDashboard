import { Card, CardContent, Typography, Box } from '@mui/material'
import { TrendingUp } from '@mui/icons-material'

interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  color?: string
  subtitle?: string
}

export default function StatCard({ title, value, icon, color = 'primary', subtitle }: StatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
          <Box
            sx={{
              color: `${color}.main`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: `${color}.lighter`,
            }}
          >
            {icon || <TrendingUp />}
          </Box>
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 600, mb: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

