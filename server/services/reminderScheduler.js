import { readUsers, writeUsers } from '../routes/auth.js'
import { sendMonthlyReminderEmail } from './emailService.js'

export function getMonthEndDetails(date = new Date()) {
  const year = date.getFullYear()
  const month = date.getMonth() // 0-indexed
  const totalDays = new Date(year, month + 1, 0).getDate()
  const currentDay = date.getDate()
  const daysRemaining = totalDays - currentDay

  const monthName = date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const dueDate = new Date(year, month, totalDays).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
  const isMonthEnd = daysRemaining <= 5

  return {
    year,
    month,
    totalDays,
    currentDay,
    daysRemaining,
    monthName,
    dueDate,
    monthKey,
    isMonthEnd,
  }
}

export async function checkAndSendMonthlyReminders() {
  const details = getMonthEndDetails()

  // Only auto-send during the last 5 days of the month
  if (!details.isMonthEnd) {
    console.log(`[ReminderScheduler] Not month-end yet (${details.daysRemaining} days remaining in ${details.monthName}).`)
    return { sent: 0, skipped: 'Not month-end' }
  }

  console.log(`[ReminderScheduler] Month-end detected for ${details.monthName}. Checking company reminders...`)

  try {
    const users = readUsers()
    let sentCount = 0
    let changed = false

    for (const user of users) {
      if (user.role === 'admin' || user.status === 'blocked') continue

      // If reminder was already automatically sent for this month, skip
      if (user.lastMonthReminderSent === details.monthKey) {
        continue
      }

      const targetEmail = user.reminderEmail || user.email
      if (!targetEmail) continue

      try {
        console.log(`[ReminderScheduler] Sending month-end reminder to ${user.name} (${targetEmail})...`)
        await sendMonthlyReminderEmail({
          to: targetEmail,
          companyName: user.name,
          username: user.username || user.email,
          monthName: details.monthName,
          dueDate: details.dueDate,
          paymentStatus: user.paymentStatus || 'unpaid',
        })

        user.lastMonthReminderSent = details.monthKey
        user.lastReminderSent = new Date().toISOString()
        changed = true
        sentCount++
      } catch (err) {
        console.error(`[ReminderScheduler] Failed to send reminder to ${targetEmail}:`, err)
      }
    }

    if (changed) {
      writeUsers(users)
    }

    console.log(`[ReminderScheduler] Finished check. Sent ${sentCount} reminders.`)
    return { sent: sentCount, month: details.monthName }
  } catch (err) {
    console.error('[ReminderScheduler] Error running monthly reminders check:', err)
    return { error: err.message }
  }
}

export function initReminderScheduler() {
  // Check immediately on startup
  checkAndSendMonthlyReminders()

  // Run once every 24 hours (86,400,000 ms)
  const DAY_MS = 24 * 60 * 60 * 1000
  setInterval(() => {
    checkAndSendMonthlyReminders()
  }, DAY_MS)

  console.log('[ReminderScheduler] Initialized daily month-end reminder scheduler.')
}
