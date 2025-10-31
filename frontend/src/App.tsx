import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Layout from './components/Layout'
import PreDelivery from './pages/PreDelivery'
import OverallStats from './pages/OverallStats'
import TaskLevel from './pages/TaskLevel'

function App() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/pre-delivery" replace />} />
          <Route path="/pre-delivery" element={<PreDelivery />} />
          <Route path="/overall" element={<OverallStats />} />
          <Route path="/task-level" element={<TaskLevel />} />
        </Routes>
      </Layout>
    </Box>
  )
}

export default App

