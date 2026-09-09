import React from 'react'
import { useAuth } from '../context/AuthContext'

export function formatCurrency(num) {
  const n = Number(num) || 0
  return n.toLocaleString('en-IN')
}

export default function InvoicePreview({ invoice, scale = 1, id = 'invoice-render-page', company: forcedCompany }) {
  const { company: authCompany } = useAuth() || {}
  const company = forcedCompany || invoice?.company || authCompany || 'naj'
  const isPiktoria = company === 'piktoria'

  const customerName = invoice?.customerName?.trim() || (isPiktoria ? 'HIBA' : 'Sanoof')
  const items = invoice?.items && invoice.items.length > 0
    ? invoice.items
    : isPiktoria
      ? [
          { name: 'Package', quantity: 1, price: 40000, total: 40000 },
          { name: 'Travel', quantity: 1, price: 0, total: 0 },
        ]
      : [
          { name: 'Package', quantity: 1, price: 20000, total: 20000 },
          { name: 'Save the Date', quantity: 1, price: 4000, total: 4000 },
          { name: 'Travel', quantity: 1, price: 1000, total: 1000 },
        ]

  const subTotal = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.price || 0)), 0)
  const advance = Number(invoice?.advance) || (isPiktoria ? 2000 : 0)
  const balance = subTotal - advance

  if (isPiktoria) {
    return (
      <div
        id={id}
        className="invoice-pdf-template piktoria-invoice"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top left',
        }}
      >
        {/* Top Header Row */}
        <header className="piktoria-inv-header">
          <div className="piktoria-inv-monogram">PW</div>
          <h1 className="piktoria-inv-title">INVOICE</h1>
        </header>

        {/* Invoice To Section */}
        <section className="piktoria-inv-billed">
          <div className="piktoria-inv-billed-label">BILLED TO:</div>
          <div className="piktoria-inv-billed-name">{customerName}</div>
        </section>

        {/* Table */}
        <table className="piktoria-inv-table">
          <thead>
            <tr>
              <th className="col-item">Item</th>
              <th className="col-qty">Quantity</th>
              <th className="col-total">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const qty = Number(item.quantity) || 1
              const price = Number(item.price) || 0
              const itemTotal = qty * price
              return (
                <tr key={index}>
                  <td className="col-item">{item.name || 'Item'}</td>
                  <td className="col-qty">{qty}</td>
                  <td className="col-total">{price > 0 ? itemTotal : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Middle Row: Terms & Totals */}
        <div className="piktoria-inv-middle-row">
          <div className="piktoria-inv-terms-col">
            <h4 className="piktoria-inv-terms-head">TERMS AND CONDITIONS</h4>
            <p className="piktoria-inv-terms-body">
              All invoices must be paid within 30 days from the date of the invoice unless otherwise agreed
              upon in writing. Late payments may incur additional charges.
            </p>
          </div>

          <div className="piktoria-inv-totals-col">
            <div className="piktoria-inv-sum-row">
              <span className="piktoria-inv-sum-label">Total</span>
              <span className="piktoria-inv-sum-val">{subTotal}</span>
            </div>
            <div className="piktoria-inv-sum-row">
              <span className="piktoria-inv-sum-label">Advance</span>
              <span className="piktoria-inv-sum-val">{advance > 0 ? advance : '—'}</span>
            </div>
            <div className="piktoria-inv-divider"></div>
            <div className="piktoria-inv-balance-row">
              <span className="piktoria-inv-balance-label">Balance</span>
              <span className="piktoria-inv-balance-val">₹{balance}</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Contact & Brand */}
        <footer className="piktoria-inv-bottom-row">
          <div className="piktoria-inv-contact-block">
            <div className="piktoria-inv-contact-head">CONTACT US</div>
            <div className="piktoria-inv-contact-line">Changarkulam,Malappuram</div>
            <div className="piktoria-inv-contact-line">8138-075671</div>
          </div>

          <div className="piktoria-inv-brand-foot">
            <div className="piktoria-inv-brand-name">Piktoria Weddings</div>
            <div className="piktoria-inv-brand-tag">WEDDING COMPANY</div>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div
      id={id}
      className="invoice-pdf-template"
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
      }}
    >
      {/* Top Header Row */}
      <header className="invoice-header">
        <div className="invoice-title-block">
          <h1 className="invoice-title">INVOICE</h1>
          <div className="invoice-title-line"></div>
        </div>
        <div className="invoice-brand">Naj wedding</div>
      </header>

      {/* Invoice To Section */}
      <section className="invoice-to-section">
        <div className="invoice-to-label">Invoice To:</div>
        <div className="invoice-customer-name">{customerName}</div>
      </section>

      {/* White Table Container Card */}
      <section className="invoice-table-card">
        <table className="invoice-table">
          <thead>
            <tr>
              <th className="col-no">No</th>
              <th className="col-name">Item Name</th>
              <th className="col-qty">Qty</th>
              <th className="col-total">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const qty = Number(item.quantity) || 1
              const price = Number(item.price) || 0
              const itemTotal = qty * price
              return (
                <tr key={index}>
                  <td className="col-no">{index + 1}</td>
                  <td className="col-name">{item.name || 'Item'}</td>
                  <td className="col-qty">{qty}</td>
                  <td className="col-total">{formatCurrency(itemTotal)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="invoice-table-divider"></div>
      </section>

      {/* Bottom Footer Section */}
      <footer className="invoice-footer">
        <div className="invoice-footer-left">
          <div className="invoice-terms-block">
            <h4 className="terms-title">Terms and Condition</h4>
            <p className="terms-text">
              All invoices must be paid within 5 days from the date of the invoice unless otherwise
              agreed upon in writing. Late payments may incur additional charges.
            </p>
          </div>

          <div className="invoice-footer-line"></div>

          <div className="invoice-contact-block">
            <h4 className="contact-title">Contact Us:</h4>
            <p className="contact-detail">+91-94008 80944</p>
            <p className="contact-detail">Guruvayoor,Althara</p>
          </div>
        </div>

        <div className="invoice-footer-right">
          <div className="invoice-summary-box">
            <div className="summary-row">
              <span className="summary-label">Sub Total</span>
              <span className="summary-value">{formatCurrency(subTotal)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Advance</span>
              <span className="summary-value">
                {advance > 0 ? formatCurrency(advance) : '-'}
              </span>
            </div>
            <div className="summary-row summary-balance-row">
              <span className="summary-label balance-label">Balance</span>
              <span className="summary-value balance-value">₹{formatCurrency(balance)}</span>
            </div>
          </div>

          <div className="invoice-signature">Najif</div>
        </div>
      </footer>
    </div>
  )
}
