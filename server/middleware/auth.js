import jwt from 'jsonwebtoken'

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
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export { JWT_SECRET }
