import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { authMiddleware } from '../middleware/auth.js'
import { invoicesFile, uploadsDir } from '../config.js'

const router = Router()

function readInvoices() {
  if (!fs.existsSync(invoicesFile)) return []
  return JSON.parse(fs.readFileSync(invoicesFile, 'utf-8'))
}

function writeInvoices(data) {
  fs.writeFileSync(invoicesFile, JSON.stringify(data, null, 2))
}

function getDisplayName(inv) {
  return inv.customerName?.trim() || 'Unnamed Client'
}

// Unrestricted PDF download endpoint (placed BEFORE authMiddleware)
router.get('/:id/pdf', (req, res) => {
  const invoice = readInvoices().find((i) => i.id === req.params.id)
  if (!invoice?.pdfPath) return res.status(404).send('Invoice PDF not found')

  const pdfFile = path.join(uploadsDir, invoice.pdfPath)
  if (!fs.existsSync(pdfFile)) return res.status(404).send('Invoice PDF file missing')

  const firstUnderscore = invoice.pdfPath.indexOf('_')
  const rawName = firstUnderscore !== -1 ? invoice.pdfPath.slice(firstUnderscore + 1) : invoice.pdfPath
  const downloadName = rawName.endsWith('.pdf') ? rawName : `${rawName}.pdf`
  const disposition = req.query.download ? 'attachment' : 'inline'

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `${disposition}; filename="${downloadName.replace(/"/g, '')}"; filename*=UTF-8''${encodeURIComponent(downloadName)}`
  )
  res.sendFile(pdfFile)
})

router.use(authMiddleware)

router.get('/', (req, res) => {
  const invoices = readInvoices()
    .filter((i) => i.completed && (!i.userId || i.userId === req.user.id))
    .map((i) => ({
      id: i.id,
      displayName: getDisplayName(i),
      subTotal: i.subTotal || 0,
      balance: i.balance || 0,
      updatedAt: i.updatedAt,
      userId: i.userId,
      type: 'invoice',
    }))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  res.json(invoices)
})

router.get('/:id', (req, res) => {
  const invoice = readInvoices().find((i) => i.id === req.params.id)
  if (!invoice) return res.status(404).json({ error: 'Not found' })
  res.json(invoice)
})

router.post('/', (req, res) => {
  const now = new Date().toISOString()
  const invoice = {
    id: uuidv4(),
    userId: req.user.id,
    ...req.body,
    completed: req.body.completed ?? false,
    createdAt: now,
    updatedAt: now,
    pdfPath: null,
  }

  const invoices = readInvoices()
  invoices.push(invoice)
  writeInvoices(invoices)

  res.status(201).json(invoice)
})

router.put('/:id', (req, res) => {
  const invoices = readInvoices()
  const index = invoices.findIndex((i) => i.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Not found' })

  invoices[index] = {
    ...invoices[index],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString(),
  }

  writeInvoices(invoices)
  res.json(invoices[index])
})

router.delete('/:id', (req, res) => {
  const invoices = readInvoices()
  const index = invoices.findIndex((i) => i.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Not found' })

  const [removed] = invoices.splice(index, 1)
  if (removed.pdfPath) {
    const pdfFile = path.join(uploadsDir, removed.pdfPath)
    if (fs.existsSync(pdfFile)) fs.unlinkSync(pdfFile)
  }

  writeInvoices(invoices)
  res.json({ success: true })
})

router.post('/:id/pdf', (req, res) => {
  const { pdfBase64, fileName } = req.body
  if (!pdfBase64 || !fileName) {
    return res.status(400).json({ error: 'PDF data required' })
  }

  const invoices = readInvoices()
  const index = invoices.findIndex((i) => i.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Invoice not found' })

  const existing = invoices[index]
  if (existing.pdfPath) {
    const oldFile = path.join(uploadsDir, existing.pdfPath)
    if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile)
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9_\-.& ]/g, '_')
  const storedName = `${req.params.id}_${safeName}`
  const buffer = Buffer.from(pdfBase64, 'base64')
  fs.writeFileSync(path.join(uploadsDir, storedName), buffer)

  invoices[index] = {
    ...existing,
    pdfPath: storedName,
    completed: true,
    updatedAt: new Date().toISOString(),
  }

  writeInvoices(invoices)
  res.json({ pdfPath: storedName, fileName: safeName })
})

export default router
