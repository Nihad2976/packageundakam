import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { JWT_SECRET, authMiddleware } from '../middleware/auth.js'
import { getQuotationsFile, usersFile } from '../config.js'

const router = Router()

function getLatestQuotationDate(company) {
  try {
    const qFile = getQuotationsFile(company)
    if (fs.existsSync(qFile)) {
      const list = JSON.parse(fs.readFileSync(qFile, 'utf-8'))
      if (Array.isArray(list) && list.length > 0) {
        const sorted = list
          .filter((q) => q.updatedAt || q.createdAt)
          .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        if (sorted[0]) return sorted[0].updatedAt || sorted[0].createdAt
      }
    }
  } catch {
    // ignore
  }
  return null
}

export function readUsers() {
  if (!fs.existsSync(usersFile)) return []
  const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'))

  const hasAdmin = users.some(
    (u) => u.role === 'admin' || u.username === 'admin' || u.email === 'admin@packageundakam.com'
  )
  if (!hasAdmin) {
    const adminUser = {
      id: 'admin-default-user-id',
      name: 'System Administrator',
      email: 'admin@packageundakam.com',
      username: 'admin',
      company: 'admin',
      role: 'admin',
      status: 'active',
      paymentStatus: 'paid',
      password: bcrypt.hashSync('admin123', 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    users.push(adminUser)
  }

  const hasNaj = users.some((u) => u.email === 'najwedding@gmail.com' || u.name === 'NAJ Wedding')
  if (!hasNaj) {
    const defaultUser = {
      id: 'naj-wedding-default-user-id',
      name: 'NAJ Wedding',
      email: 'najwedding@gmail.com',
      username: 'najwedding',
      company: 'naj',
      role: 'company',
      status: 'active',
      paymentStatus: 'paid',
      password: bcrypt.hashSync('najwedding', 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    users.push(defaultUser)
  }

  const hasPiktoria = users.some(
    (u) =>
      u.email === 'piktoria@gmail.com' ||
      u.username === 'piktoria' ||
      u.name?.toLowerCase() === 'piktoria' ||
      u.name?.toLowerCase() === 'piktoria weddings'
  )
  if (!hasPiktoria) {
    const piktoriaUser = {
      id: 'piktoria-wedding-default-user-id',
      name: 'Piktoria Weddings',
      email: 'piktoria@gmail.com',
      username: 'piktoria',
      company: 'piktoria',
      role: 'company',
      status: 'active',
      paymentStatus: 'paid',
      password: '$2b$10$G9gqb0LvD8vgQUFd.cEcBOAVEpB1/svmWuZYrZDwQyUxdij19SJTS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    users.push(piktoriaUser)
  }

  const hasLitheAds = users.some(
    (u) =>
      u.email === 'lithe.adsevents@gmail.com' ||
      u.username === 'litheads' ||
      u.name?.toLowerCase() === 'lithe ads' ||
      u.company === 'litheads'
  )
  if (!hasLitheAds) {
    const litheAdsUser = {
      id: 'lithe-ads-default-user-id',
      name: 'Lithe Ads',
      email: 'lithe.adsevents@gmail.com',
      username: 'litheads',
      company: 'litheads',
      role: 'company',
      status: 'active',
      paymentStatus: 'paid',
      password: '$2b$10$I/ool2SICjvd69MMwQ6vnOeUDvT46xaS1kspD8IOE6/EVtVG.8sDq',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    users.push(litheAdsUser)
  }

  const hasFewdays = users.some(
    (u) =>
      u.email === 'fewdaysstories@gmail.com' ||
      u.username === 'fewdays' ||
      u.username === 'fewdaysstories' ||
      u.company === 'fewdays'
  )
  if (!hasFewdays) {
    const fewdaysPassword = process.env.FEWDAYS_QUOTATION_PASSWORD || 'safwan191'
    const fewdaysUser = {
      id: 'fewdays-stories-default-user-id',
      name: 'FEWDAYS STORIES',
      email: 'fewdaysstories@gmail.com',
      username: 'fewdays',
      company: 'fewdays',
      role: 'company',
      status: 'active',
      paymentStatus: 'paid',
      password: bcrypt.hashSync(fewdaysPassword, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    users.push(fewdaysUser)
  }

  // Ensure all users have company, role, status, paymentStatus fields set
  let updated = false
  for (const u of users) {
    if (!u.company) {
      const lower = (u.name || '').toLowerCase()
      if (lower.includes('fewday')) {
        u.company = 'fewdays'
      } else if (lower.includes('piktoria')) {
        u.company = 'piktoria'
      } else if (lower.includes('lithe')) {
        u.company = 'litheads'
      } else if (u.username === 'admin' || u.role === 'admin') {
        u.company = 'admin'
      } else {
        u.company = 'naj'
      }
      updated = true
    }

    if (!u.role) {
      u.role = u.username === 'admin' || u.company === 'admin' ? 'admin' : 'company'
      updated = true
    }

    if (!u.status) {
      u.status = 'active'
      updated = true
    }

    if (!u.paymentStatus) {
      u.paymentStatus = 'paid'
      updated = true
    }

    if (u.lastUsed === undefined && u.role !== 'admin') {
      u.lastUsed = getLatestQuotationDate(u.company) || null
      updated = true
    }
  }

  if (!hasAdmin || !hasNaj || !hasPiktoria || !hasLitheAds || !hasFewdays || updated) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
  }

  return users
}

// Seed on startup
readUsers()

export function writeUsers(data) {
  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2))
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false
  const val = email.trim().toLowerCase()
  if (val === 'najwedding' || val === 'piktoria' || /^[a-zA-Z0-9._-]+$/.test(val)) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body

    if (!name?.trim() || !email?.trim() || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required.' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = name.trim()

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' })
    }

    const users = readUsers()
    const existing = users.find((u) => u.email === cleanEmail || u.username === cleanEmail)
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists. Please login.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const now = new Date().toISOString()
    const lowerName = cleanName.toLowerCase()
    const company = lowerName.includes('piktoria') ? 'piktoria' : lowerName.includes('lithe') ? 'litheads' : 'naj'
    const newUser = {
      id: uuidv4(),
      name: cleanName,
      email: cleanEmail,
      company,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    }

    users.push(newUser)
    writeUsers(users)

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name, company: newUser.company },
      JWT_SECRET,
      { expiresIn: '7d' },
    )

    res.status(201).json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, company: newUser.company },
    })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Server error during signup.' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const email = req.body.email || req.body.username
    const password = req.body.password

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required.' })
    }

    const cleanInput = email.trim().toLowerCase()

    if (!isValidEmail(cleanInput)) {
      return res.status(400).json({ error: 'Please enter a valid username or email address.' })
    }

    const users = readUsers()
    const user = users.find((u) => {
      const uEmail = (u.email || '').toLowerCase()
      const uUsername = (u.username || '').toLowerCase()
      const uName = (u.name || '').toLowerCase()
      return (
        uEmail === cleanInput ||
        uUsername === cleanInput ||
        uName === cleanInput ||
        (cleanInput === 'najwedding' && (uName.includes('naj') || uEmail.includes('naj'))) ||
        (cleanInput === 'piktoria' && (uName.includes('piktoria') || uEmail.includes('piktoria') || uUsername === 'piktoria')) ||
        (cleanInput === 'litheads' && (uName.includes('lithe') || uEmail.includes('lithe') || uUsername === 'litheads')) ||
        ((cleanInput === 'fewdays' || cleanInput === 'fewdaysstories') && (uName.includes('fewday') || uEmail.includes('fewday') || uUsername.includes('fewday') || u.company === 'fewdays'))
      )
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found. Please check your credentials or sign up.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Wrong password. Please try again.' })
    }

    const company =
      user.company ||
      ((user.name || '').toLowerCase().includes('fewday')
        ? 'fewdays'
        : (user.name || '').toLowerCase().includes('piktoria')
          ? 'piktoria'
          : (user.name || '').toLowerCase().includes('lithe')
            ? 'litheads'
            : user.username === 'admin'
              ? 'admin'
              : 'naj')
    const role = user.role || (user.username === 'admin' ? 'admin' : 'company')
    const status = user.status || 'active'
    const paymentStatus = user.paymentStatus || 'paid'
    const lastUsed = user.lastUsed || null

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, company, role, status },
      JWT_SECRET,
      { expiresIn: '7d' },
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        company,
        role,
        status,
        paymentStatus,
        lastUsed,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server error during login.' })
  }
})

