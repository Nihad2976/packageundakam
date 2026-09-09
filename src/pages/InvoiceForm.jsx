import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../utils/api'
import InvoicePreview, { formatCurrency } from '../components/InvoicePreview'
import { generateInvoicePdf, pdfBytesToBase64 } from '../utils/pdf'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'

export default function InvoiceForm() {
  const { user, company } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'

  const [invoiceId, setInvoiceId] = useState(isNew ? null : id)
  const [customerName, setCustomerName] = useState(company === 'piktoria' ? 'HIBA' : 'Sanoof')
  const [items, setItems] = useState(
    company === 'piktoria'
      ? [
          { name: 'Package', quantity: 1, price: 40000 },
          { name: 'Travel', quantity: 1, price: 0 },
        ]
      : [
          { name: 'Package', quantity: 1, price: 20000 },
          { name: 'Travel', quantity: 1, price: 1000 },
        ]
  )
  const [advance, setAdvance] = useState(company === 'piktoria' ? 2000 : 10000)
  const [loading, setLoading] = useState(!isNew)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!isNew && id) {
      setLoading(true)
      api
        .getInvoice(id)
        .then((data) => {
          setInvoiceId(data.id)
          setCustomerName(data.customerName || '')
          if (Array.isArray(data.items) && data.items.length > 0) {
            setItems(data.items)
          }
          setAdvance(data.advance ?? 0)
        })
        .catch((err) => {
          console.error(err)
          alert('Failed to load invoice')
        })
        .finally(() => setLoading(false))
    }
  }, [id, isNew])

  // Live Auto Calculations
  const subTotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity || 0) * Number(item.price || 0)),
    0,
  )
  const balance = subTotal - (Number(advance) || 0)

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const handleAddItem = () => {
    setItems((prev) => [...prev, { name: '', quantity: 1, price: 0 }])
  }

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      alert('Invoice must have at least one item.')
      return
    }
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGenerateInvoice = async () => {
    if (!customerName.trim()) {
      alert('Please enter Customer Name (Invoice To).')
      return
    }

    setGenerating(true)
    try {
      const payload = {
        customerName: customerName.trim(),
        company,
        items: items.map((it) => ({
          name: it.name.trim() || 'Item',
          quantity: Number(it.quantity) || 1,
          price: Number(it.price) || 0,
          total: (Number(it.quantity) || 1) * (Number(it.price) || 0),
        })),
        subTotal,
        advance: Number(advance) || 0,
        balance,
        completed: true,
      }

      let currentId = invoiceId
      if (isNew || !currentId) {
        const created = await api.createInvoice(payload)
        currentId = created.id
        setInvoiceId(currentId)
      } else {
        await api.updateInvoice(currentId, payload)
      }

      const element = document.getElementById('invoice-render-page')
      if (!element) throw new Error('Invoice preview element not found')

      const pdfBytes = await generateInvoicePdf(element, company)
      const fileName = `${customerName.trim().replace(/\s+/g, '_')}_Invoice.pdf`
      const base64 = pdfBytesToBase64(pdfBytes)

      await api.saveInvoicePdf(currentId, base64, fileName)

      navigate(`/invoice/${currentId}/download`, {
        state: { pdfBytes, fileName },
      })
    } catch (err) {
      console.error(err)
      alert('Failed to generate invoice PDF. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }

  const invoiceData = {
    customerName,
    company,
    items,
    subTotal,
    advance,
    balance,
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar activeTab="invoice" />

      {/* Main Viewport */}
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

        {/* Page Content */}
        <div style={{ maxWidth: '840px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h1 className="dashboard-page-title">{isNew ? 'Create New Invoice' : 'Edit Invoice'}</h1>
              <p className="dashboard-page-subtitle">Fill in customer details and invoice items</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              ← Back to Dashboard
            </button>
          </div>

          {loading ? (
            <div className="form-container" style={{ background: '#fff', borderRadius: '12px', padding: '40px', border: '1px solid #efebe4', textAlign: 'center' }}>
              <p>Loading invoice details...</p>
            </div>
          ) : (
            <div className="form-container invoice-form-card">
              <div className="form-content">
                {/* 1. Invoice Details */}
                <section className="form-section" style={{ marginBottom: '28px' }}>
                  <h2 className="section-heading" style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', marginBottom: '14px' }}>
                    1. Invoice Details
                  </h2>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '13px', fontWeight: '600', color: '#444' }}>
                      Invoice To (Customer Name)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '10px 14px', fontSize: '15px' }}
                      placeholder="e.g. Sanoof"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                </section>

                {/* 2. Invoice Items */}
                <section className="form-section" style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h2 className="section-heading" style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
                      2. Invoice Items
                    </h2>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={handleAddItem}
                      style={{ fontSize: '13px', fontWeight: '600' }}
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="invoice-items-table-wrapper">
                    <table className="invoice-items-table">
                      <thead>
                        <tr>
                          <th className="th-item-name">Item Name</th>
                          <th className="th-qty">Qty</th>
                          <th className="th-price">Price (₹)</th>
                          <th className="th-total">Total</th>
                          <th className="th-action"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => {
                          const rowTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0)
                          return (
                            <tr key={index}>
                              <td className="td-item-name">
                                <input
                                  type="text"
                                  className="form-input invoice-item-input input-item-name"
                                  placeholder="Item name"
                                  value={item.name}
                                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                />
                              </td>
                              <td className="td-qty">
                                <input
                                  type="number"
                                  min="1"
                                  className="form-input invoice-item-input input-qty"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                />
                              </td>
                              <td className="td-price">
                                <input
                                  type="number"
                                  min="0"
                                  className="form-input invoice-item-input input-price"
                                  placeholder="Amount"
                                  value={item.price}
                                  onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                />
                              </td>
                              <td className="td-total">
                                <span className="invoice-row-total">
                                  ₹{formatCurrency(rowTotal)}
                                </span>
                              </td>
                              <td className="td-action">
                                <button
                                  type="button"
                                  className="invoice-item-remove-btn"
                                  onClick={() => handleRemoveItem(index)}
                                  title="Delete item"
                                >
                                  −
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 3. Payment & Calculations */}
                <section className="form-section" style={{ marginBottom: '28px' }}>
                  <h2 className="section-heading" style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', marginBottom: '14px' }}>
                    3. Payment &amp; Calculations
                  </h2>
                  <div className="invoice-calculations-box" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: '#faf8f5', padding: '20px', borderRadius: '10px', border: '1px solid #efebe4' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '13px', color: '#777' }}>Sub Total (Auto)</label>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>
                        ₹{formatCurrency(subTotal)}
                      </div>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '13px', color: '#444' }}>Advance Paid (₹)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        style={{ background: '#fff', fontSize: '16px', fontWeight: '600' }}
                        value={advance}
                        onChange={(e) => setAdvance(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '13px', color: '#777' }}>Balance Due (Auto)</label>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: '#27ae60' }}>
                        ₹{formatCurrency(balance)}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Actions */}
                <div className="form-actions" style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/')}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-large"
                    style={{ background: '#27ae60', color: '#ffffff', border: 'none', padding: '14px 28px', fontSize: '15px', fontWeight: '700', borderRadius: '8px' }}
                    onClick={handleGenerateInvoice}
                    disabled={generating}
                  >
                    {generating ? 'Generating Invoice PDF...' : 'Generate Invoice PDF'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Off-screen Live Render Node for html2canvas */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <InvoicePreview invoice={invoiceData} company={company} id="invoice-render-page" />
      </div>
    </div>
  )
}
