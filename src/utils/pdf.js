import { PDFDocument } from 'pdf-lib'
import html2canvas from 'html2canvas'
import sourcePdfUrl from '../assets/shahana sabir.pdf?url'

const A4_WIDTH = 595.28
const A4_HEIGHT = 841.89

export async function generateInvoicePdf(invoiceElement) {
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    await document.fonts.ready
  }

  const canvas = await html2canvas(invoiceElement, {
    scale: 4,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#1e1e1e',
    windowWidth: 1190,
    windowHeight: 1684,
    width: 1190,
    height: 1684,
    onclone: (clonedDoc) => {
      const el = clonedDoc.getElementById('invoice-render-page')
      if (el) {
        el.style.transform = 'none'
        el.style.left = '0'
        el.style.top = '0'
        el.style.position = 'relative'
        el.style.display = 'flex'
        el.style.webkitFontSmoothing = 'antialiased'
        el.style.mozOsxFontSmoothing = 'grayscale'
      }
    },
  })

  const pngDataUrl = canvas.toDataURL('image/png', 1.0)
  const pngBase64 = pngDataUrl.split(',')[1]
  const pngBytes = Uint8Array.from(atob(pngBase64), (c) => c.charCodeAt(0))

  const finalDoc = await PDFDocument.create()
  const page = finalDoc.addPage([A4_WIDTH, A4_HEIGHT])
  const invoiceImage = await finalDoc.embedPng(pngBytes)

  page.drawImage(invoiceImage, {
    x: 0,
    y: 0,
    width: A4_WIDTH,
    height: A4_HEIGHT,
  })

  return await finalDoc.save()
}

export async function generateQuotationPdf(page2Element) {
  // Ensure all custom web fonts (Dream Avenue, Public Sans) are fully loaded
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    await document.fonts.ready
  }

  const sourceBytes = await fetch(sourcePdfUrl).then((r) => r.arrayBuffer())
  const sourceDoc = await PDFDocument.load(sourceBytes)
  const pages = sourceDoc.getPages()

  if (pages.length < 3) {
    throw new Error('Source PDF must have 3 pages')
  }

  const canvas = await html2canvas(page2Element, {
    scale: 4,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1190,
    windowHeight: 1684,
  })

  const pngDataUrl = canvas.toDataURL('image/png', 1.0)
  const pngBase64 = pngDataUrl.split(',')[1]
  const pngBytes = Uint8Array.from(atob(pngBase64), (c) => c.charCodeAt(0))

  const finalDoc = await PDFDocument.create()
  const page2Image = await finalDoc.embedPng(pngBytes)

  const [page1] = await finalDoc.copyPages(sourceDoc, [0])
  finalDoc.addPage(page1)

  const page2 = finalDoc.addPage([A4_WIDTH, A4_HEIGHT])
  page2.drawImage(page2Image, {
    x: 0,
    y: 0,
    width: A4_WIDTH,
    height: A4_HEIGHT,
  })

  const [page3] = await finalDoc.copyPages(sourceDoc, [2])
  finalDoc.addPage(page3)

  const pdfBytes = await finalDoc.save()
  return pdfBytes
}

export function pdfBytesToBase64(pdfBytes) {
  let binary = ''
  const bytes = new Uint8Array(pdfBytes)
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export async function blobToBase64(blob) {
  const buffer = await blob.arrayBuffer()
  return pdfBytesToBase64(buffer)
}

export async function downloadPdfBytes(pdfBytes, fileName = 'Quotation.pdf') {
  const blob =
    pdfBytes instanceof Blob
      ? pdfBytes
      : new Blob([pdfBytes], { type: 'application/pdf' })

  const safeFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
  const file = new File([blob], safeFileName, { type: 'application/pdf' })

  // 1. Try Web Share API (native mobile share sheet with pre-filled filename)
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    try {
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: safeFileName,
        })
        return
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      console.warn('Web Share failed, attempting fallback download:', err)
    }
  }

  // 2. Fallback Blob Download
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = safeFileName
  a.target = '_blank'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 60000)
}

export function openPdfInNewTab(pdfBytes) {
  const blob =
    pdfBytes instanceof Blob
      ? pdfBytes
      : new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

  if (isIOS) {
    window.location.href = url
  } else {
    window.open(url, '_blank')
  }

  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 60000)
}

export async function renderPdfPageAsImage(pageIndex) {
  const sourceBytes = await fetch(sourcePdfUrl).then((r) => r.arrayBuffer())
  const sourceDoc = await PDFDocument.load(sourceBytes)
  const tempDoc = await PDFDocument.create()
  const [page] = await tempDoc.copyPages(sourceDoc, [pageIndex])
  tempDoc.addPage(page)
  const pdfBytes = await tempDoc.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  return URL.createObjectURL(blob)
}
