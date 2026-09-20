import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import BlockedScreen from './components/BlockedScreen'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import QuotationForm from './pages/QuotationForm'
import { FinalDownloadScreen } from './pages/Preview'
import InvoiceForm from './pages/InvoiceForm'
import InvoiceDownload from './pages/InvoiceDownload'
import './App.css'

function QuotationFormRoute() {
  const { id } = useParams()
  return <QuotationForm key={id || 'new'} />
}

function InvoiceFormRoute() {
  const { id } = useParams()
  return <InvoiceForm key={id || 'new'} />
}

function AppRoutes() {
  const { user, authenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (authenticated && user?.status === 'blocked' && user?.role !== 'admin') {
    return <BlockedScreen />
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={authenticated ? <Navigate to={user?.role === 'admin' ? '/admin' : '/'} replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={authenticated ? <Navigate to={user?.role === 'admin' ? '/admin' : '/'} replace /> : <Signup />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Dashboard />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/quotation/new"
        element={
          <ProtectedRoute>
            {user?.role === 'admin' ? <Navigate to="/admin" replace /> : <QuotationFormRoute />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/quotation/:id"
        element={
          <ProtectedRoute>
            {user?.role === 'admin' ? <Navigate to="/admin" replace /> : <QuotationFormRoute />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/quotation/:id/download"
        element={
          <ProtectedRoute>
            {user?.role === 'admin' ? <Navigate to="/admin" replace /> : <FinalDownloadScreen />}
          </ProtectedRoute>
        }
      />

      {/* Invoice Routes */}
      <Route
        path="/invoice/new"
        element={
          <ProtectedRoute>
            {user?.role === 'admin' ? <Navigate to="/admin" replace /> : <InvoiceFormRoute />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoice/:id"
        element={
          <ProtectedRoute>
            {user?.role === 'admin' ? <Navigate to="/admin" replace /> : <InvoiceFormRoute />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoice/:id/download"
        element={
          <ProtectedRoute>
            {user?.role === 'admin' ? <Navigate to="/admin" replace /> : <InvoiceDownload />}
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={user?.role === 'admin' ? '/admin' : '/'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