// GET /api/auth/me (Protected)
router.get('/me', authMiddleware, (req, res) => {
  const users = readUsers()
  const freshUser = users.find((u) => u.id === req.user.id || u.email === req.user.email)
  if (freshUser) {
    const compLower = ((freshUser.name || '') + ' ' + (freshUser.email || '') + ' ' + (freshUser.username || '')).toLowerCase()
    const company = freshUser.company || (compLower.includes('fewday') ? 'fewdays' : compLower.includes('piktoria') ? 'piktoria' : compLower.includes('lithe') ? 'litheads' : 'naj')
    return res.json({
      user: {
        id: freshUser.id,
        name: freshUser.name,
        username: freshUser.username,
        email: freshUser.email,
        company,
        role: freshUser.role || (freshUser.username === 'admin' ? 'admin' : 'company'),
        status: freshUser.status || 'active',
        paymentStatus: freshUser.paymentStatus || 'paid',
        lastUsed: freshUser.lastUsed || null,
      },
    })
  }
  res.json({ user: req.user })
})

// GET /api/auth/verify (Protected)
router.get('/verify', authMiddleware, (req, res) => {
  const users = readUsers()
  const freshUser = users.find((u) => u.id === req.user.id || u.email === req.user.email)
  if (freshUser) {
    const compLower = ((freshUser.name || '') + ' ' + (freshUser.email || '') + ' ' + (freshUser.username || '')).toLowerCase()
    const company = freshUser.company || (compLower.includes('fewday') ? 'fewdays' : compLower.includes('piktoria') ? 'piktoria' : compLower.includes('lithe') ? 'litheads' : 'naj')
    return res.json({
      valid: true,
      user: {
        id: freshUser.id,
        name: freshUser.name,
        username: freshUser.username,
        email: freshUser.email,
        company,
        role: freshUser.role || (freshUser.username === 'admin' ? 'admin' : 'company'),
        status: freshUser.status || 'active',
        paymentStatus: freshUser.paymentStatus || 'paid',
        lastUsed: freshUser.lastUsed || null,
      },
    })
  }
  res.json({ valid: true, user: req.user })
})

export default router
