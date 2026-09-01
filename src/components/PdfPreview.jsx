import { useEffect, useState } from 'react'
import QuotationPage2 from './QuotationPage2'
import { renderPdfPageAsImage } from '../utils/pdf'

export default function PdfPreview({ quotation, page2Ref }) {
  const [page1Url, setPage1Url] = useState(null)
  const [page3Url, setPage3Url] = useState(null)

  useEffect(() => {
    let url1, url3
    renderPdfPageAsImage(0).then((url) => {
      url1 = url
      setPage1Url(url)
    })
    renderPdfPageAsImage(2).then((url) => {
      url3 = url
      setPage3Url(url)
    })

    return () => {
      if (url1) URL.revokeObjectURL(url1)
      if (url3) URL.revokeObjectURL(url3)
    }
  }, [])

  return (
    <div className="pdf-preview">
      <div className="pdf-preview-page">
        <span className="pdf-page-label">Page 1</span>
        {page1Url ? (
          <iframe title="Page 1" src={`${page1Url}#toolbar=0`} className="pdf-iframe" />
        ) : (
          <div className="pdf-loading">Loading page 1...</div>
        )}
      </div>

      <div className="pdf-preview-page">
        <span className="pdf-page-label">Page 2</span>
        <div className="pdf-page-2-wrapper">
          <QuotationPage2 quotation={quotation} id={page2Ref?.current ? undefined : 'preview-page-2'} />
          <div ref={page2Ref} style={{ position: 'absolute', left: '-9999px', top: 0 }}>
            <QuotationPage2 quotation={quotation} id="pdf-render-page-2" />
          </div>
        </div>
      </div>

      <div className="pdf-preview-page">
        <span className="pdf-page-label">Page 3</span>
        {page3Url ? (
          <iframe title="Page 3" src={`${page3Url}#toolbar=0`} className="pdf-iframe" />
        ) : (
          <div className="pdf-loading">Loading page 3...</div>
        )}
      </div>
    </div>
  )
}
