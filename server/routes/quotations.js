import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { authMiddleware } from '../middleware/auth.js'
import { quotationsFile, uploadsDir } from '../config.js'

const router = Router()

function readQuotations() {
  return JSON.parse(fs.readFileSync(quotationsFile, 'utf-8'))
}

function writeQuotations(data) {
  fs.writeFileSync(quotationsFile, JSON.stringify(data, null, 2))
}

function getDisplayName(q) {
  if (q.clientType === 'groom') return q.groomName?.trim() || 'Unnamed'
  if (q.clientType === 'bride') return q.brideName?.trim() || 'Unnamed'
  const groom = q.groomName?.trim() || ''
  const bride = q.brideName?.trim() || ''
  if (groom && bride) return `${groom} & ${bride}`
  return groom || bride || 'Unnamed'
}

router.get('/:id/pdf', (req, res) => {
  const quotation = readQuotations().find((q) => q.id === req.params.id)
  if (!quotation?.pdfPath) return res.status(404).send('PDF not found')

  const pdfFile = path.join(uploadsDir, quotation.pdfPath)
  if (!fs.existsSync(pdfFile)) return res.status(404).send('PDF file missing')

  const firstUnderscore = quotation.pdfPath.indexOf('_')
  const rawName = firstUnderscore !== -1 ? quotation.pdfPath.slice(firstUnderscore + 1) : quotation.pdfPath
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
  const quotations = readQuotations()
    .filter((q) => q.completed && (!q.userId || q.userId === req.user.id))
    .map((q) => ({
      id: q.id,
      displayName: getDisplayName(q),
      updatedAt: q.updatedAt,
      userId: q.userId,
    }))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  res.json(quotations)
})

router.get('/:id', (req, res) => {
  const quotation = readQuotations().find((q) => q.id === req.params.id)
  if (!quotation) return res.status(404).json({ error: 'Not found' })
  res.json(quotation)
})

router.post('/', (req, res) => {
  const now = new Date().toISOString()
  const quotation = {
    id: uuidv4(),
    userId: req.user.id,
    ...req.body,
    completed: req.body.completed ?? false,
    createdAt: now,
    updatedAt: now,
    pdfPath: null,
  }

  const quotations = readQuotations()
  quotations.push(quotation)
  writeQuotations(quotations)

  res.status(201).json(quotation)
})

router.put('/:id', (req, res) => {
  const quotations = readQuotations()
  const index = quotations.findIndex((q) => q.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Not found' })

  quotations[index] = {
    ...quotations[index],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString(),
  }

  writeQuotations(quotations)
  res.json(quotations[index])
})

router.delete('/:id', (req, res) => {
  const quotations = readQuotations()
  const index = quotations.findIndex((q) => q.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Not found' })

  const [removed] = quotations.splice(index, 1)
  if (removed.pdfPath) {
    const pdfFile = path.join(uploadsDir, removed.pdfPath)
    if (fs.existsSync(pdfFile)) fs.unlinkSync(pdfFile)
  }

  writeQuotations(quotations)
  res.json({ success: true })
})

router.post('/:id/pdf', (req, res) => {
  const { pdfBase64, fileName } = req.body
  if (!pdfBase64 || !fileName) {
    return res.status(400).json({ error: 'PDF data required' })
  }

  const quotations = readQuotations()
  const index = quotations.findIndex((q) => q.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Not found' })

  const existing = quotations[index]
  if (existing.pdfPath) {
    const oldFile = path.join(uploadsDir, existing.pdfPath)
    if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile)
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9_\-.& ]/g, '_')
  const storedName = `${req.params.id}_${safeName}`
  const buffer = Buffer.from(pdfBase64, 'base64')
  fs.writeFileSync(path.join(uploadsDir, storedName), buffer)

  quotations[index] = {
    ...existing,
    pdfPath: storedName,
    completed: true,
    updatedAt: new Date().toISOString(),
  }

  writeQuotations(quotations)
  res.json({ pdfPath: storedName, fileName: safeName })
})



export default router
