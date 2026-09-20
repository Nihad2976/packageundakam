import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import QuantityControl from '../components/QuantityControl'
import { PreviewStep } from './Preview'
import {
  CLIENT_TYPES,
  PACKAGES,
  PACKAGE_LABELS,
  COVERAGE_TYPES,
  COVERAGE_LABELS,
  COVERAGE_SIDES,
  COVERAGE_SIDE_LABELS,
  SERVICES,
  getServicesForCompany,
  getPackagePresetsForCompany,
  TEAM_ROLES,
  getTeamRolesForCompany,
  FORM_STEPS,
  LEAF_OPTIONS,
  MONTHS,
} from '../constants/quotation'
import {
  createEmptyQuotation,
  buildPresetServices,
  createEmptyCoverage,
  buildGreeting,
  getDayWithSuffix,
  parseMonthAndDay,
} from '../utils/quotation'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'

function StepNav({ currentStep, onStepClick, maxStep }) {
  return (
    <nav className="step-nav">
      {FORM_STEPS.map((step, index) => (
        <button
          key={step.id}
          type="button"
          className={`step-nav-item ${index === currentStep ? 'active' : ''} ${index <= maxStep ? 'reachable' : ''}`}
          onClick={() => index <= maxStep && onStepClick(index)}
          disabled={index > maxStep}
        >
          <span className="step-num">{index + 1}</span>
          {step.label}
        </button>
      ))}
    </nav>
  )
}

function ClientStep({ data, onChange, company }) {
  const currentCompany = data.company || company || 'naj'
  const isLitheAds = currentCompany === 'litheads'

  if (isLitheAds) {
    const clientName = data.clientName || ''
    const displayGreeting =
      data.greeting?.trim() ||
      (clientName.trim()
        ? (clientName.trim().toLowerCase().startsWith('hi ') ? clientName.trim() : `Hi ${clientName.trim()}`)
        : '')

    return (
      <div className="form-step">
        <h2>Client Details</h2>
        <div className="form-field">
          <label htmlFor="clientName">Client Name</label>
          <input
            id="clientName"
            type="text"
            value={clientName}
            onChange={(e) => {
              const val = e.target.value
              onChange({
                clientName: val,
                greeting: val.trim()
                  ? (val.trim().toLowerCase().startsWith('hi ') ? val.trim() : `Hi ${val.trim()}`)
                  : '',
              })
            }}
            placeholder="e.g. Rukzana Gafoor"
          />
          <p className="form-hint">Enter the client name for the first page cover greeting.</p>
        </div>

        <div className="greeting-preview">
          <span>First page greeting:</span>
          <strong>{displayGreeting || '—'}</strong>
        </div>
      </div>
    )
  }

  return (
    <div className="form-step">
      <h2>Client</h2>

      <div className="radio-group">
        {[
          { value: CLIENT_TYPES.GROOM, label: 'Groom' },
          { value: CLIENT_TYPES.BRIDE, label: 'Bride' },
          { value: CLIENT_TYPES.BOTH, label: 'Groom & Bride' },
        ].map((opt) => (
          <label key={opt.value} className="radio-card">
            <input
              type="radio"
              name="clientType"
              value={opt.value}
              checked={data.clientType === opt.value}
              onChange={() => onChange({ clientType: opt.value })}
            />
            {opt.label}
          </label>
        ))}
      </div>

      {(data.clientType === CLIENT_TYPES.GROOM || data.clientType === CLIENT_TYPES.BOTH) && (
        <div className="form-field">
          <label htmlFor="groomName">Groom Name</label>
          <input
            id="groomName"
            type="text"
            value={data.groomName}
            onChange={(e) => onChange({ groomName: e.target.value })}
            placeholder="e.g. Sabir"
          />
        </div>
      )}

      {(data.clientType === CLIENT_TYPES.BRIDE || data.clientType === CLIENT_TYPES.BOTH) && (
        <div className="form-field">
          <label htmlFor="brideName">Bride Name</label>
          <input
            id="brideName"
            type="text"
            value={data.brideName}
            onChange={(e) => onChange({ brideName: e.target.value })}
            placeholder="e.g. Shahana"
          />
        </div>
      )}

      <div className="greeting-preview">
        <span>Greeting preview:</span>
        <strong>{buildGreeting(data.clientType, data.groomName, data.brideName)}</strong>
      </div>
    </div>
  )
}

