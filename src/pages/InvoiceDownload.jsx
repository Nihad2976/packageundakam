import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { api } from '../utils/api'
import InvoicePreview from '../components/InvoicePreview'

export default function InvoiceDownload() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [pdfBlob, setPdfBlob] = useState(location.state?.pdfBytes || null)
  const [invoice, setInvoice] = useState(location.state?.invoice || null)
  const fileName = location.state?.fileName || 'Invoice.pdf'
  const [loading, setLoading] = useState(!location.state?.pdfBytes && !!id)
  const [previewScale, setPreviewScale] = useState(0.48)

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w < 640) setPreviewScale(Math.max(0.28, (w - 48) / 1190))
      else if (w < 1100) setPreviewScale(Math.max(0.38, (w - 120) / 1190))
      else setPreviewScale(0.48)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!invoice && id) {
      api.getInvoice(id).then(setInvoice).catch(console.error)
    }
  }, [id, invoice])

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
    <div className="download-page invoice-download-page" style={{ padding: '40px 20px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
      {invoice && (
        <div className="invoice-download-preview-side" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: '12px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#666' }}>
            Invoice Document Preview
          </div>
          <div
            style={{
              width: `${1190 * previewScale}px`,
              height: `${1684 * previewScale}px`,
              boxShadow: '0 15px 45px rgba(0, 0, 0, 0.16)',
              borderRadius: '6px',
              overflow: 'hidden',
              background: invoice.company === 'fewdays' ? '#f0ece1' : invoice.company === 'piktoria' ? '#f7f6f0' : '#1e1e1e',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <InvoicePreview
              invoice={invoice}
              company={invoice.company}
              scale={previewScale}
              id="download-invoice-preview"
            />
          </div>
        </div>
      )}

      <div className="download-card" style={{ maxWidth: '440px', width: '100%' }}>
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

