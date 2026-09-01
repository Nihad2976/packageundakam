import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
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
  const { authenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={authenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={authenticated ? <Navigate to="/" replace /> : <Signup />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quotation/new"
        element={
          <ProtectedRoute>
            <QuotationFormRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quotation/:id"
        element={
          <ProtectedRoute>
            <QuotationFormRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quotation/:id/download"
        element={
          <ProtectedRoute>
            <FinalDownloadScreen />
          </ProtectedRoute>
        }
      />

      {/* Invoice Routes */}
      <Route
        path="/invoice/new"
        element={
          <ProtectedRoute>
            <InvoiceFormRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoice/:id"
        element={
          <ProtectedRoute>
            <InvoiceFormRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoice/:id/download"
        element={
          <ProtectedRoute>
            <InvoiceDownload />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
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
