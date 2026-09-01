import './env.js'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import quotationRoutes from './routes/quotations.js'
import invoiceRoutes from './routes/invoices.js'
import './config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '50mb' }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/', (req, res) => {
  res.send('PACKAGEUNDAKAM API is running successfully!')
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() })
})

app.use('/api/auth', authRoutes)
app.use('/api/quotations', quotationRoutes)
app.use('/api/invoices', invoiceRoutes)

app.listen(PORT, () => {
  console.log(`NAJ Wedding API running on http://localhost:${PORT}`)
})
