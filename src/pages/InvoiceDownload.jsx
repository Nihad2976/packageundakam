import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { api } from '../utils/api'

export default function InvoiceDownload() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [pdfBlob, setPdfBlob] = useState(location.state?.pdfBytes || null)
  const fileName = location.state?.fileName || 'Invoice.pdf'
  const [loading, setLoading] = useState(!location.state?.pdfBytes && !!id)

  useEffect(() => {
    if (!pdfBlob && id) {
      setLoading(true)
      api
        .fetchInvoicePdfBlob(id)
        .then((blob) => {
          setPdfBlob(blob)
        })
        .catch((err) => {
          console.error('Failed to load invoice PDF:', err)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [id, pdfBlob])

  if (loading) {
    return (
      <div className="download-page">
        <div className="download-card">
          <p>Loading invoice PDF...</p>
        </div>
      </div>
    )
  }

  if (!pdfBlob && !id) {
    return (
      <div className="download-page">
        <div className="download-card">
          <p>Invoice PDF not available. Please regenerate from the invoice form.</p>
          <div className="download-navigation-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
              Home Page
            </button>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/invoice/new')}>
              + New Invoice
            </button>
          </div>
        </div>
      </div>
    )
  }

  const pdfUrl = id ? api.getInvoiceDownloadUrl(id) : '#'

  return (
    <div className="download-page">
      <div className="download-card">
        <p className="download-success">✓ Invoice PDF Ready for Download</p>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px', fontWeight: '500' }}>
          File: <code>{fileName}</code>
        </p>

        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary btn-large download-main-btn"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          📄 View &amp; Save Invoice
        </a>

        <a
          href={`${pdfUrl}?download=true`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary"
          style={{ marginTop: '10px', width: '100%', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          📥 Direct Download (For Windows &amp; PC)
        </a>

        <div style={{ margin: '16px 0', padding: '12px 14px', background: '#f5f5f7', borderRadius: '8px', fontSize: '12px', color: '#444', textAlign: 'left', lineHeight: '1.5' }}>
          <strong>📱 How to Save on iPhone Safari:</strong>
          <ol style={{ margin: '4px 0 0', paddingLeft: '18px' }}>
            <li>Tap <strong>"View &amp; Save Invoice"</strong>.</li>
            <li>Tap the Share button <strong>[↑]</strong> at the bottom of Safari.</li>
            <li>Tap <strong>Save to Files</strong>. The name <em>({fileName})</em> is already filled in!</li>
          </ol>
        </div>

        <div className="download-navigation-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Home Page
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/invoice/new')}>
            + New Invoice
          </button>
        </div>
      </div>
    </div>
  )
}
