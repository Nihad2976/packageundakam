import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { authMiddleware, checkBlockedMiddleware } from '../middleware/auth.js'
import { getInvoicesFile, uploadsDir } from '../config.js'

const router = Router()

function readInvoices(company = 'naj') {
  const file = getInvoicesFile(company)
  if (!fs.existsSync(file)) return []
  return JSON.parse(fs.readFileSync(file, 'utf-8'))
}

function writeInvoices(company = 'naj', data = []) {
  const file = getInvoicesFile(company)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function findInvoiceAcrossCompanies(id) {
  for (const comp of ['naj', 'piktoria', 'litheads', 'fewdays']) {
    const list = readInvoices(comp)
    const found = list.find((i) => i.id === id)
    if (found) return { invoice: found, company: comp }
  }
  return { invoice: null, company: null }
}

function getDisplayName(inv) {
  return inv.customerName?.trim() || 'Unnamed Client'
}

// Unrestricted PDF download endpoint (placed BEFORE authMiddleware)
router.get('/:id/pdf', (req, res) => {
  const { invoice } = findInvoiceAcrossCompanies(req.params.id)
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
router.use(checkBlockedMiddleware)

router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  if (req.user?.role === 'admin' || req.user?.company === 'admin') {
    return res.json([])
  }
  const comp = req.query.company || req.user.company || 'naj'
  const primaryInvoices = readInvoices(comp)

  const seenIds = new Set()
  const combined = []

  const addInvoice = (i, c) => {
    if (!i || seenIds.has(i.id)) return
    if (i.completed === false) return
    seenIds.add(i.id)
    combined.push({
      id: i.id,
      displayName: getDisplayName(i),
      subTotal: i.subTotal || 0,
      balance: i.balance || 0,
      updatedAt: i.updatedAt,
      userId: i.userId,
      company: i.company || c,
      type: 'invoice',
    })
  }

  // 1. Add invoices for this company
  for (const i of primaryInvoices) {
    addInvoice(i, comp)
  }

  // 2. Also include invoices created by this user across other companies
  for (const otherComp of ['naj', 'piktoria', 'litheads', 'fewdays']) {
    if (otherComp === comp) continue
    const otherList = readInvoices(otherComp)
    for (const i of otherList) {
      if (i.userId === req.user.id) {
        addInvoice(i, otherComp)
      }
    }
  }

  combined.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  res.json(combined)
})

router.get('/:id', (req, res) => {
  const comp = req.user.company || 'naj'
  let invoice = readInvoices(comp).find((i) => i.id === req.params.id)
  if (!invoice) {
    const found = findInvoiceAcrossCompanies(req.params.id)
    invoice = found.invoice
  }
  if (!invoice) return res.status(404).json({ error: 'Not found' })
  res.json(invoice)
})

router.post('/', (req, res) => {
  const comp = req.body.company || req.user.company || 'naj'
  const now = new Date().toISOString()
  const invoice = {
    id: uuidv4(),
    userId: req.user.id,
    company: comp,
    ...req.body,
    completed: req.body.completed ?? true,
    createdAt: now,
    updatedAt: now,
    pdfPath: null,
  }

  const invoices = readInvoices(comp)
  invoices.push(invoice)
  writeInvoices(comp, invoices)

  res.status(201).json(invoice)
})

router.put('/:id', (req, res) => {
  const comp = req.body.company || req.user.company || 'naj'
  let invoices = readInvoices(comp)
  let index = invoices.findIndex((i) => i.id === req.params.id)
  let targetComp = comp

  if (index === -1) {
    const found = findInvoiceAcrossCompanies(req.params.id)
    if (found.invoice) {
      targetComp = found.company
      invoices = readInvoices(targetComp)
      index = invoices.findIndex((i) => i.id === req.params.id)
    }
  }

  if (index === -1) return res.status(404).json({ error: 'Not found' })

  invoices[index] = {
    ...invoices[index],
    ...req.body,
    id: req.params.id,
    company: targetComp,
    completed: req.body.completed ?? invoices[index].completed ?? true,
    updatedAt: new Date().toISOString(),
  }

  writeInvoices(targetComp, invoices)
  res.json(invoices[index])
})

router.delete('/:id', (req, res) => {
  const comp = req.user.company || 'naj'
  let invoices = readInvoices(comp)
  let index = invoices.findIndex((i) => i.id === req.params.id)
  let targetComp = comp

  if (index === -1) {
    const found = findInvoiceAcrossCompanies(req.params.id)
    if (found.invoice) {
      targetComp = found.company
      invoices = readInvoices(targetComp)
      index = invoices.findIndex((i) => i.id === req.params.id)
    }
  }

  if (index === -1) return res.status(404).json({ error: 'Not found' })

  const [removed] = invoices.splice(index, 1)
  if (removed.pdfPath) {
    const pdfFile = path.join(uploadsDir, removed.pdfPath)
    if (fs.existsSync(pdfFile)) fs.unlinkSync(pdfFile)
  }

  writeInvoices(targetComp, invoices)
  res.json({ success: true })
})

router.post('/:id/pdf', (req, res) => {
  const comp = req.user.company || 'naj'
  const { pdfBase64, fileName } = req.body
  if (!pdfBase64 || !fileName) {
    return res.status(400).json({ error: 'PDF data required' })
  }

  let invoices = readInvoices(comp)
  let index = invoices.findIndex((i) => i.id === req.params.id)
  let targetComp = comp

  if (index === -1) {
    const found = findInvoiceAcrossCompanies(req.params.id)
    if (found.invoice) {
      targetComp = found.company
      invoices = readInvoices(targetComp)
      index = invoices.findIndex((i) => i.id === req.params.id)
    }
  }

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
    company: targetComp,
    completed: true,
    updatedAt: new Date().toISOString(),
  }

  writeInvoices(targetComp, invoices)
  res.json({ pdfPath: storedName, fileName: safeName })
})

export default router
