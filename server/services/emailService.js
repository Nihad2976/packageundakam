import nodemailer from 'nodemailer'

let transporter = null

export function getTransporter() {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT) || 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })
    console.log(`[EmailService] Configured SMTP with host: ${host}`)
  } else {
    // Development / fallback logger transporter
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('\n================== [OUTGOING EMAIL REMINDER] ==================')
        console.log(`To: ${mailOptions.to}`)
        console.log(`Subject: ${mailOptions.subject}`)
        console.log(`From: ${mailOptions.from || 'PackageUndakam <admin@packageundakam.com>'}`)
        console.log('----------------------------------------------------------------')
        console.log(mailOptions.text || '(HTML Email content dispatched)')
        console.log('===============================================================\n')
        return { messageId: `mock-${Date.now()}` }
      },
    }
    console.log('[EmailService] SMTP not fully configured. Using simulated logger transport.')
  }

  return transporter
}

export async function sendMonthlyReminderEmail({
  to,
  companyName,
  username,
  monthName,
  dueDate,
  paymentStatus = 'unpaid',
}) {
  const client = getTransporter()
  const fromEmail = process.env.SMTP_FROM || 'PackageUndakam Admin <admin@packageundakam.com>'
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

  const info = await client.sendMail({
    from: fromEmail,
    to,
    subject,
    text,
    html,
  })

  return { success: true, messageId: info.messageId, to }
}
