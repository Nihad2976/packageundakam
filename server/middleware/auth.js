import jwt from 'jsonwebtoken'
import fs from 'fs'
import { usersFile } from '../config.js'

const JWT_SECRET = process.env.JWT_SECRET || 'naj-wedding-jwt-secret'

export function authMiddleware(req, res, next) {
  let token = null
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    token = header.slice(7)
  } else if (req.query?.token) {
    token = req.query.token
  }

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    let role = decoded.role || 'company'
    let status = decoded.status || 'active'
    let paymentStatus = decoded.paymentStatus || 'paid'

    let company = decoded.company
    // Fetch fresh user record from usersFile if available
    try {
      if (fs.existsSync(usersFile)) {
        const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'))
        const fresh = users.find((u) => u.id === decoded.id || u.email === decoded.email)
        if (fresh) {
          role = fresh.role || (fresh.username === 'admin' ? 'admin' : 'company')
          status = fresh.status || 'active'
          paymentStatus = fresh.paymentStatus || 'paid'
          if (fresh.company) {
            company = fresh.company
          }
        }
      }
    } catch (e) {
      console.warn('Error reading fresh user in authMiddleware:', e)
    }

    if (!company) {
      const lower = ((decoded.name || '') + ' ' + (decoded.email || '')).toLowerCase()
      if (lower.includes('fewday')) company = 'fewdays'
      else if (lower.includes('piktoria')) company = 'piktoria'
      else if (lower.includes('lithe')) company = 'litheads'
      else company = 'naj'
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      company,
      role,
      status,
      paymentStatus,
    }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' })
  }
  next()
}

export function checkBlockedMiddleware(req, res, next) {
  if (req.user && req.user.role !== 'admin' && req.user.status === 'blocked') {
    return res.status(403).json({
      error: 'Your account has been temporarily blocked due to pending monthly subscription payment. Please contact the administrator to restore access.',
      isBlocked: true,
    })
  }
  next()
}

export { JWT_SECRET }
