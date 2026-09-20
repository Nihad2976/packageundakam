import { useState, useEffect } from 'react'

export default function MonthlyReminderBanner({ user }) {
  const [dismissed, setDismissed] = useState(false)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const currentDay = now.getDate()
  const daysRemaining = totalDays - currentDay

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
  const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const dueDate = new Date(year, month, totalDays).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const isMonthEnd = daysRemaining <= 5
  const isUnpaid = user?.paymentStatus === 'unpaid'
  const isCompany = Boolean(user && user.role !== 'admin')

  useEffect(() => {
    const isDismissed = sessionStorage.getItem(`pkg_reminder_dismissed_${monthKey}`)
    if (isDismissed) {
      setDismissed(true)
    }
  }, [monthKey])

  const handleDismiss = () => {
    sessionStorage.setItem(`pkg_reminder_dismissed_${monthKey}`, 'true')
    setDismissed(true)
  }

  // Only display banner for company accounts if it's the last 5 days of the month OR if marked as unpaid
  if (!isCompany || (!isMonthEnd && !isUnpaid) || dismissed) {
    return null
  }

  return (
    <div
      className="monthly-reminder-banner"
      style={{
        background: isUnpaid
          ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.12) 0%, rgba(245, 158, 11, 0.12) 100%)'
          : 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.18) 100%)',
        border: `1px solid ${isUnpaid ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
        borderRadius: '10px',
        padding: '14px 18px',
        marginBottom: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: isUnpaid ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: isUnpaid ? '#f87171' : '#fbbf24',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#f0f6fc' }}>
              Monthly Subscription Reminder
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                padding: '2px 7px',
                borderRadius: '4px',
                background: isUnpaid ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                color: isUnpaid ? '#fca5a5' : '#fde68a',
              }}
            >
              {isUnpaid ? 'Payment Due' : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left`}
            </span>
          </div>

          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.4 }}>
            {isUnpaid ? (
              <>
                Your monthly subscription for <strong>{monthName}</strong> is currently pending. Please contact the administrator to complete your payment.
              </>
            ) : (
              <>
                The monthly subscription cycle for <strong>{monthName}</strong> concludes on <strong>{dueDate}</strong>. Please ensure payment is arranged to maintain uninterrupted package generation.
              </>
            )}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        title="Dismiss reminder for this session"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#f8fafc')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  )
}
