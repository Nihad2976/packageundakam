import nodemailer from 'nodemailer'
import fs from 'fs'
import { emailSettingsFile } from '../config.js'

export function getStoredEmailSettings() {
  try {
    if (fs.existsSync(emailSettingsFile)) {
      const data = JSON.parse(fs.readFileSync(emailSettingsFile, 'utf-8'))
      if (data && typeof data === 'object') return data
    }
  } catch (err) {
    console.error('Error reading email_settings.json:', err)
  }
  return null
}

export function saveStoredEmailSettings(settings) {
  try {
    fs.writeFileSync(emailSettingsFile, JSON.stringify(settings, null, 2))
    return true
  } catch (err) {
    console.error('Error saving email_settings.json:', err)
    throw err
  }
}

export function getResolvedEmailConfig() {
  const stored = getStoredEmailSettings()

  const user = (stored && stored.user) || process.env.EMAIL_USER || process.env.GMAIL_USER || process.env.SMTP_USER || ''
  const pass = (stored && stored.pass) || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASS || process.env.SMTP_PASS || ''
  const senderName = (stored && stored.senderName) || process.env.EMAIL_SENDER_NAME || 'PackageUndakam'
  const service = (stored && stored.service) || (user.toLowerCase().includes('@gmail.com') ? 'gmail' : '')
  const host = (stored && stored.host) || process.env.SMTP_HOST || ''
  const port = Number((stored && stored.port) || process.env.SMTP_PORT) || 587

  const isConfigured = Boolean(user && pass)

  return {
    isConfigured,
    user: user.trim(),
    pass: pass.trim().replace(/\s+/g, ''), // strip spaces from Google app passwords
    senderName: senderName.trim(),
    service: service.trim().toLowerCase(),
    host: host.trim(),
    port,
  }
}

export function createMailTransporter(customConfig = null) {
  const config = customConfig || getResolvedEmailConfig()

  if (!config.user || !config.pass) {
    return null
  }

  if (config.service === 'gmail' || config.user.toLowerCase().includes('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.user,
        pass: config.pass,
      },
    })
  }

  // Custom SMTP
  if (config.host) {
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    })
  }

  // Fallback to gmail service if not specified
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })
}

export async function testTransporterConnection(customConfig) {
  const transporter = createMailTransporter(customConfig)
  if (!transporter) {
    throw new Error('Please provide both email address and password.')
  }
  return await transporter.verify()
}

export async function sendMonthlyReminderEmail({
  to,
  companyName,
  username,
  monthName,
  dueDate,
  paymentStatus = 'unpaid',
}) {
  const config = getResolvedEmailConfig()

  if (!config.isConfigured) {
    throw new Error(
      'Email service is not configured! Please click "Email Settings" in the Admin Panel and enter your Gmail address and 16-digit Google App Password.'
    )
  }

  const transporter = createMailTransporter(config)
  if (!transporter) {
    throw new Error('Failed to initialize mail transporter with current credentials.')
  }

  const fromEmail = `"${config.senderName || 'PackageUndakam'}" <${config.user}>`
  const subject = `Monthly Subscription Reminder - ${companyName} (${monthName})`
  const isPaid = paymentStatus.toLowerCase() === 'paid'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d1117; color: #f0f6fc; margin: 0; padding: 24px; }
    .card { max-width: 580px; margin: 0 auto; background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { text-align: center; border-bottom: 1px solid #21262d; padding-bottom: 20px; margin-bottom: 24px; }
    .brand { font-size: 20px; font-weight: 800; letter-spacing: 1.5px; color: #f59e0b; margin: 0; }
    .sub { font-size: 13px; color: #8b949e; margin-top: 4px; }
    .greeting { font-size: 17px; font-weight: 600; color: #e6edf3; margin-bottom: 16px; }
    .info-box { background: #0d1117; border: 1px solid #30363d; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #21262d; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #8b949e; }
    .info-val { font-weight: 600; color: #f0f6fc; }
    .badge-unpaid { color: #f87171; background: rgba(239, 68, 68, 0.15); padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .badge-paid { color: #34d399; background: rgba(16, 185, 129, 0.15); padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .message { line-height: 1.6; color: #c9d1d9; font-size: 14px; margin-bottom: 24px; }
    .footer { font-size: 12px; color: #8b949e; text-align: center; border-top: 1px solid #21262d; padding-top: 20px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="brand">PACKAGEUNDAKAM</h1>
      <p class="sub">Package &amp; Invoice Generator Platform</p>
    </div>

    <div class="greeting">Hello ${companyName || 'Valued Partner'},</div>

    <p class="message">
      This is a friendly reminder from <strong>PackageUndakam</strong> regarding your monthly subscription for <strong>${monthName}</strong>.
      Please ensure your monthly payment is settled before the end of the month to maintain uninterrupted access to the package and invoice generator.
    </p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Company:</span>
        <span class="info-val">${companyName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Account / Username:</span>
        <span class="info-val">${username || 'N/A'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Billing Month:</span>
        <span class="info-val">${monthName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Due Date:</span>
        <span class="info-val">${dueDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Current Payment Status:</span>
        <span class="${isPaid ? 'badge-paid' : 'badge-unpaid'}">${paymentStatus.toUpperCase()}</span>
      </div>
    </div>

    <p class="message">
      If you have already processed your payment, kindly reply to this email or reach out to the system administrator to verify your receipt.
    </p>

    <div class="footer">
      &copy; ${new Date().getFullYear()} PackageUndakam. All rights reserved.<br>
      This is an automated monthly payment reminder notification.
    </div>
  </div>
</body>
</html>
  `

  const text = `
PACKAGEUNDAKAM - Monthly Subscription Reminder

Hello ${companyName},

This is a reminder regarding your monthly subscription payment for ${monthName}.
Due Date: ${dueDate}
Company: ${companyName}
Payment Status: ${paymentStatus.toUpperCase()}

Please ensure your payment is completed by the end of the month to keep your account active and avoid any service disruption.
If you have already paid, please notify the administrator.

Thank you,
PackageUndakam Admin Team
  `.trim()

  console.log(`[EmailService] Dispatching real email from ${fromEmail} to ${to}...`)
  const info = await transporter.sendMail({
    from: fromEmail,
    to,
    subject,
    text,
    html,
  })

  console.log(`[EmailService] Email successfully sent to ${to}! Message ID: ${info.messageId}`)
  return { success: true, messageId: info.messageId, to }
}
