import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const dataDir = path.join(__dirname, 'data')
export const uploadsDir = path.join(__dirname, 'uploads', 'pdfs')
export const quotationsFile = path.join(dataDir, 'quotations.json')
export const invoicesFile = path.join(dataDir, 'invoices.json')
export const usersFile = path.join(dataDir, 'users.json')

// Company-specific folders
export const najDataDir = path.join(dataDir, 'naj')
export const piktoriaDataDir = path.join(dataDir, 'piktoria')

for (const dir of [dataDir, uploadsDir, najDataDir, piktoriaDataDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export function getCompanyKey(company) {
  if (!company) return 'naj'
  const c = String(company).toLowerCase().trim()
  if (c.includes('piktoria')) return 'piktoria'
  return 'naj'
}

export function getQuotationsFile(company) {
  const comp = getCompanyKey(company)
  const compDir = comp === 'piktoria' ? piktoriaDataDir : najDataDir
  const file = path.join(compDir, 'quotations.json')
  if (!fs.existsSync(file)) {
    // If migrating legacy naj quotations
    if (comp === 'naj' && fs.existsSync(quotationsFile)) {
      try {
        const legacy = fs.readFileSync(quotationsFile, 'utf-8')
        fs.writeFileSync(file, legacy)
      } catch {
        fs.writeFileSync(file, JSON.stringify([], null, 2))
      }
    } else {
      fs.writeFileSync(file, JSON.stringify([], null, 2))
    }
  }
  return file
}

export function getInvoicesFile(company) {
  const comp = getCompanyKey(company)
  const compDir = comp === 'piktoria' ? piktoriaDataDir : najDataDir
  const file = path.join(compDir, 'invoices.json')
  if (!fs.existsSync(file)) {
    if (comp === 'naj' && fs.existsSync(invoicesFile)) {
      try {
        const legacy = fs.readFileSync(invoicesFile, 'utf-8')
        fs.writeFileSync(file, legacy)
      } catch {
        fs.writeFileSync(file, JSON.stringify([], null, 2))
      }
    } else {
      fs.writeFileSync(file, JSON.stringify([], null, 2))
    }
  }
  return file
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

