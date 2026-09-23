import { PDFDocument, rgb } from 'pdf-lib'
import html2canvas from 'html2canvas'
import fontkit from '@pdf-lib/fontkit'
import sourcePdfUrl from '../assets/shahana sabir.pdf?url'
import piktoriaPdfUrl from '../assets/PIKTORIA.pdf?url'
import litheAdsPdfUrl from '../assets/LitheAds.pdf?url'
import fewdaysPdfUrl from '../assets/FEWDAYS.pdf?url'
import quicksandFontUrl from '../assets/Quicksand-SemiBold.ttf?url'

const A4_WIDTH = 595.28
const A4_HEIGHT = 841.89

export async function generateInvoicePdf(invoiceElement, company = 'naj') {
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    await document.fonts.ready
  }

  const isPiktoria = company === 'piktoria'
  const bgColor = isPiktoria ? '#f7f6f0' : '#1e1e1e'

  const canvas = await html2canvas(invoiceElement, {
    scale: 4,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: bgColor,
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

export async function generateQuotationPdf(page2Element, company = 'naj', quotation = null) {
  // Ensure all custom web fonts (Red Hat Display, Dream Avenue, Public Sans, Quicksand) are fully loaded
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    await document.fonts.ready
  }

  const isFewdays = company === 'fewdays'
  const isLitheAds = company === 'litheads'
  const templateUrl =
    isFewdays
      ? fewdaysPdfUrl
      : isLitheAds
        ? litheAdsPdfUrl
        : company === 'piktoria'
          ? piktoriaPdfUrl
          : sourcePdfUrl
  const sourceBytes = await fetch(templateUrl).then((r) => r.arrayBuffer())
  const sourceDoc = await PDFDocument.load(sourceBytes)
  const pages = sourceDoc.getPages()

  if (pages.length < 3) {
    throw new Error('Source PDF must have 3 pages')
  }

  const canvas = await html2canvas(page2Element, {
    scale: 3,
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

  // Page 1: Always copy directly from sourceDoc to maintain 100% original vector crispness
  const [page1] = await finalDoc.copyPages(sourceDoc, [0])
  finalDoc.addPage(page1)

  if (isFewdays) {
    let clientName = quotation?.clientName?.trim()
    if (!clientName) {
      clientName = quotation?.brideName?.trim() || quotation?.groomName?.trim() || 'Safwan'
    }

    const greeting = clientName.toLowerCase().startsWith('hello ')
      ? (clientName.endsWith(',') ? clientName : `${clientName},`)
      : `Hello ${clientName},`

    // Cover original 'Hello Safwan,' text with exact cream background rectangle
    page1.drawRectangle({
      x: 20,
      y: 175,
      width: 75,
      height: 6,
      color: rgb(0.9412, 0.9255, 0.8824),
    })

    try {
      finalDoc.registerFontkit(fontkit)
      const fontBytes = await fetch(quicksandFontUrl).then((r) => r.arrayBuffer())
      const quicksandFont = await finalDoc.embedFont(fontBytes)
      page1.drawText(greeting, {
        x: 20.6,
        y: 176.2,
        size: 3.3,
        font: quicksandFont,
        color: rgb(0, 0, 0),
      })
    } catch (err) {
      console.warn('Custom font embedding failed, using fallback:', err)
      page1.drawText(greeting, {
        x: 20.6,
        y: 176.2,
        size: 3.3,
        color: rgb(0, 0, 0),
      })
    }
  } else if (isLitheAds) {
    let greeting = quotation?.greeting?.trim()
    if (!greeting) {
      const rawName =
        quotation?.clientName?.trim() ||
        quotation?.brideName?.trim() ||
        quotation?.groomName?.trim()
      if (rawName) {
        greeting = rawName.toLowerCase().startsWith('hi ') ? rawName : `Hi ${rawName}`
      } else {
        greeting = ''
      }
    }

    // Cover original 'Hi Rukzana Gafoor' text with a clean white rectangle
    // LitheAds Page 1 is 613.2 x 859.92.
    // Original bbox: x: 119.11, y_top: 276.82, y_bottom: 294.10
    // PDF coordinate (bottom-left origin): y = 859.92 - 294.10 = 565.82
    page1.drawRectangle({
      x: 115,
      y: 563,
      width: 250,
      height: 25,
      color: rgb(1, 1, 1),
    })

    if (greeting) {
      try {
        finalDoc.registerFontkit(fontkit)
        const fontBytes = await fetch(quicksandFontUrl).then((r) => r.arrayBuffer())
        const quicksandFont = await finalDoc.embedFont(fontBytes)
        page1.drawText(greeting, {
          x: 119.11,
          y: 569.11,
          size: 11.998,
          font: quicksandFont,
          color: rgb(0, 0, 0),
        })
      } catch (err) {
        console.warn('Custom font embedding failed, using fallback:', err)
        page1.drawText(greeting, {
          x: 119.11,
          y: 569.11,
          size: 11.998,
          color: rgb(0, 0, 0),
        })
      }
    }
  }

  // Page 2: Custom customized page (HTML rendered to high-res image matching native template dimensions)
  const pWidth = page1.getWidth()
  const pHeight = page1.getHeight()
  const page2 = finalDoc.addPage([pWidth, pHeight])
  page2.drawImage(page2Image, {
    x: 0,
    y: 0,
    width: pWidth,
    height: pHeight,
  })

  // Page 3: Directly copied from sourceDoc
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

export async function renderPdfPageAsImage(pageIndex, company = 'naj') {
  const templateUrl =
    company === 'fewdays'
      ? fewdaysPdfUrl
      : company === 'litheads'
        ? litheAdsPdfUrl
        : company === 'piktoria'
          ? piktoriaPdfUrl
          : sourcePdfUrl
  const sourceBytes = await fetch(templateUrl).then((r) => r.arrayBuffer())
  const sourceDoc = await PDFDocument.load(sourceBytes)
  const tempDoc = await PDFDocument.create()
  const [page] = await tempDoc.copyPages(sourceDoc, [pageIndex])
  tempDoc.addPage(page)
  const pdfBytes = await tempDoc.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  return URL.createObjectURL(blob)
}
