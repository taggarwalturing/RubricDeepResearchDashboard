import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Layout from './components/Layout'
import OverallStats from './pages/OverallStats'
import DomainStats from './pages/DomainStats'
import ReviewerStats from './pages/ReviewerStats'
import TrainerStats from './pages/TrainerStats'
import TaskLevel from './pages/TaskLevel'

function App() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/overall" replace />} />
          <Route path="/overall" element={<OverallStats />} />
          <Route path="/domain" element={<DomainStats />} />
          <Route path="/reviewer" element={<ReviewerStats />} />
          <Route path="/trainer" element={<TrainerStats />} />
          <Route path="/task-level" element={<TaskLevel />} />
        </Routes>
      </Layout>
    </Box>
  )
}

export default App

