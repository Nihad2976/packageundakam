import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { generateQuotationPdf, downloadPdfBytes, pdfBytesToBase64 } from '../utils/pdf'
import QuotationPage2 from './QuotationPage2'

const DEFAULT_EVENTS = [
  {
    id: '1',
    name: 'Mehandi Night',
    services: ['1 Traditional Photographer', '1 Traditional Cinematographer'],
  },
  {
    id: '2',
    name: 'Wedding Day',
    services: ['1 Traditional Photographer', '1 Traditional Cinematographer'],
  },
]

const DEFAULT_DELIVERABLES = [
  'Edited Photos',
  'Spot Edited Photos (For Story/Status)',
  'Couple Reel',
  'Function Reel',
  'Complimentary Post-Wedding Shoot (Photo & Video)',
  '40 Leaf Premium Luster Laminated Album',
  '10 Extra Leaves (Complimentary)',
  '10 Leaf Mini Album',
  'Photo Calendar',
  'Photo Frame',
  'Wedding Highlights (3 to 7 min)',
  'Wedding Full Length Video (10+ min)',
  'Drone Service',
  'Live QR Photo Service',
  'Soft Copy (Provided via Pendrive)',
]

export default function FewdaysQuotationForm({ initialData = null, quotationId: initialQuotationId = null }) {
  const navigate = useNavigate()

  const [clientName, setClientName] = useState(initialData?.clientName || 'Safwan')
  const [events, setEvents] = useState(
    initialData?.events && initialData.events.length > 0
      ? initialData.events
      : DEFAULT_EVENTS
  )
  const [deliverables, setDeliverables] = useState(
    initialData?.deliverables && initialData.deliverables.length > 0
      ? initialData.deliverables
      : DEFAULT_DELIVERABLES
  )
  const [price, setPrice] = useState(initialData?.price ?? 119000)
  const [quotationId, setQuotationId] = useState(initialQuotationId)
  const [generating, setGenerating] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    if (initialData) {
      if (initialData.clientName !== undefined) setClientName(initialData.clientName)
      if (initialData.events && initialData.events.length > 0) setEvents(initialData.events)
      if (initialData.deliverables && initialData.deliverables.length > 0) setDeliverables(initialData.deliverables)
      if (initialData.price !== undefined) setPrice(initialData.price)
    }
    if (initialQuotationId) {
      setQuotationId(initialQuotationId)
    }
  }, [initialData, initialQuotationId])

  // Format price in Indian Rupee format
  const formattedPrice = Number(price || 0).toLocaleString('en-IN')

  // --- Events Handlers ---
  const handleAddEvent = () => {
    setEvents([
      ...events,
      {
        id: String(Date.now()),
        name: 'New Event',
        services: ['1 Traditional Photographer', '1 Traditional Cinematographer'],
      },
    ])
  }

  const handleRemoveEvent = (index) => {
    if (events.length <= 1) {
      alert('You must have at least one event in the Service Overview.')
      return
    }
    setEvents(events.filter((_, i) => i !== index))
  }

  const handleEventNameChange = (index, value) => {
    const updated = [...events]
    updated[index] = { ...updated[index], name: value }
    setEvents(updated)
  }

  const handleAddService = (eventIndex) => {
    const updated = [...events]
    const services = [...(updated[eventIndex].services || []), '1 Traditional Photographer']
    updated[eventIndex] = { ...updated[eventIndex], services }
    setEvents(updated)
  }

  const handleRemoveService = (eventIndex, serviceIndex) => {
    const updated = [...events]
    const services = updated[eventIndex].services.filter((_, i) => i !== serviceIndex)
    updated[eventIndex] = { ...updated[eventIndex], services }
    setEvents(updated)
  }

  const handleServiceChange = (eventIndex, serviceIndex, value) => {
    const updated = [...events]
    const services = [...updated[eventIndex].services]
    services[serviceIndex] = value
    updated[eventIndex] = { ...updated[eventIndex], services }
    setEvents(updated)
  }

  // --- Deliverables Handlers ---
  const handleAddDeliverable = () => {
    setDeliverables([...deliverables, 'New Deliverable'])
  }

  const handleRemoveDeliverable = (index) => {
    setDeliverables(deliverables.filter((_, i) => i !== index))
  }

  const handleDeliverableChange = (index, value) => {
    const updated = [...deliverables]
    updated[index] = value
    setDeliverables(updated)
  }

  const handleMoveDeliverable = (index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= deliverables.length) return
    const updated = [...deliverables]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setDeliverables(updated)
  }

  // Build the quotation object
  const quotationData = {
    id: quotationId,
    company: 'fewdays',
    clientName: clientName.trim(),
    events,
    deliverables,
    price: Number(price) || 0,
    updatedAt: new Date().toISOString(),
  }

  // --- Generate Quotation Handler ---
  const handleGenerateQuotation = async () => {
    if (!clientName.trim()) {
      alert('Please enter a Client Name before generating the quotation.')
      return
    }

    setGenerating(true)
    setStatusMessage('Saving & Generating PDF...')

    try {
      // 1. Save / sync to backend
      let savedId = quotationId
      try {
        if (quotationId) {
          await api.updateQuotation(quotationId, quotationData)
        } else {
          const res = await api.createQuotation(quotationData)
          if (res?.id) {
            savedId = res.id
            setQuotationId(res.id)
          }
        }
      } catch (saveErr) {
        console.warn('Could not save to backend, continuing with PDF generation:', saveErr)
      }

      // 2. Generate PDF with page2Element
      const page2El = document.getElementById('fewdays-quotation-page-2-render')
      if (!page2El) {
        throw new Error('Could not find Page 2 render element.')
      }

      const pdfBytes = await generateQuotationPdf(page2El, 'fewdays', quotationData)

      // 3. Save PDF to backend so Dashboard download works
      const safeName = (clientName || 'Safwan').trim().replace(/[^a-zA-Z0-9_-]/g, '_')
      const fileName = `Fewdays_Stories_Quotation_${safeName}.pdf`
      try {
        if (savedId) {
          const base64 = pdfBytesToBase64(pdfBytes)
          await api.savePdf(savedId, base64, fileName)
        }
      } catch (pdfSaveErr) {
        console.warn('Could not save PDF to backend:', pdfSaveErr)
      }

      // 4. Trigger download
      await downloadPdfBytes(pdfBytes, fileName)

      setStatusMessage('Quotation generated and downloaded successfully!')
      setTimeout(() => setStatusMessage(''), 4000)
    } catch (err) {
      console.error('Failed to generate quotation PDF:', err)
      alert('Failed to generate quotation PDF: ' + (err.message || 'Unknown error'))
      setStatusMessage('')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="fewdays-quotation-wrapper">
      {/* Brand Header */}
      <div className="fewdays-header-card">
        <div className="fewdays-header-content">
          <div className="fewdays-brand-title">Fewdays stories</div>
          <div className="fewdays-brand-subtitle">WEDDING PHOTOGRAPHY &amp; VIDEOGRAPHY</div>
          <div className="fewdays-brand-badge">DEDICATED QUOTATION GENERATOR</div>
        </div>
        <button
          type="button"
          className="fewdays-back-dashboard-btn"
          onClick={() => navigate('/')}
        >
          &larr; Back to Dashboard
        </button>
      </div>

      <div className="fewdays-form-container">
        {/* Section 1: Client Name */}
        <div className="fewdays-card">
          <label htmlFor="fewdaysClientName" className="fewdays-card-label">
            Client Name
          </label>
          <input
            id="fewdaysClientName"
            type="text"
            className="fewdays-input-text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g. Safwan or Hiba"
          />
          <p className="fewdays-field-hint">
            Page 1 will display: <strong>Hello {clientName || '{clientName}'},</strong>
          </p>
        </div>

        {/* Section 2: Service Overview */}
        <div className="fewdays-card">
          <div className="fewdays-card-header-row">
            <label className="fewdays-card-label">SERVICE OVERVIEW</label>
            <button
              type="button"
              className="fewdays-btn-secondary"
              onClick={handleAddEvent}
            >
              + Add Event
            </button>
          </div>

          <div className="fewdays-events-container">
            {events.map((event, eIdx) => (
              <div key={event.id || eIdx} className="fewdays-event-editor-card">
                <div className="fewdays-event-editor-header">
                  <div className="fewdays-event-name-field">
                    <span className="fewdays-event-index">Event {eIdx + 1}:</span>
                    <input
                      type="text"
                      className="fewdays-input-event-name"
                      value={event.name}
                      onChange={(e) => handleEventNameChange(eIdx, e.target.value)}
                      placeholder="e.g. Mehandi Night, Wedding Day"
                    />
                  </div>
                  {events.length > 1 && (
                    <button
                      type="button"
                      className="fewdays-btn-remove-event"
                      onClick={() => handleRemoveEvent(eIdx)}
                      title="Remove Event"
                    >
                      &times; Remove Event
                    </button>
                  )}
                </div>

                <div className="fewdays-services-editor-list">
                  <div className="fewdays-services-label">Services under this event:</div>
                  {(event.services || []).map((serviceText, sIdx) => (
                    <div key={sIdx} className="fewdays-service-row">
                      <input
                        type="text"
                        className="fewdays-input-service"
                        value={serviceText}
                        onChange={(e) => handleServiceChange(eIdx, sIdx, e.target.value)}
                        placeholder="e.g. 1 Traditional Photographer"
                      />
                      <button
                        type="button"
                        className="fewdays-btn-icon-remove"
                        onClick={() => handleRemoveService(eIdx, sIdx)}
                        title="Remove Service"
                      >
                        &times;
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="fewdays-btn-add-service"
                    onClick={() => handleAddService(eIdx)}
                  >
                    + Add Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Deliverables */}
        <div className="fewdays-card">
          <div className="fewdays-card-header-row">
            <label className="fewdays-card-label">DELIVERABLES</label>
            <button
              type="button"
              className="fewdays-btn-secondary"
              onClick={handleAddDeliverable}
            >
              + Add Deliverable
            </button>
          </div>

          <div className="fewdays-deliverables-editor-list">
            {deliverables.map((item, dIdx) => (
              <div key={dIdx} className="fewdays-deliverable-row">
                <span className="fewdays-drag-indicator">•</span>
                <input
                  type="text"
                  className="fewdays-input-deliverable"
                  value={item}
                  onChange={(e) => handleDeliverableChange(dIdx, e.target.value)}
                  placeholder="Deliverable description"
                />
                <div className="fewdays-reorder-buttons">
                  <button
                    type="button"
                    className="fewdays-btn-reorder"
                    onClick={() => handleMoveDeliverable(dIdx, -1)}
                    disabled={dIdx === 0}
                    title="Move Up"
                  >
                    &uarr;
                  </button>
                  <button
                    type="button"
                    className="fewdays-btn-reorder"
                    onClick={() => handleMoveDeliverable(dIdx, 1)}
                    disabled={dIdx === deliverables.length - 1}
                    title="Move Down"
                  >
                    &darr;
                  </button>
                </div>
                <button
                  type="button"
                  className="fewdays-btn-icon-remove"
                  onClick={() => handleRemoveDeliverable(dIdx)}
                  title="Remove Deliverable"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Package Price */}
        <div className="fewdays-card">
          <label htmlFor="fewdaysPrice" className="fewdays-card-label">
            PACKAGE PRICE
          </label>
          <div className="fewdays-price-input-row">
            <span className="fewdays-currency-symbol">₹</span>
            <input
              id="fewdaysPrice"
              type="number"
              className="fewdays-input-price"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="e.g. 119000"
            />
          </div>
          <div className="fewdays-price-display-preview">
            Total Package Cost: <strong>₹{formattedPrice}</strong>
          </div>
        </div>

        {/* Action Button */}
        <div className="fewdays-action-container">
          <button
            type="button"
            className="fewdays-generate-btn"
            onClick={handleGenerateQuotation}
            disabled={generating}
          >
            {generating ? (
              <>
                <span className="fewdays-spinner"></span> Generating FEWDAYS Quotation...
              </>
            ) : (
              'GENERATE QUOTATION'
            )}
          </button>
          {statusMessage && <div className="fewdays-status-msg">{statusMessage}</div>}
        </div>
      </div>

      {/* Hidden Page 2 element for html2canvas to capture */}
      <div className="fewdays-offscreen-render-container" aria-hidden="true">
        <QuotationPage2
          quotation={quotationData}
          company="fewdays"
          id="fewdays-quotation-page-2-render"
        />
      </div>
    </div>
  )
}
