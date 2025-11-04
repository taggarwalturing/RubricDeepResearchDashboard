import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PreDelivery from './pages/PreDelivery'
import ClientDelivery from './pages/ClientDelivery'

function App() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pre-delivery" element={<PreDelivery />} />
          <Route path="/post-delivery" element={<ClientDelivery />} />
        </Routes>
      </Layout>
    </Box>
  )
}

export default App

