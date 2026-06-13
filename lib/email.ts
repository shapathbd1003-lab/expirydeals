const APP_URL = process.env.APP_URL || 'http://localhost:3000'
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@expirydeals.com'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

async function sendEmail(options: EmailOptions) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    // Dev fallback: log to console
    console.log('\n--- EMAIL ---')
    console.log('To:', options.to)
    console.log('Subject:', options.subject)
    console.log('Body (HTML):', options.html)
    console.log('-------------\n')
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Email send failed:', err)
  }
}

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const link = `${APP_URL}/verify-email?token=${token}`
  await sendEmail({
    to: email,
    subject: 'Verify your ExpiryDeals account',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#16a34a">Welcome to ExpiryDeals, ${name}!</h2>
        <p>Click the button below to verify your email address:</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#16a34a;color:white;text-decoration:none;border-radius:6px;font-weight:600">Verify Email</a>
        <p style="color:#666;font-size:14px;margin-top:24px">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${APP_URL}/reset-password?token=${token}`
  await sendEmail({
    to: email,
    subject: 'Reset your ExpiryDeals password',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#16a34a">Password Reset</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#16a34a;color:white;text-decoration:none;border-radius:6px;font-weight:600">Reset Password</a>
        <p style="color:#666;font-size:14px;margin-top:24px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  })
}
