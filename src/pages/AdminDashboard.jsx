import { useEffect, useState } from 'react'
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

  // Modal State for Editing Reminder Email
  const [emailModal, setEmailModal] = useState({
    isOpen: false,
    company: null,
    email: '',
  })

  // Modal State for Sending Reminder Email
  const [reminderModal, setReminderModal] = useState({
    isOpen: false,
    company: null,
    recipientEmail: '',
    sending: false,
  })

  // Email settings state
  const [emailConfig, setEmailConfig] = useState({
    configured: false,
    user: '',
    senderName: '',
  })
  const [emailSettingsModal, setEmailSettingsModal] = useState({
    isOpen: false,
    user: '',
    pass: '',
    senderName: 'PackageUndakam Admin',
    saving: false,
    error: '',
  })

  // Action Loading State
  const [processingId, setProcessingId] = useState(null)

  // Toast notification feedback
  const [toast, setToast] = useState({ message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast({ message: '', type: 'success' })
    }, 4500)
  }

  const loadEmailSettings = async () => {
    try {
      const data = await api.getEmailSettings()
      setEmailConfig(data)
    } catch (err) {
      console.error('Failed to load email settings:', err)
    }
  }

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
    loadEmailSettings()
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

  const handleOpenEditEmail = (comp) => {
    setEmailModal({
      isOpen: true,
      company: comp,
      email: comp.reminderEmail || comp.email || '',
    })
  }

  const handleSaveEmail = async () => {
    if (!emailModal.company || !emailModal.email.trim()) return
    try {
      setProcessingId(emailModal.company.id)
      await api.updateCompanyEmail(emailModal.company.id, {
        reminderEmail: emailModal.email.trim(),
      })
      showToast(`Reminder email updated for ${emailModal.company.name}`)
      setEmailModal({ isOpen: false, company: null, email: '' })
      await loadCompanies()
    } catch (err) {
      alert(err.message || 'Failed to update reminder email')
    } finally {
      setProcessingId(null)
    }
  }

  const handleOpenReminderModal = (comp) => {
    setReminderModal({
      isOpen: true,
      company: comp,
      recipientEmail: comp.reminderEmail || comp.email || '',
      sending: false,
    })
  }

  const handleSendReminder = async () => {
    const { company, recipientEmail } = reminderModal
    if (!company || !recipientEmail.trim()) return

    try {
      setReminderModal((prev) => ({ ...prev, sending: true }))
      const res = await api.sendCompanyReminder(company.id, recipientEmail.trim())
      setReminderModal({ isOpen: false, company: null, recipientEmail: '', sending: false })
      showToast(`Reminder email dispatched to ${res.sentTo || recipientEmail}`)
      await loadCompanies()
    } catch (err) {
      alert(err.message || 'Failed to send reminder email')
      setReminderModal((prev) => ({ ...prev, sending: false }))
    }
  }

  const handleRemindAllUnpaid = async () => {
    const unpaidList = companies.filter((c) => c.status !== 'blocked' && c.paymentStatus === 'unpaid')
    if (unpaidList.length === 0) {
      alert('No unpaid active companies found.')
      return
    }

    if (!window.confirm(`Send subscription reminder email to all ${unpaidList.length} unpaid company accounts?`)) {
      return
    }

    try {
      setLoading(true)
      const res = await api.sendAllUnpaidReminders()
      showToast(`Dispatched reminders to ${res.count} unpaid companies!`)
      await loadCompanies()
    } catch (err) {
      alert(err.message || 'Failed to send unpaid reminders')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEmailSettings = async (e) => {
    e?.preventDefault()
    if (!emailSettingsModal.user.trim()) {
      setEmailSettingsModal((prev) => ({ ...prev, error: 'Please enter your Gmail address.' }))
      return
    }

    setEmailSettingsModal((prev) => ({ ...prev, saving: true, error: '' }))
    try {
      await api.saveEmailSettings({
        user: emailSettingsModal.user.trim(),
        pass: emailSettingsModal.pass.trim(),
        senderName: emailSettingsModal.senderName.trim() || 'PackageUndakam Admin',
        service: 'gmail',
      })
      showToast('Gmail connection verified and saved!')
      setEmailSettingsModal({ isOpen: false, user: '', pass: '', senderName: '', saving: false, error: '' })
      await loadEmailSettings()
    } catch (err) {
      setEmailSettingsModal((prev) => ({
        ...prev,
        saving: false,
        error: err.message || 'Connection test failed. Please verify your Gmail address and 16-digit App Password.',
      }))
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
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setEmailSettingsModal({
                isOpen: true,
                user: emailConfig.rawUser || '',
                pass: '',
                senderName: emailConfig.senderName || 'PackageUndakam Admin',
                saving: false,
                error: '',
              })
            }}
            title="Configure Gmail and 16-digit App Password for sending real emails"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: emailConfig.configured ? '#34d399' : '#f59e0b',
                display: 'inline-block',
                boxShadow: emailConfig.configured ? '0 0 8px rgba(52, 211, 153, 0.6)' : '0 0 8px rgba(245, 158, 11, 0.6)',
              }}
            />
            <span>{emailConfig.configured ? 'Gmail Connected' : 'Connect Gmail'}</span>
          </button>

          <span className="admin-user-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="7" r="4"></circle>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            </svg>
            {user?.name || 'Administrator'}
          </span>
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

            {unpaidCount > 0 && (
              <button
                type="button"
                className="btn btn-warning btn-sm"
                onClick={handleRemindAllUnpaid}
                title="Send monthly subscription reminder email to all unpaid companies"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span>Remind Unpaid ({unpaidCount})</span>
              </button>
            )}
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
                    <th>Reminder Recipient</th>
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
                    const reminderTarget = comp.reminderEmail || comp.email

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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="admin-email-text">{reminderTarget}</span>
                            <button
                              type="button"
                              onClick={() => handleOpenEditEmail(comp)}
                              title="Change email address to send reminders"
                              style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '11px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#fbbf24')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                            >
                              ✎ Change
                            </button>
                          </div>
                          {comp.lastReminderSent && (
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                              Sent: {formatDateTime(comp.lastReminderSent)}
                            </div>
                          )}
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
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              disabled={isProcessing}
                              onClick={() => handleOpenReminderModal(comp)}
                              title="Send subscription reminder email"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                              </svg>
                              <span>Remind</span>
                            </button>

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
                          </div>
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

      {/* Edit Reminder Email Modal */}
      {emailModal.isOpen && emailModal.company && (
        <div className="modal-backdrop" onClick={() => setEmailModal({ isOpen: false, company: null, email: '' })}>
          <div className="modal-content admin-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-confirm-header">
              <h3>Change Reminder Email</h3>
            </div>
            <div className="admin-confirm-body">
              <p>
                Set the email address where monthly reminders will be sent for <strong>{emailModal.company.name}</strong>:
              </p>
              <div style={{ marginTop: '14px' }}>
                <input
                  type="email"
                  className="admin-search-input"
                  value={emailModal.email}
                  onChange={(e) => setEmailModal((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="company@example.com"
                  autoFocus
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div className="admin-confirm-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEmailModal({ isOpen: false, company: null, email: '' })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveEmail}
                disabled={!emailModal.email.trim() || processingId === emailModal.company.id}
              >
                Save Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Reminder Modal */}
      {reminderModal.isOpen && reminderModal.company && (
        <div
          className="modal-backdrop"
          onClick={() => !reminderModal.sending && setReminderModal({ isOpen: false, company: null, recipientEmail: '', sending: false })}
        >
          <div className="modal-content admin-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-confirm-header">
              <h3>Send Subscription Reminder</h3>
            </div>
            <div className="admin-confirm-body">
              {/* Warning if email is not yet configured */}
              {!emailConfig.configured && (
                <div
                  style={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    marginBottom: '14px',
                    fontSize: '13px',
                    color: '#fde68a',
                    lineHeight: 1.4,
                  }}
                >
                  <strong>⚠️ Gmail is not connected yet!</strong>
                  <div style={{ marginTop: '4px', color: '#cbd5e1' }}>
                    Real emails cannot be delivered until you enter your Gmail &amp; 16-digit Google App Password.
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setReminderModal({ isOpen: false, company: null, recipientEmail: '', sending: false })
                      setEmailSettingsModal({
                        isOpen: true,
                        user: emailConfig.rawUser || '',
                        pass: '',
                        senderName: emailConfig.senderName || 'PackageUndakam Admin',
                        saving: false,
                        error: '',
                      })
                    }}
                    style={{ marginTop: '8px', fontSize: '12px', padding: '4px 10px' }}
                  >
                    ⚙️ Connect Gmail Now
                  </button>
                </div>
              )}

              <p>
                Send monthly subscription reminder email to <strong>{reminderModal.company.name}</strong>.
              </p>
              <div style={{ marginTop: '14px', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Recipient Email (You can edit before sending):
                </label>
                <input
                  type="email"
                  className="admin-search-input"
                  value={reminderModal.recipientEmail}
                  onChange={(e) => setReminderModal((prev) => ({ ...prev, recipientEmail: e.target.value }))}
                  placeholder="recipient@example.com"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  disabled={reminderModal.sending}
                />
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                Payment Status: <strong style={{ color: reminderModal.company.paymentStatus === 'paid' ? '#34d399' : '#f87171' }}>
                  {reminderModal.company.paymentStatus.toUpperCase()}
                </strong>
                {reminderModal.company.lastReminderSent && (
                  <span> &bull; Last reminder sent: {formatDateTime(reminderModal.company.lastReminderSent)}</span>
                )}
              </p>
            </div>
            <div className="admin-confirm-actions">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={reminderModal.sending}
                onClick={() => setReminderModal({ isOpen: false, company: null, recipientEmail: '', sending: false })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSendReminder}
                disabled={reminderModal.sending || !reminderModal.recipientEmail.trim()}
              >
                {reminderModal.sending ? 'Sending...' : 'Send Email Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email / Gmail Settings Configuration Modal */}
      {emailSettingsModal.isOpen && (
        <div
          className="modal-backdrop"
          onClick={() => !emailSettingsModal.saving && setEmailSettingsModal({ isOpen: false, user: '', pass: '', senderName: '', saving: false, error: '' })}
        >
          <div
            className="modal-content admin-confirm-modal"
            style={{ maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-confirm-header">
              <h3>Configure Gmail For Reminders</h3>
            </div>

            <form onSubmit={handleSaveEmailSettings}>
              <div className="admin-confirm-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div
                  style={{
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '8px',
                    padding: '14px',
                    fontSize: '13px',
                    color: '#cbd5e1',
                    lineHeight: 1.5,
                    marginBottom: '18px',
                  }}
                >
                  <strong style={{ color: '#60a5fa', display: 'block', marginBottom: '6px' }}>
                    How to get your 16-character Google App Password:
                  </strong>
                  <ol style={{ margin: 0, paddingLeft: '18px' }}>
                    <li>Open your Google Account: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" style={{ color: '#93c5fd', textDecoration: 'underline' }}>myaccount.google.com/apppasswords</a></li>
                    <li>Ensure <strong>2-Step Verification</strong> is enabled on your Gmail.</li>
                    <li>Enter <strong>PackageUndakam</strong> as the App name and click <strong>Create</strong>.</li>
                    <li>Copy the <strong>16-letter password</strong> Google shows you and paste it below.</li>
                  </ol>
                </div>

                {emailSettingsModal.error && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#fca5a5',
                      fontSize: '13px',
                      marginBottom: '14px',
                      lineHeight: 1.4,
                    }}
                  >
                    {emailSettingsModal.error}
                  </div>
                )}

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                    Your Gmail Address:
                  </label>
                  <input
                    type="email"
                    className="admin-search-input"
                    value={emailSettingsModal.user}
                    onChange={(e) => setEmailSettingsModal((prev) => ({ ...prev, user: e.target.value }))}
                    placeholder="e.g. yourname@gmail.com"
                    required
                    disabled={emailSettingsModal.saving}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                    16-Character Google App Password:
                  </label>
                  <input
                    type="password"
                    className="admin-search-input"
                    value={emailSettingsModal.pass}
                    onChange={(e) => setEmailSettingsModal((prev) => ({ ...prev, pass: e.target.value }))}
                    placeholder="e.g. abcd efgh ijkl mnop"
                    required={!emailConfig.configured}
                    disabled={emailSettingsModal.saving}
                    style={{ width: '100%', boxSizing: 'border-box', letterSpacing: '1px' }}
                  />
                  {emailConfig.configured && (
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                      (Leave blank to keep existing saved password)
                    </span>
                  )}
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                    Sender Display Name:
                  </label>
                  <input
                    type="text"
                    className="admin-search-input"
                    value={emailSettingsModal.senderName}
                    onChange={(e) => setEmailSettingsModal((prev) => ({ ...prev, senderName: e.target.value }))}
                    placeholder="e.g. PackageUndakam Admin"
                    disabled={emailSettingsModal.saving}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div className="admin-confirm-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={emailSettingsModal.saving}
                  onClick={() => setEmailSettingsModal({ isOpen: false, user: '', pass: '', senderName: '', saving: false, error: '' })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={emailSettingsModal.saving || !emailSettingsModal.user.trim()}
                >
                  {emailSettingsModal.saving ? 'Verifying with Google...' : 'Verify & Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toast.message && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '12px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
          }}
        >
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>✓</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}
