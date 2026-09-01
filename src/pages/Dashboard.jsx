import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { downloadPdfBytes } from '../utils/pdf'
import { formatCurrency } from '../components/InvoicePreview'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'

export default function Dashboard() {
  const { user } = useAuth()
  const [quotations, setQuotations] = useState([])
  const [invoices, setInvoices] = useState([])
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'quotation' | 'invoice'
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const loadData = () => {
    setLoading(true)
    Promise.all([
      api.getQuotations().catch(() => []),
      api.getInvoices().catch(() => []),
    ])
      .then(([qData, iData]) => {
        setQuotations(qData.map((item) => ({ ...item, itemType: 'quotation' })))
        setInvoices(iData.map((item) => ({ ...item, itemType: 'invoice' })))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDeleteQuotation = async (e, id, name) => {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to delete quotation for "${name}"?`)) {
      try {
        await api.deleteQuotation(id)
        setQuotations((prev) => prev.filter((q) => q.id !== id))
      } catch {
        alert('Failed to delete quotation.')
      }
    }
  }

  const handleDeleteInvoice = async (e, id, name) => {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to delete invoice for "${name}"?`)) {
      try {
        await api.deleteInvoice(id)
        setInvoices((prev) => prev.filter((i) => i.id !== id))
      } catch {
        alert('Failed to delete invoice.')
      }
    }
  }

  const handleDownloadQuotation = async (e, q) => {
    e.stopPropagation()
    try {
      const blob = await api.fetchPdfBlob(q.id)
      const fileName = `${(q.displayName || 'Quotation').replace(/\s+/g, '_')}_Quotation.pdf`
      await downloadPdfBytes(blob, fileName)
    } catch (err) {
      console.error(err)
      alert('Could not download PDF.')
    }
  }

  const handleDownloadInvoice = async (e, inv) => {
    e.stopPropagation()
    try {
      const blob = await api.fetchInvoicePdfBlob(inv.id)
      const fileName = `${(inv.displayName || 'Invoice').replace(/\s+/g, '_')}_Invoice.pdf`
      await downloadPdfBytes(blob, fileName)
    } catch (err) {
      console.error(err)
      alert('Could not download Invoice PDF.')
    }
  }

  const allItems = [...quotations, ...invoices].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  )

  const displayedItems = allItems
    .filter((item) => {
      if (activeTab === 'quotation') return item.itemType === 'quotation'
      if (activeTab === 'invoice') return item.itemType === 'invoice'
      return true
    })
    .filter((item) =>
      item.displayName.toLowerCase().includes(search.toLowerCase()),
    )

  const formatDate = (isoString) => {
    if (!isoString) return ''
    const d = new Date(isoString)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // Get User Initials for Profile Avatar
  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }

  return (
    <div className="app-layout">
      {/* Left Sidebar (Desktop fixed / Mobile slide-over drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Viewport */}
      <main className="main-viewport">
        {/* Mobile Top Bar (Visible ONLY on mobile screens <768px) */}
        <header className="mobile-top-bar">
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <Link to="/" className="mobile-brand-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: 'var(--naj-gold)' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <span className="mobile-brand-title">PACKAGEUNDAKAM</span>
          </Link>

          <div className="avatar-circle mobile-avatar">
            {getInitials(user?.name || 'NAJ Wedding')}
          </div>
        </header>

        {/* Desktop Header Bar (Hidden on mobile) */}
        <header className="top-header desktop-only">
          <p className="welcome-greeting">
            Welcome, {user?.name || 'User'} 👋
          </p>

          <div className="user-profile-menu">
            <div className="avatar-circle">
              {getInitials(user?.name || 'NAJ Wedding')}
            </div>
            <span className="user-name-text">
              {user?.name || 'NAJ Wedding'}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </header>

        {/* Desktop Page Title (Hidden on mobile) */}
        <div className="dashboard-title-header desktop-only">
          <h1 className="dashboard-page-title">Dashboard</h1>
          <p className="dashboard-page-subtitle">Manage your quotations and invoices</p>
        </div>

        {/* Mobile Hero Section (Visible ONLY on mobile <768px matching reference screenshot) */}
        <div className="mobile-hero-card">
          <h2 className="mobile-hero-title">Welcome, {user?.name || 'NAJ Wedding'} 👋</h2>
          <p className="mobile-hero-subtitle">Manage your quotations and invoices</p>

          <div className="mobile-hero-buttons">
            <Link to="/quotation/new" className="mobile-hero-btn mobile-hero-btn-quotation">
              <span className="btn-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                <span>+ NEW QUOTATION</span>
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>

            <Link to="/invoice/new" className="mobile-hero-btn mobile-hero-btn-invoice">
              <span className="btn-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                <span>+ NEW INVOICE</span>
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>
          </div>
        </div>

        {/* Controls Row: Filter Tabs & Search Bar */}
        <div className="controls-row">
          <div className="tabs-group">
            <button
              type="button"
              className={`tab-pill-btn ${activeTab === 'all' ? 'active' : 'inactive'}`}
              onClick={() => setActiveTab('all')}
            >
              All ({allItems.length})
            </button>
            <button
              type="button"
              className={`tab-pill-btn ${activeTab === 'quotation' ? 'active' : 'inactive'}`}
              onClick={() => setActiveTab('quotation')}
            >
              Quotations ({quotations.length})
            </button>
            <button
              type="button"
              className={`tab-pill-btn ${activeTab === 'invoice' ? 'active' : 'inactive'}`}
              onClick={() => setActiveTab('invoice')}
            >
              Invoices ({invoices.length})
            </button>
          </div>

          <div className="dashboard-search-box">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search by client name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="search-clear-btn"
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                onClick={() => setSearch('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Record Cards Stack */}
        <div className="quotation-list">
          {loading && <p className="list-empty">Loading records...</p>}
          {!loading && displayedItems.length === 0 && (
            <p className="list-empty">
              {search ? 'No records match your search.' : 'No records created yet.'}
            </p>
          )}
          {displayedItems.map((item) => {
            const isInvoice = item.itemType === 'invoice'
            return (
              <div
                key={item.id}
                className="quotation-card"
                onClick={() => navigate(isInvoice ? `/invoice/${item.id}` : `/quotation/${item.id}`)}
                style={{ borderLeft: isInvoice ? '4px solid #27ae60' : '4px solid #b8956a' }}
              >
                <div className="card-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`card-badge ${isInvoice ? 'card-badge-invoice' : 'card-badge-quotation'}`}>
                      {isInvoice ? 'INVOICE' : 'QUOTATION'}
                    </span>
                    <h3 className="card-client-name">{item.displayName}</h3>
                  </div>

                  <button
                    type="button"
                    className="card-more-options-btn"
                    onClick={(e) => e.stopPropagation()}
                    title="Options"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="2"></circle>
                      <circle cx="12" cy="12" r="2"></circle>
                      <circle cx="12" cy="19" r="2"></circle>
                    </svg>
                  </button>
                </div>

                <div className="card-main" style={{ marginTop: '8px' }}>
                  {isInvoice && item.balance !== undefined && (
                    <p style={{ fontSize: '14px', color: '#27ae60', fontWeight: '700', margin: '4px 0 2px 0' }}>
                      Balance: ₹{formatCurrency(item.balance)}
                    </p>
                  )}

                  <p className="card-date">Updated: {formatDate(item.updatedAt)}</p>
                </div>

                <div className="card-actions" style={{ marginTop: '14px' }}>
                  <button
                    type="button"
                    className="card-action-edit"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(isInvoice ? `/invoice/${item.id}` : `/quotation/${item.id}`)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="card-action-download"
                    onClick={(e) =>
                      isInvoice ? handleDownloadInvoice(e, item) : handleDownloadQuotation(e, item)
                    }
                  >
                    Download PDF
                  </button>
                  <button
                    type="button"
                    className="card-action-delete"
                    onClick={(e) =>
                      isInvoice
                        ? handleDeleteInvoice(e, item.id, item.displayName)
                        : handleDeleteQuotation(e, item.id, item.displayName)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
