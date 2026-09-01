import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { JWT_SECRET, authMiddleware } from '../middleware/auth.js'
import { usersFile } from '../config.js'

const router = Router()

function readUsers() {
  if (!fs.existsSync(usersFile)) return []
  const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'))

  const hasNaj = users.some((u) => u.email === 'najwedding@gmail.com' || u.name === 'NAJ Wedding')
  if (!hasNaj) {
    const defaultUser = {
      id: 'naj-wedding-default-user-id',
      name: 'NAJ Wedding',
      email: 'najwedding@gmail.com',
      password: bcrypt.hashSync('najwedding', 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    users.push(defaultUser)
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
  }

  return users
}

function writeUsers(data) {
  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2))
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email === 'najwedding'
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
    const existing = users.find((u) => u.email === cleanEmail)
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists. Please login.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const now = new Date().toISOString()
    const newUser = {
      id: uuidv4(),
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    }

    users.push(newUser)
    writeUsers(users)

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' },
    )

    res.status(201).json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Server error during signup.' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const cleanEmail = email.trim().toLowerCase()

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' })
    }

    const users = readUsers()
    const user = users.find(
      (u) => u.email === cleanEmail || (cleanEmail === 'najwedding' && u.name === 'NAJ Wedding'),
    )
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please check your email or sign up.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Wrong password. Please try again.' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' },
    )

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server error during login.' })
  }
})

// GET /api/auth/me (Protected)
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user })
})

// GET /api/auth/verify (Protected)
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user })
})

export default router
