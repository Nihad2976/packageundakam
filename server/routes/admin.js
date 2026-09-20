import { Router } from 'express'
import fs from 'fs'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'
import { readUsers, writeUsers } from './auth.js'
import { getQuotationsFile } from '../config.js'

const router = Router()

// All admin routes require authentication and admin role
router.use(authMiddleware)
router.use(adminMiddleware)

function countCompanyQuotations(company) {
  try {
    const qFile = getQuotationsFile(company)
    if (fs.existsSync(qFile)) {
      const list = JSON.parse(fs.readFileSync(qFile, 'utf-8'))
      if (Array.isArray(list)) {
        return list.length
      }
    }
  } catch {
    // ignore
  }
  return 0
}

// GET /api/admin/companies - List all companies
router.get('/companies', (req, res) => {
  try {
    const users = readUsers()
    // Return all companies (excluding system admin account)
    const companies = users
      .filter((u) => u.role !== 'admin' && u.username !== 'admin')
      .map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username || u.email,
        email: u.email,
        company: u.company,
        status: u.status || 'active',
        paymentStatus: u.paymentStatus || 'paid',
        lastUsed: u.lastUsed || null,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        quotationCount: countCompanyQuotations(u.company),
      }))

    res.json(companies)
  } catch (err) {
    console.error('Error fetching admin companies:', err)
    res.status(500).json({ error: 'Failed to fetch companies' })
  }
})

// PUT /api/admin/companies/:id/status - Block or Unblock company
router.put('/companies/:id/status', (req, res) => {
  try {
    const { status } = req.body
    if (!status || !['active', 'blocked'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "active" or "blocked"' })
    }

    const users = readUsers()
    const index = users.findIndex((u) => u.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ error: 'Company not found' })
    }

    if (users[index].role === 'admin') {
      return res.status(400).json({ error: 'Cannot block administrator account' })
    }

    users[index] = {
      ...users[index],
      status,
      updatedAt: new Date().toISOString(),
    }

    writeUsers(users)

    res.json({
      success: true,
      company: {
        id: users[index].id,
        name: users[index].name,
        username: users[index].username || users[index].email,
        email: users[index].email,
        company: users[index].company,
        status: users[index].status,
        paymentStatus: users[index].paymentStatus,
        lastUsed: users[index].lastUsed,
      },
    })
  } catch (err) {
    console.error('Error updating company status:', err)
    res.status(500).json({ error: 'Failed to update company status' })
  }
})

// PUT /api/admin/companies/:id/payment - Update company payment status
router.put('/companies/:id/payment', (req, res) => {
  try {
    const { paymentStatus } = req.body
    if (!paymentStatus || !['paid', 'unpaid'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Payment status must be "paid" or "unpaid"' })
    }

    const users = readUsers()
    const index = users.findIndex((u) => u.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ error: 'Company not found' })
    }

    users[index] = {
      ...users[index],
      paymentStatus,
      updatedAt: new Date().toISOString(),
    }

    writeUsers(users)

    res.json({
      success: true,
      company: {
        id: users[index].id,
        name: users[index].name,
        username: users[index].username || users[index].email,
        email: users[index].email,
        company: users[index].company,
        status: users[index].status,
        paymentStatus: users[index].paymentStatus,
        lastUsed: users[index].lastUsed,
      },
    })
  } catch (err) {
    console.error('Error updating company payment status:', err)
    res.status(500).json({ error: 'Failed to update company payment status' })
  }
})

export default router
