import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Records from './pages/Records'
import Sources from './pages/Sources'
import Classification from './pages/Classification'
import Requests from './pages/Requests'
import Security from './pages/Security'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="records" element={<Records />} />
        <Route path="sources" element={<Sources />} />
        <Route path="classification" element={<Classification />} />
        <Route path="requests" element={<Requests />} />
        <Route path="security" element={<Security />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
