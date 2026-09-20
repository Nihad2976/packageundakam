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

import {
  sendMonthlyReminderEmail,
  getResolvedEmailConfig,
  saveStoredEmailSettings,
  testTransporterConnection,
} from '../services/emailService.js'
import { getMonthEndDetails } from '../services/reminderScheduler.js'

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
        reminderEmail: u.reminderEmail || u.email,
        company: u.company,
        status: u.status || 'active',
        paymentStatus: u.paymentStatus || 'paid',
        lastUsed: u.lastUsed || null,
        lastReminderSent: u.lastReminderSent || null,
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
        reminderEmail: users[index].reminderEmail || users[index].email,
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

// PUT /api/admin/companies/:id/email - Update recipient email for reminders
router.put('/companies/:id/email', (req, res) => {
  try {
    const { email, reminderEmail } = req.body
    if (!email && !reminderEmail) {
      return res.status(400).json({ error: 'Valid email address is required' })
    }

    const users = readUsers()
    const index = users.findIndex((u) => u.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ error: 'Company not found' })
    }

    const updatedEmail = email ? email.trim() : users[index].email
    const updatedReminderEmail = reminderEmail !== undefined ? reminderEmail.trim() : users[index].reminderEmail

    users[index] = {
      ...users[index],
      email: updatedEmail,
      reminderEmail: updatedReminderEmail || updatedEmail,
      updatedAt: new Date().toISOString(),
    }

    writeUsers(users)

    res.json({
      success: true,
      company: {
        id: users[index].id,
        name: users[index].name,
        email: users[index].email,
        reminderEmail: users[index].reminderEmail,
      },
    })
  } catch (err) {
    console.error('Error updating company email:', err)
    res.status(500).json({ error: 'Failed to update company email' })
  }
})

// POST /api/admin/companies/:id/remind - Send manual reminder email to a company
router.post('/companies/:id/remind', async (req, res) => {
  try {
    const users = readUsers()
    const index = users.findIndex((u) => u.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ error: 'Company not found' })
    }

    const user = users[index]
    const { customEmail } = req.body
    const targetEmail = (customEmail && customEmail.trim()) || user.reminderEmail || user.email

    if (!targetEmail) {
      return res.status(400).json({ error: 'No recipient email address available' })
    }

    const details = getMonthEndDetails()
    await sendMonthlyReminderEmail({
      to: targetEmail,
      companyName: user.name,
      username: user.username || user.email,
      monthName: details.monthName,
      dueDate: details.dueDate,
      paymentStatus: user.paymentStatus || 'unpaid',
    })

    const now = new Date().toISOString()
    users[index] = {
      ...users[index],
      lastReminderSent: now,
      lastMonthReminderSent: details.monthKey,
      reminderEmail: targetEmail, // save as reminderEmail if specified
      updatedAt: now,
    }

    writeUsers(users)

    res.json({
      success: true,
      sentTo: targetEmail,
      lastReminderSent: now,
      month: details.monthName,
    })
  } catch (err) {
    console.error('Error sending company reminder:', err)
    res.status(400).json({ error: err.message || 'Failed to send reminder email' })
  }
})

// POST /api/admin/companies/remind-unpaid - Send reminders to all unpaid companies
router.post('/companies/remind-unpaid', async (req, res) => {
  try {
    const users = readUsers()
    const details = getMonthEndDetails()
    let sentCount = 0
    const now = new Date().toISOString()

    for (let i = 0; i < users.length; i++) {
      const u = users[i]
      if (u.role === 'admin' || u.status === 'blocked' || u.paymentStatus === 'paid') continue

      const targetEmail = u.reminderEmail || u.email
      if (!targetEmail) continue

      try {
        await sendMonthlyReminderEmail({
          to: targetEmail,
          companyName: u.name,
          username: u.username || u.email,
          monthName: details.monthName,
          dueDate: details.dueDate,
          paymentStatus: 'unpaid',
        })

        users[i].lastReminderSent = now
        users[i].lastMonthReminderSent = details.monthKey
        sentCount++
      } catch (e) {
        console.error(`Failed to send unpaid reminder to ${targetEmail}:`, e)
      }
    }

    if (sentCount > 0) {
      writeUsers(users)
    }

    res.json({
      success: true,
      count: sentCount,
      month: details.monthName,
    })
  } catch (err) {
    console.error('Error sending unpaid reminders:', err)
    res.status(500).json({ error: 'Failed to send unpaid reminders' })
  }
})

// GET /api/admin/email-settings - Check email configuration status
router.get('/email-settings', (req, res) => {
  try {
    const config = getResolvedEmailConfig()
    // Mask email for privacy: e.g. "ni***@gmail.com"
    let maskedUser = ''
    if (config.user) {
      const parts = config.user.split('@')
      if (parts.length === 2) {
        const name = parts[0]
        const maskedName = name.length > 2 ? `${name.slice(0, 2)}***` : `${name}***`
        maskedUser = `${maskedName}@${parts[1]}`
      } else {
        maskedUser = config.user
      }
    }

    res.json({
      configured: config.isConfigured,
      user: maskedUser,
      rawUser: config.user,
      senderName: config.senderName,
      service: config.service || 'gmail',
      host: config.host,
      port: config.port,
    })
  } catch (err) {
    console.error('Error fetching email settings:', err)
    res.status(500).json({ error: 'Failed to fetch email settings' })
  }
})

// POST /api/admin/email-settings - Save and test email configuration
router.post('/email-settings', async (req, res) => {
  try {
    const { user, pass, senderName, service, host, port } = req.body

    if (!user || !user.trim()) {
      return res.status(400).json({ error: 'Email address is required' })
    }

    // If password is not provided, see if we have existing password
    const existing = getResolvedEmailConfig()
    const passwordToUse = (pass && pass.trim()) || (existing && existing.pass)

    if (!passwordToUse) {
      return res.status(400).json({ error: '16-digit Google App Password is required' })
    }

    const testConfig = {
      user: user.trim(),
      pass: passwordToUse.trim().replace(/\s+/g, ''),
      senderName: (senderName && senderName.trim()) || 'PackageUndakam',
      service: (service && service.trim().toLowerCase()) || (user.toLowerCase().includes('@gmail.com') ? 'gmail' : ''),
      host: (host && host.trim()) || '',
      port: Number(port) || 587,
    }

    // Test the SMTP / Gmail connection before saving!
    try {
      await testTransporterConnection(testConfig)
    } catch (testErr) {
      console.error('Email connection test failed:', testErr)
      return res.status(400).json({
        error: `Email connection test failed: ${testErr.message || 'Please check your email and 16-digit App Password.'}`,
      })
    }

    // Save to settings file
    saveStoredEmailSettings(testConfig)

    res.json({
      success: true,
      message: 'Email configuration verified and saved successfully!',
      user: testConfig.user,
      senderName: testConfig.senderName,
    })
  } catch (err) {
    console.error('Error saving email settings:', err)
    res.status(500).json({ error: err.message || 'Failed to save email settings' })
  }
})

export default router
