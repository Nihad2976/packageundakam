import {
  buildGreeting,
  formatPrice,
  getSelectedServices,
  getCoverageLabel,
  getActiveRoles,
  groupCoveragesBySide,
} from '../utils/quotation'
import { PAYMENT_TERMS, TEAM_ROLES, SERVICES } from '../constants/quotation'

export default function QuotationPage2({ quotation, scale = 1, id = 'quotation-page-2' }) {
  const greeting = buildGreeting(
    quotation.clientType,
    quotation.groomName,
    quotation.brideName,
  )
  const selectedServices = getSelectedServices(quotation.services)
  const coverages = quotation.coverages || []
  const groupedCoverages = groupCoveragesBySide(coverages)

  const totalRoles = coverages.reduce((sum, c) => sum + getActiveRoles(c).length, 0)
  const overviewDensityClass =
    totalRoles > 16 || coverages.length > 4
      ? 'overview-compact-sm'
      : totalRoles > 8 || coverages.length > 2
        ? 'overview-compact'
        : ''

  const totalActiveCoverages = coverages.filter((c) => getActiveRoles(c).length > 0).length
  const centeredClass = totalActiveCoverages > 3 ? 'overview-centered' : ''

  const getRoleLabel = (roleId) => TEAM_ROLES.find((r) => r.id === roleId)?.label || roleId

  const renderEventList = (eventCoverages) => {
    const activeCoverages = eventCoverages.filter((c) => getActiveRoles(c).length > 0)
    const count = Math.min(activeCoverages.length, 2)
    return (
      <div className="pdf-column-events" style={{ '--event-count': count || 1 }}>
        {activeCoverages.map((coverage) => {
          const activeRoles = getActiveRoles(coverage)
          return (
            <div key={coverage.id} className="pdf-event-item">
              {coverage.date && <div className="pdf-event-date">{coverage.date}</div>}
              <div className="pdf-event-name">{getCoverageLabel(coverage)}</div>
              <ul className="pdf-event-roles">
                {activeRoles.map((role) => (
                  <li key={role.id}>
                    {role.quantity} {getRoleLabel(role.id)}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    )
  }

  const hasBride = groupedCoverages.bride.length > 0
  const hasGroom = groupedCoverages.groom.length > 0
  const hasBoth = groupedCoverages.both.length > 0

  return (
    <div
      id={id}
      className="pdf-template-page2"
      style={{ transform: scale !== 1 ? `scale(${scale})` : undefined }}
    >
      {/* Decorative dark bar on the left edge */}
      <div className="pdf-left-stripe"></div>

      {/* Decorative top-right concentric arch graphics */}
      <svg className="pdf-top-arch" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M200 140C122.68 140 60 77.32 60 0H100C100 55.228 144.772 100 200 100V140Z" fill="#d2c9bd" fillOpacity="0.4" />
        <path d="M200 200C89.543 200 0 110.457 0 0H30C30 93.888 106.112 170 200 170V200Z" fill="#c4b9aa" fillOpacity="0.3" />
      </svg>

      {/* Decorative bottom-right concentric arch graphics */}
      <svg className="pdf-bottom-arch" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M200 60C122.68 60 60 122.68 60 200H100C100 144.772 144.772 100 200 100V60Z" fill="#d2c9bd" fillOpacity="0.5" />
        <path d="M200 0C89.543 0 0 89.543 0 200H30C30 106.112 106.112 30 200 30V0Z" fill="#c4b9aa" fillOpacity="0.4" />
      </svg>

      <div className="pdf-page2-container">
        <header className="pdf-header-row">
          <div className="pdf-page-indicator">Page 1 of 2</div>
          <div className="pdf-brand-logo">
            <span className="brand-naj">NAJ</span>
            <span className="brand-wedding">WEDDING</span>
          </div>
        </header>

        <section className="pdf-greeting-section">
          <p className="pdf-intro-p">
            <strong>{greeting}</strong>
            <br />
            Thank you for choosing <strong>NAJ WEDDING</strong> for your special occasion. We truly
            appreciate the opportunity to be a part of your memorable moments.
            Please find below the details of our services and terms. Kindly read the
            agreement carefully and feel free to contact us if you have any questions.
          </p>
        </section>

        {coverages.length > 0 && (
          <section className={`pdf-overview-section ${overviewDensityClass} ${centeredClass}`}>
            <div className="pdf-overview-pill-container">
              <span className="pdf-overview-pill">| Service Overview |</span>
            </div>

            <div className="pdf-overview-columns">
              {hasBride && (
                <div className="pdf-column">
                  <div className="pdf-column-header">BRIDE</div>
                  {renderEventList(groupedCoverages.bride)}
                </div>
              )}

              {hasGroom && (
                <div className="pdf-column">
                  <div className="pdf-column-header">GROOM</div>
                  {renderEventList(groupedCoverages.groom)}
                </div>
              )}

              {hasBoth && (
                <div className="pdf-column full-width-col">
                  {hasBride || hasGroom ? <div className="pdf-column-header">COMBINED</div> : null}
                  {renderEventList(groupedCoverages.both)}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="pdf-deliverables-section">
          <h3 className="pdf-section-title">Services &amp; Deliverables</h3>
          <ul className="pdf-deliverables-list">
            {selectedServices.map((service) => {
              const serviceDef = SERVICES.find((s) => s.id === service.id)
              const showQty = service.quantity > 1 && !serviceDef?.hasPhotoQuantity
              return (
                <li key={service.id}>
                  {service.displayName}
                  {showQty && <span className="pdf-qty"> x{service.quantity}</span>}
                </li>
              )
            })}
          </ul>
        </section>

        <section className="pdf-payment-section">
          <h3 className="pdf-section-title">Payment Terms</h3>
          <p className="pdf-package-total">
            Total Package Cost: <strong>{formatPrice(quotation.price)}</strong>
          </p>
          <p className="pdf-schedule-title">Payment schedule:</p>
          <ul className="pdf-payment-schedule-list">
            {PAYMENT_TERMS.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
          <p className="pdf-payment-footnote">
            Final deliverables (album/video/soft copy) will be released only after full payment is completed.
          </p>
        </section>
      </div>
    </div>
  )
}
