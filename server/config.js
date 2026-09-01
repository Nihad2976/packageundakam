import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const dataDir = path.join(__dirname, 'data')
export const uploadsDir = path.join(__dirname, 'uploads', 'pdfs')
export const quotationsFile = path.join(dataDir, 'quotations.json')
export const invoicesFile = path.join(dataDir, 'invoices.json')
export const usersFile = path.join(dataDir, 'users.json')

for (const dir of [dataDir, uploadsDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

if (!fs.existsSync(quotationsFile)) {
  fs.writeFileSync(quotationsFile, JSON.stringify([], null, 2))
}

if (!fs.existsSync(invoicesFile)) {
  fs.writeFileSync(invoicesFile, JSON.stringify([], null, 2))
}

if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([], null, 2))
}
