import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

function formatDateTime(isoString) {
  if (!isoString) return 'No usage yet'
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return 'No usage yet'
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return 'No usage yet'
  }
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')

  // Modal State for Block / Unblock Confirmation
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    company: null,
    targetStatus: null,
  })

  // Action Loading State
  const [processingId, setProcessingId] = useState(null)

  const loadCompanies = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.getAdminCompanies()
      setCompanies(data)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to load companies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  const handleOpenConfirm = (company, targetStatus) => {
    setConfirmModal({
      isOpen: true,
      company,
      targetStatus,
    })
  }

  const handleCloseConfirm = () => {
    setConfirmModal({
      isOpen: false,
      company: null,
      targetStatus: null,
    })
  }

  const handleConfirmStatusChange = async () => {
    const { company, targetStatus } = confirmModal
    if (!company || !targetStatus) return

    try {
      setProcessingId(company.id)
      handleCloseConfirm()
      await api.updateCompanyStatus(company.id, targetStatus)
      await loadCompanies()
    } catch (err) {
      alert(err.message || 'Failed to update company status')
    } finally {
      setProcessingId(null)
    }
  }

  const handleTogglePayment = async (company) => {
    const nextPayment = company.paymentStatus === 'paid' ? 'unpaid' : 'paid'
    try {
      setProcessingId(company.id)
      await api.updateCompanyPayment(company.id, nextPayment)
      await loadCompanies()
    } catch (err) {
      alert(err.message || 'Failed to update payment status')
    } finally {
      setProcessingId(null)
    }
  }

  // Filter logic
  const filteredCompanies = companies.filter((comp) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      comp.name?.toLowerCase().includes(q) ||
      comp.username?.toLowerCase().includes(q) ||
      comp.email?.toLowerCase().includes(q) ||
      comp.company?.toLowerCase().includes(q)

    const matchesStatus =
      statusFilter === 'all' || comp.status === statusFilter

    const matchesPayment =
      paymentFilter === 'all' || comp.paymentStatus === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  // Summary Metrics
  const totalCount = companies.length
  const activeCount = companies.filter((c) => c.status === 'active').length
  const blockedCount = companies.filter((c) => c.status === 'blocked').length
  const unpaidCount = companies.filter((c) => c.paymentStatus === 'unpaid').length

  return (
    <div className="admin-page-layout">
      {/* Top Bar / Header */}
      <header className="admin-header">
        <div className="admin-header-brand">
          <div className="admin-badge-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <div>
            <h1 className="admin-header-title">PACKAGEUNDAKAM ADMIN</h1>
            <p className="admin-header-subtitle">System Administrator Dashboard & Company Control</p>
          </div>
        </div>

        <div className="admin-header-actions">
          <span className="admin-user-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="7" r="4"></circle>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            </svg>
            {user?.name || 'Administrator'}
          </span>
          <Link to="/" className="btn btn-secondary btn-sm">
            Home Dashboard
          </Link>
          <button type="button" className="btn btn-secondary btn-sm" onClick={logout}>
            Log Out
          </button>
        </div>
      </header>

      <main className="admin-main-content">
        {/* Metrics Grid */}
        <div className="admin-metrics-grid">
          <div className="admin-metric-card">
            <div className="admin-metric-label">Total Companies</div>
            <div className="admin-metric-value">{totalCount}</div>
          </div>
          <div className="admin-metric-card">
            <div className="admin-metric-label">Active Accounts</div>
            <div className="admin-metric-value text-success">{activeCount}</div>
          </div>
          <div className="admin-metric-card">
            <div className="admin-metric-label">Blocked Accounts</div>
            <div className="admin-metric-value text-danger">{blockedCount}</div>
          </div>
          <div className="admin-metric-card">
            <div className="admin-metric-label">Unpaid Subscriptions</div>
            <div className="admin-metric-value text-warning">{unpaidCount}</div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="admin-controls-card">
          <div className="admin-search-wrapper">
            <svg className="admin-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search companies by name, username, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-filters-wrapper">
            <div className="admin-filter-group">
              <label>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div className="admin-filter-group">
              <label>Payment:</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={loadCompanies}
              title="Refresh company data"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="admin-error-banner">
            <span>{error}</span>
            <button type="button" onClick={loadCompanies}>Try Again</button>
          </div>
        )}

        {/* Companies Table */}
        <div className="admin-table-card">
          {loading ? (
            <div className="admin-loading-state">
              <p>Loading company accounts...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="admin-empty-state">
              <p>No companies match the current filter criteria.</p>
            </div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Account / Username</th>
                    <th>Email</th>
                    <th>Last Used (Generator)</th>
                    <th>Monthly Payment</th>
                    <th>Account Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((comp) => {
                    const isBlocked = comp.status === 'blocked'
                    const isPaid = comp.paymentStatus === 'paid'
                    const isProcessing = processingId === comp.id

                    return (
                      <tr key={comp.id} className={isBlocked ? 'row-blocked' : ''}>
                        <td>
                          <div className="admin-company-cell">
                            <span className="admin-company-name">{comp.name}</span>
                            <span className="admin-company-key">Tenant: {comp.company}</span>
                          </div>
                        </td>

                        <td>
                          <code className="admin-username-tag">{comp.username || '—'}</code>
                        </td>

                        <td>
                          <span className="admin-email-text">{comp.email}</span>
                        </td>

                        <td>
                          <div className="admin-last-used-cell">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>{formatDateTime(comp.lastUsed)}</span>
                          </div>
                        </td>

                        <td>
                          <div className="admin-payment-cell">
                            <span className={`admin-status-badge badge-${comp.paymentStatus}`}>
                              {isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                            <button
                              type="button"
                              className="admin-inline-toggle"
                              disabled={isProcessing}
                              onClick={() => handleTogglePayment(comp)}
                              title={`Click to mark as ${isPaid ? 'Unpaid' : 'Paid'}`}
                            >
                              {isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                            </button>
                          </div>
                        </td>

                        <td>
                          <span className={`admin-status-badge badge-${comp.status}`}>
                            {isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          {isBlocked ? (
                            <button
                              type="button"
                              className="btn btn-unblock btn-sm"
                              disabled={isProcessing}
                              onClick={() => handleOpenConfirm(comp, 'active')}
                            >
                              Unblock
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-block btn-sm"
                              disabled={isProcessing}
                              onClick={() => handleOpenConfirm(comp, 'blocked')}
                            >
                              Block
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && confirmModal.company && (
        <div className="modal-backdrop" onClick={handleCloseConfirm}>
          <div className="modal-content admin-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-confirm-header">
              <h3>
                {confirmModal.targetStatus === 'blocked' ? 'Block Company Access?' : 'Unblock Company Access?'}
              </h3>
            </div>

            <div className="admin-confirm-body">
              {confirmModal.targetStatus === 'blocked' ? (
                <p>
                  Are you sure you want to block <strong>{confirmModal.company.name}</strong>?
                  <br /><br />
                  They will not be able to create quotations or generate PDFs until unblocked.
                  Their existing account and quotations will <strong>NOT</strong> be deleted.
                </p>
              ) : (
                <p>
                  Are you sure you want to unblock <strong>{confirmModal.company.name}</strong>?
                  <br /><br />
                  They will immediately regain full access to use the package generator and invoice features.
                </p>
              )}
            </div>

            <div className="admin-confirm-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseConfirm}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${confirmModal.targetStatus === 'blocked' ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleConfirmStatusChange}
              >
                {confirmModal.targetStatus === 'blocked' ? 'Confirm Block' : 'Confirm Unblock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