function PackageStep({ data, onChange, company }) {
  const currentCompany = data.company || company || 'naj'

  const handlePackageChange = (pkg) => {
    onChange({
      package: pkg,
      services: buildPresetServices(pkg, currentCompany),
    })
  }

  return (
    <div className="form-step">
      <h2>Package</h2>
      <div className="radio-group">
        {Object.entries(PACKAGE_LABELS).map(([value, label]) => (
          <label key={value} className="radio-card">
            <input
              type="radio"
              name="package"
              value={value}
              checked={data.package === value}
              onChange={() => handlePackageChange(value)}
            />
            {label}
          </label>
        ))}
      </div>

      <p className="form-hint">Package price is entered manually in the Price step.</p>
    </div>
  )
}

function CoverageStep({ data, onChange, company }) {
  const currentCompany = data.company || company || 'naj'
  const isLitheAds = currentCompany === 'litheads'
  const teamRoles = getTeamRolesForCompany(currentCompany)
  const [showAddMenu, setShowAddMenu] = useState(false)

  const addCoverage = (type) => {
    const newCoverage = createEmptyCoverage(type, '', null, '', currentCompany)
    onChange({ coverages: [...data.coverages, newCoverage] })
    setShowAddMenu(false)
  }

  const addCustomCoverage = () => {
    const name = prompt('Enter event name (e.g. Mehndi, Wedding, Reception):')
    if (name?.trim()) {
      const newCoverage = createEmptyCoverage(COVERAGE_TYPES.CUSTOM, name.trim(), null, '', currentCompany)
      onChange({ coverages: [...data.coverages, newCoverage] })
    }
    setShowAddMenu(false)
  }

  const removeCoverage = (id) => {
    onChange({ coverages: data.coverages.filter((c) => c.id !== id) })
  }

  const updateCoverage = (id, updates) => {
    onChange({
      coverages: data.coverages.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })
  }

  const toggleRole = (coverageId, roleId) => {
    onChange({
      coverages: data.coverages.map((c) => {
        if (c.id !== coverageId) return c
        const roleExists = c.roles.some((r) => r.id === roleId)
        const updatedRoles = roleExists
          ? c.roles.map((r) => {
              if (r.id !== roleId) return r
              const selected = !r.selected
              return { ...r, selected, quantity: selected ? Math.max(1, r.quantity || 1) : 0 }
            })
          : [...c.roles, { id: roleId, selected: true, quantity: 1 }]
        return {
          ...c,
          roles: updatedRoles,
        }
      }),
    })
  }

  const setRoleQuantity = (coverageId, roleId, quantity) => {
    onChange({
      coverages: data.coverages.map((c) => {
        if (c.id !== coverageId) return c
        return {
          ...c,
          roles: c.roles.map((r) => (r.id === roleId ? { ...r, quantity } : r)),
        }
      }),
    })
  }

  const handleLitheMonthChange = (coverageId, newMonth) => {
    const cov = data.coverages.find((c) => c.id === coverageId)
    let day = cov?.day
    if (!day) {
      const parsed = parseMonthAndDay(cov?.date)
      day = parsed.day
    }
    const dayWithSuffix = getDayWithSuffix(day)
    const monthShort = newMonth.slice(0, 3)
    const date = `${monthShort} ${dayWithSuffix}`
    updateCoverage(coverageId, { month: newMonth, day, date })
  }

  const handleLitheDayChange = (coverageId, newDay) => {
    const cov = data.coverages.find((c) => c.id === coverageId)
    let month = cov?.month
    if (!month) {
      const parsed = parseMonthAndDay(cov?.date)
      month = parsed.month
    }
    const dayNum = Number(newDay)
    const dayWithSuffix = getDayWithSuffix(dayNum)
    const monthShort = month.slice(0, 3)
    const date = `${monthShort} ${dayWithSuffix}`
    updateCoverage(coverageId, { month, day: dayNum, date })
  }

  return (
    <div className="form-step">
      <h2>Coverage</h2>
      <p className="form-hint">
        {isLitheAds
          ? 'Select event month and date, specify event name, and photographer / videographer counts.'
          : 'Add event coverage sections, set their dates, and group them by Bride or Groom side.'}
      </p>

      {data.coverages.map((coverage, index) => (
        <div key={coverage.id} className="coverage-card">
          <div className="coverage-card-header">
            <h3>
              {index + 1}.{' '}
              {coverage.customName?.trim() ||
                (coverage.type === COVERAGE_TYPES.CUSTOM
                  ? 'Custom Event'
                  : COVERAGE_LABELS[coverage.type])}
            </h3>
            <button
              type="button"
              className="btn btn-text btn-danger"
              onClick={() => removeCoverage(coverage.id)}
            >
              Remove
            </button>
          </div>

          <div
            className="coverage-meta-grid"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'flex-start',
              marginBottom: '16px',
              width: '100%',
            }}
          >
            {isLitheAds ? (
              <>
                <div className="form-field-sm" style={{ flex: '0 0 160px', minWidth: '130px' }}>
                  <label htmlFor={`coverage-month-${coverage.id}`}>Month</label>
                  <select
                    id={`coverage-month-${coverage.id}`}
                    value={
                      coverage.month ||
                      parseMonthAndDay(coverage.date).month ||
                      'October'
                    }
                    onChange={(e) => handleLitheMonthChange(coverage.id, e.target.value)}
                    className="select-input"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field-sm" style={{ flex: '0 0 110px', minWidth: '90px' }}>
                  <label htmlFor={`coverage-day-${coverage.id}`}>Date</label>
                  <select
                    id={`coverage-day-${coverage.id}`}
                    value={
                      coverage.day ||
                      parseMonthAndDay(coverage.date).day ||
                      9
                    }
                    onChange={(e) => handleLitheDayChange(coverage.id, e.target.value)}
                    className="select-input"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div className="form-field-sm">
                <label>Event Date</label>
                <input
                  type="text"
                  placeholder="e.g. July 23"
                  value={coverage.date || ''}
                  onChange={(e) => updateCoverage(coverage.id, { date: e.target.value })}
                />
              </div>
            )}

            <div
              className="form-field-sm"
              style={isLitheAds ? { flex: '1 1 240px', minWidth: '200px' } : undefined}
            >
              <label>{isLitheAds ? 'Event Name' : 'Side / Section'}</label>
              {isLitheAds ? (
                <input
                  type="text"
                  placeholder="e.g. Mehandi night or Wedding day"
                  value={coverage.customName || ''}
                  onChange={(e) => updateCoverage(coverage.id, { customName: e.target.value })}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
              ) : (
                <select
                  value={coverage.side || COVERAGE_SIDES.BRIDE}
                  onChange={(e) => updateCoverage(coverage.id, { side: e.target.value })}
                  className="select-input"
                >
                  {Object.entries(COVERAGE_SIDE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {!isLitheAds && coverage.type === COVERAGE_TYPES.CUSTOM && (
              <div className="form-field-sm full-width">
                <label>Event Title</label>
                <input
                  type="text"
                  placeholder="Event title"
                  value={coverage.customName || ''}
                  onChange={(e) => updateCoverage(coverage.id, { customName: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="role-list">
            {teamRoles.map((role) => {
              const roleData = coverage.roles.find((r) => r.id === role.id)
              return (
                <div key={role.id} className="service-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={roleData?.selected || false}
                      onChange={() => toggleRole(coverage.id, role.id)}
                    />
                    {role.label}
                  </label>
                  {roleData?.selected && (
                    <QuantityControl
                      value={roleData.quantity}
                      onChange={(qty) => setRoleQuantity(coverage.id, role.id, qty)}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div className="add-coverage-wrapper">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setShowAddMenu(!showAddMenu)}
        >
          + ADD COVERAGE EVENT
        </button>
        {showAddMenu && (
          <div className="add-coverage-menu">
            <button type="button" onClick={() => addCoverage(COVERAGE_TYPES.CUSTOM)}>
              {isLitheAds ? 'New Event (Custom Name)' : 'Custom Event'}
            </button>
            <button type="button" onClick={() => addCoverage(COVERAGE_TYPES.BRIDE_EVE)}>
              Bride Eve
            </button>
            <button type="button" onClick={() => addCoverage(COVERAGE_TYPES.WEDDING_NIKKAH)}>
              Wedding Nikkah
            </button>
            <button type="button" onClick={() => addCoverage(COVERAGE_TYPES.GROOM_EVE)}>
              Groom Eve
            </button>
            <button type="button" onClick={() => addCoverage(COVERAGE_TYPES.WEDDING_DAY)}>
              Wedding Day
            </button>
            <button type="button" onClick={() => addCoverage(COVERAGE_TYPES.WEDDING_RECEPTION)}>
              Wedding Reception
            </button>
            <button type="button" onClick={() => addCoverage(COVERAGE_TYPES.ENGAGEMENT)}>
              Engagement
            </button>
            <button type="button" onClick={() => addCoverage(COVERAGE_TYPES.HALDI)}>
              Haldi
            </button>
            {!isLitheAds && (
              <button type="button" onClick={addCustomCoverage}>
                Prompt Event Name
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ServicesStep({ data, onChange, company }) {
  const currentCompany = data.company || company || 'naj'
  const isLitheAds = currentCompany === 'litheads'
  const serviceList = getServicesForCompany(currentCompany)

  const handlePackageChange = (pkg) => {
    onChange({
      package: pkg,
      services: buildPresetServices(pkg, currentCompany),
    })
  }

  const toggleService = (serviceId) => {
    onChange({
      services: data.services.map((s) => {
        if (s.id !== serviceId) return s
        const selected = !s.selected
        return { ...s, selected, quantity: selected ? 1 : 0 }
      }),
    })
  }

  const setQuantity = (serviceId, quantity) => {
    onChange({
      services: data.services.map((s) => (s.id === serviceId ? { ...s, quantity } : s)),
    })
  }

  const setPhotoQuantity = (serviceId, photoQuantity) => {
    onChange({
      services: data.services.map((s) => (s.id === serviceId ? { ...s, photoQuantity } : s)),
    })
  }

  const setLeafCount = (serviceId, leafCount) => {
    onChange({
      services: data.services.map((s) => (s.id === serviceId ? { ...s, leafCount: Number(leafCount) } : s)),
    })
  }

  const grouped = isLitheAds
    ? {
        deliverable: serviceList.filter((s) => s.category !== 'addon'),
        addon: serviceList.filter((s) => s.category === 'addon'),
      }
    : {
        video: serviceList.filter((s) => s.category === 'video'),
        photo: serviceList.filter((s) => s.category === 'photo'),
        other: serviceList.filter((s) => s.category === 'other'),
      }

  const renderService = (serviceDef) => {
    const service = data.services.find((s) => s.id === serviceDef.id)
    if (!service) return null

    const currentLeaves = service.leafCount || serviceDef.defaultLeaves || (isLitheAds || currentCompany === 'piktoria' ? 40 : 30)

    let displayName = service.customTitle || serviceDef.name
    if (!service.customTitle && serviceDef.hasLeafCount) {
      if (isLitheAds) {
        displayName = `${currentLeaves * 2} Pages Wedding Album`
      } else if (currentCompany === 'piktoria') {
        displayName = `${currentLeaves}-Leaf Wedding Album`
      } else {
        displayName = `${currentLeaves} Leaf Premium Album`
      }
    }

    return (
      <div key={serviceDef.id} className="service-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={service.selected}
            onChange={() => toggleService(serviceDef.id)}
          />
          {displayName}
        </label>
        {service.selected && (
          <div className="service-controls">
            {serviceDef.hasPhotoQuantity && (
              <input
                type="text"
                className="photo-qty-input"
                value={service.photoQuantity || ''}
                onChange={(e) => setPhotoQuantity(serviceDef.id, e.target.value)}
                placeholder="e.g. 200+"
              />
            )}
            {serviceDef.hasLeafCount && (
              <select
                className="leaf-select"
                value={currentLeaves}
                onChange={(e) => setLeafCount(serviceDef.id, e.target.value)}
                title="Select number of leaves"
              >
                {LEAF_OPTIONS.map((leaves) => (
                  <option key={leaves} value={leaves}>
                    {isLitheAds ? `${leaves * 2} Pages (${leaves} Leafs)` : `${leaves} Leafs`}
                  </option>
                ))}
              </select>
            )}
            {!serviceDef.hasPhotoQuantity && !serviceDef.hasLeafCount && !isLitheAds && (
              <QuantityControl
                value={service.quantity}
                onChange={(qty) => setQuantity(serviceDef.id, qty)}
              />
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="form-step">
      <h2>Services &amp; Deliverables</h2>

      <div className="package-switch-notice">
        <span>Package Preset:</span>
        {Object.entries(PACKAGE_LABELS).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`btn btn-sm ${data.package === value ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handlePackageChange(value)}
          >
            {label}
          </button>
        ))}
        <p className="form-hint">Switching package resets service selections to preset defaults.</p>
      </div>

      {isLitheAds ? (
        <>
          <div className="services-group">
            <h3>Deliverables</h3>
            {grouped.deliverable.map(renderService)}
          </div>

          <div className="services-group">
            <h3>Complimentary Add-ons</h3>
            {grouped.addon.map(renderService)}
          </div>
        </>
      ) : (
        <>
          <div className="services-group">
            <h3>Video</h3>
            {grouped.video.map(renderService)}
          </div>

          <div className="services-group">
            <h3>Photography / Album</h3>
            {grouped.photo.map(renderService)}
          </div>

          <div className="services-group">
            <h3>Other</h3>
            {grouped.other.map(renderService)}
          </div>
        </>
      )}
    </div>
  )
}

function PriceStep({ data, onChange, company }) {
  const currentCompany = data.company || company || 'naj'
  const isLitheAds = currentCompany === 'litheads'

  return (
    <div className="form-step">
      <h2>Price</h2>
      <div className="form-field">
        <label htmlFor="price">Total Package Cost</label>
        <div className="price-input-wrapper">
          <span className="currency">{isLitheAds ? '' : '₹'}</span>
          <input
            id="price"
            type="text"
            value={data.price}
            onChange={(e) => onChange({ price: e.target.value })}
            placeholder={isLitheAds ? 'e.g. 75,000' : 'e.g. 43000'}
          />
        </div>
      </div>

      <div className="payment-terms-fixed">
        <h3>Payment Policy {isLitheAds ? '(Lithe Ads)' : '(Fixed)'}</h3>
        <ul>
          {isLitheAds ? (
            <>
              <li>10% on Booking</li>
              <li>70% on wedding day</li>
              <li>20% after receiving output</li>
            </>
          ) : (
            <>
              <li>Advance: 4% (Booking confirmation)</li>
              <li>On Wedding Day: 66%</li>
              <li>After Final Delivery: 30%</li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}

export default function QuotationForm() {
  const { user, company } = useAuth()
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const saveTimer = useRef(null)

  const [currentStep, setCurrentStep] = useState(0)
  const [maxStep, setMaxStep] = useState(0)
  const [data, setData] = useState(() => createEmptyQuotation(company))
  const [quotationId, setQuotationId] = useState(null)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isNew) {
      setData(createEmptyQuotation(company))
      setQuotationId(null)
      setCurrentStep(0)
      setMaxStep(0)
      setLoading(false)
      return
    }

    setLoading(true)
    api
      .getQuotation(id)
      .then((q) => {
        setData({
          clientType: q.clientType,
          clientName: q.clientName || '',
          greeting: q.greeting || '',
          packageTitle: q.packageTitle || '',
          groomName: q.groomName || '',
          brideName: q.brideName || '',
          package: q.package,
          price: q.price || '',
          services: q.services,
          coverages: q.coverages || [],
          completed: q.completed,
          company: q.company || company,
        })
        setQuotationId(q.id)
        setMaxStep(FORM_STEPS.length - 1)
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, isNew, navigate, company])

  const updateData = useCallback(
    (updates) => {
      setData((prev) => ({ ...prev, ...updates }))
    },
    [],
  )

  const autoSave = useCallback(
    (newData) => {
      if (isNew || !quotationId) return

      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        setSaving(true)
        try {
          await api.updateQuotation(quotationId, { ...newData, completed: true })
        } catch (err) {
          console.error('Auto-save failed:', err)
        } finally {
          setSaving(false)
        }
      }, 800)
    },
    [isNew, quotationId],
  )

  useEffect(() => {
    if (!isNew && quotationId) {
      autoSave(data)
    }
  }, [data, isNew, quotationId, autoSave])

  const validateStep = (step) => {
    if (step === 0) {
      const currentCompany = data.company || company || 'naj'
      if (currentCompany === 'litheads') {
        const name = data.clientName !== undefined ? data.clientName : (data.brideName || data.groomName)
        return !!(name?.trim() || data.greeting?.trim())
      }
      if (data.clientType === CLIENT_TYPES.GROOM && !data.groomName?.trim()) return false
      if (data.clientType === CLIENT_TYPES.BRIDE && !data.brideName?.trim()) return false
      if (data.clientType === CLIENT_TYPES.BOTH) {
        return data.groomName?.trim() || data.brideName?.trim()
      }
    }
    if (step === 4 && !data.price?.trim()) return false
    return true
  }

  const goNext = async () => {
    if (!validateStep(currentStep)) {
      alert('Please fill in the required fields before continuing.')
      return
    }

    const nextStep = currentStep + 1

    if (currentStep === 4 && isNew) {
      try {
        const created = await api.createQuotation({ ...data, completed: true })
        setQuotationId(created.id)
      } catch (err) {
        alert('Failed to save quotation.')
        return
      }
    }

    if (nextStep > maxStep) setMaxStep(nextStep)
    setCurrentStep(nextStep)
  }

  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading quotation...</p>
      </div>
    )
  }

  const steps = [
    <ClientStep key="client" data={data} onChange={updateData} company={company} />,
    <PackageStep key="package" data={data} onChange={updateData} company={company} />,
    <CoverageStep key="coverage" data={data} onChange={updateData} company={company} />,
    <ServicesStep key="services" data={data} onChange={updateData} company={company} />,
    <PriceStep key="price" data={data} onChange={updateData} company={company} />,
    <PreviewStep
      key="preview"
      quotation={{ ...data, company: data.company || company }}
      quotationId={quotationId}
      onEdit={() => setCurrentStep(4)}
    />,
  ]

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }

  return (
    <div className="app-layout">
      {/* Left Sidebar */}
      <Sidebar activeTab="quotation" />

      {/* Main Right Viewport */}
      <main className="main-viewport">
        {/* Top Header Bar */}
        <header className="top-header">
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

        {/* Form Page Header & Content */}
        <div className="quotation-form-page" style={{ maxWidth: '840px', margin: 0, padding: 0 }}>
          <header className="form-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h1 className="dashboard-page-title">{isNew ? 'New Quotation' : 'Edit Quotation'}</h1>
              <p className="dashboard-page-subtitle">Configure package details, coverage, and services</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {saving && <span className="save-indicator">Saving...</span>}
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/')} style={{ fontSize: '13px', padding: '8px 16px' }}>
                ← Back to Dashboard
              </button>
            </div>
          </header>

          <StepNav
            currentStep={currentStep}
            maxStep={maxStep}
            onStepClick={setCurrentStep}
          />

          <div className="form-content" style={{ marginTop: '20px' }}>{steps[currentStep]}</div>

          {currentStep < FORM_STEPS.length - 1 && (
            <div className="form-nav" style={{ marginTop: '28px' }}>
              {currentStep > 0 && (
                <button type="button" className="btn btn-secondary" onClick={goBack}>
                  Back
                </button>
              )}
              <button type="button" className="btn btn-primary" onClick={goNext}>
                Continue
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
