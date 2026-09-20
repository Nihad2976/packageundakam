import { useAuth } from '../context/AuthContext'

export default function BlockedScreen() {
  const { user, logout } = useAuth()

  return (
    <div className="blocked-screen-container">
      <div className="blocked-screen-card">
        <div className="blocked-icon-wrapper">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
        </div>

        <h1 className="blocked-title">Account Blocked</h1>
        
        <p className="blocked-message">
          Your account ({user?.name || user?.email}) has been temporarily blocked due to pending monthly subscription payment.
        </p>

        <p className="blocked-submessage">
          Package generator and invoice creation are currently restricted. Please contact the system administrator to clear your dues and reactivate your account.
        </p>

        <div className="blocked-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={logout}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}
