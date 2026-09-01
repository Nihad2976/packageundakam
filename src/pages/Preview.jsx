import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import PdfPreview from '../components/PdfPreview'
import { generateQuotationPdf, pdfBytesToBase64 } from '../utils/pdf'
import { getPdfFileName } from '../utils/quotation'
import { api } from '../utils/api'

export default function DownloadScreen({ quotation, quotationId }) {
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [pdfBytes, setPdfBytes] = useState(null)
  const [fileName, setFileName] = useState('')
  const page2Ref = useRef(null)
  const navigate = useNavigate()

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const element = document.getElementById('pdf-render-page-2')
      if (!element) throw new Error('Preview element not found')

      const bytes = await generateQuotationPdf(element)
      const name = getPdfFileName(quotation)
      const base64 = pdfBytesToBase64(bytes)

      await api.savePdf(quotationId, base64, name)

      setPdfBytes(bytes)
      setFileName(name)
      setGenerated(true)
    } catch (err) {
      console.error(err)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setGenerating(false)
    }
  }



  if (!generated) {
    return (
      <div className="preview-page">
        <PdfPreview quotation={quotation} page2Ref={page2Ref} />

        <div className="preview-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Edit Quotation
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? 'Generating PDF...' : 'Generate PDF'}
          </button>
        </div>
      </div>
    )
  }

  const displayFileName = fileName || getPdfFileName(quotation)
  const pdfUrl = quotationId ? api.getPdfDownloadUrl(quotationId) : '#'

  return (
    <div className="download-page">
      <div className="download-card">
        <p className="download-success">✓ PDF Generated Successfully</p>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px', fontWeight: '500' }}>
          File: <code>{displayFileName}</code>
        </p>

        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary btn-large download-main-btn"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          📄 View &amp; Save PDF
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
            <li>Tap <strong>"View &amp; Save PDF"</strong>.</li>
            <li>Tap the Share button <strong>[↑]</strong> at the bottom of Safari.</li>
            <li>Tap <strong>Save to Files</strong>. The name <em>({displayFileName})</em> is already filled in!</li>
          </ol>
        </div>

        <div className="download-navigation-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Home Page
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/quotation/new')}>
            + New Quotation
          </button>
        </div>
      </div>
    </div>
  )
}

export function PreviewStep({ quotation, quotationId, onEdit }) {
  const [generating, setGenerating] = useState(false)
  const navigate = useNavigate()

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const element = document.getElementById('pdf-render-page-2')
      if (!element) throw new Error('Preview element not found')

      const bytes = await generateQuotationPdf(element)
      const name = getPdfFileName(quotation)
      const base64 = pdfBytesToBase64(bytes)

      await api.savePdf(quotationId, base64, name)
      await api.updateQuotation(quotationId, { ...quotation, completed: true })

      navigate(`/quotation/${quotationId}/download`, {
        state: { pdfBytes: bytes, fileName: name },
      })
    } catch (err) {
      console.error(err)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="preview-step">
      <PdfPreview quotation={quotation} />

      <div className="preview-actions">
        <button type="button" className="btn btn-secondary" onClick={onEdit}>
          Edit Quotation
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? 'Generating PDF...' : 'Generate PDF'}
        </button>
      </div>
    </div>
  )
}

export function FinalDownloadScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [pdfData, setPdfData] = useState(location.state?.pdfBytes || null)
  const fileName = location.state?.fileName || 'Quotation.pdf'
  const [loading, setLoading] = useState(!location.state?.pdfBytes && !!id)

  useEffect(() => {
    if (!pdfData && id) {
      setLoading(true)
      api
        .fetchPdfBlob(id)
        .then((blob) => {
          setPdfData(blob)
        })
        .catch((err) => {
          console.error('Failed to load PDF:', err)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [id, pdfData])

  if (loading) {
    return (
      <div className="download-page">
        <div className="download-card">
          <p>Loading PDF...</p>
        </div>
      </div>
    )
  }

  if (!pdfData && !id) {
    return (
      <div className="download-page">
        <div className="download-card">
          <p>PDF not available. Please regenerate from the quotation.</p>
          <div className="download-navigation-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
              Home Page
            </button>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/quotation/new')}>
              + New Quotation
            </button>
          </div>
        </div>
      </div>
    )
  }

  const pdfUrl = id ? api.getPdfDownloadUrl(id) : '#'

  return (
    <div className="download-page">
      <div className="download-card">
        <p className="download-success">✓ PDF Ready for Download</p>
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
          📄 View &amp; Save PDF
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
            <li>Tap <strong>"View &amp; Save PDF"</strong>.</li>
            <li>Tap the Share button <strong>[↑]</strong> at the bottom of Safari.</li>
            <li>Tap <strong>Save to Files</strong>. The name <em>({fileName})</em> is already filled in!</li>
          </ol>
        </div>

        <div className="download-navigation-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Home Page
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/quotation/new')}>
            + New Quotation
          </button>
        </div>
      </div>
    </div>
  )
}
