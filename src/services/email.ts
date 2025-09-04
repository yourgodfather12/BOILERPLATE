import { Resend } from 'resend'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

const resend = new Resend(env.RESEND_API_KEY)

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export interface WelcomeEmailData {
  name: string
  email: string
}

export interface PasswordResetData {
  name: string
  email: string
  resetUrl: string
}

export interface SubscriptionEmailData {
  name: string
  email: string
  planName: string
  amount: number
}

export class EmailService {
  private defaultFrom = 'NextJS Boilerplate <noreply@yourapp.com>'

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const { data, error } = await resend.emails.send({
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        react: null,
      })

      if (error) {
        throw error
      }

      logger.info('Email sent successfully:', {
        id: data?.id,
        to: options.to,
        subject: options.subject,
      })
    } catch (error) {
      logger.error('Failed to send email:', error)
      throw new Error('Failed to send email')
    }
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to NextJS Boilerplate</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Welcome to NextJS Boilerplate!</h1>
            <p>Hi ${data.name},</p>
            <p>Thank you for joining NextJS Boilerplate! We're excited to have you on board.</p>
            <p>Here's what you can do to get started:</p>
            <ul>
              <li>Explore our AI chat features</li>
              <li>Create your first custom bot</li>
              <li>Customize your profile settings</li>
              <li>Check out our pricing plans</li>
            </ul>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The NextJS Boilerplate Team</p>
          </div>
        </body>
      </html>
    `

    const text = `
      Welcome to NextJS Boilerplate!

      Hi ${data.name},

      Thank you for joining NextJS Boilerplate! We're excited to have you on board.

      Here's what you can do to get started:
      - Explore our AI chat features
      - Create your first custom bot
      - Customize your profile settings
      - Check out our pricing plans

      If you have any questions, feel free to reach out to our support team.

      Best regards,
      The NextJS Boilerplate Team
    `

    await this.sendEmail({
      to: data.email,
      subject: 'Welcome to NextJS Boilerplate!',
      html,
      text,
    })
  }

  async sendPasswordResetEmail(data: PasswordResetData): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Reset Your Password</h1>
            <p>Hi ${data.name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetUrl}"
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>The NextJS Boilerplate Team</p>
          </div>
        </body>
      </html>
    `

    const text = `
      Reset Your Password

      Hi ${data.name},

      We received a request to reset your password. Click the link below to create a new password:

      ${data.resetUrl}

      This link will expire in 1 hour for security reasons.

      If you didn't request this password reset, please ignore this email.

      Best regards,
      The NextJS Boilerplate Team
    `

    await this.sendEmail({
      to: data.email,
      subject: 'Reset Your Password',
      html,
      text,
    })
  }

  async sendSubscriptionConfirmationEmail(data: SubscriptionEmailData): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Subscription Confirmed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Subscription Confirmed!</h1>
            <p>Hi ${data.name},</p>
            <p>Thank you for subscribing to our ${data.planName} plan!</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Subscription Details:</h3>
              <p><strong>Plan:</strong> ${data.planName}</p>
              <p><strong>Amount:</strong> $${data.amount}/month</p>
              <p><strong>Status:</strong> Active</p>
            </div>
            <p>You now have access to all the features included in your plan. You can manage your subscription anytime from your account settings.</p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The NextJS Boilerplate Team</p>
          </div>
        </body>
      </html>
    `

    const text = `
      Subscription Confirmed!

      Hi ${data.name},

      Thank you for subscribing to our ${data.planName} plan!

      Subscription Details:
      Plan: ${data.planName}
      Amount: $${data.amount}/month
      Status: Active

      You now have access to all the features included in your plan. You can manage your subscription anytime from your account settings.

      If you have any questions, feel free to reach out to our support team.

      Best regards,
      The NextJS Boilerplate Team
    `

    await this.sendEmail({
      to: data.email,
      subject: 'Subscription Confirmed - Welcome to NextJS Boilerplate!',
      html,
      text,
    })
  }

  async sendContactFormEmail(data: ContactFormData): Promise<void> {
    // Send confirmation to the user
    const userHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Contact Form Received</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Thank You for Contacting Us</h1>
            <p>Hi ${data.name},</p>
            <p>We've received your message and will get back to you as soon as possible, usually within 24 hours.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Your Message:</h3>
              <p><strong>Subject:</strong> ${data.subject}</p>
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-line;">${data.message}</p>
            </div>
            <p>Best regards,<br>The NextJS Boilerplate Team</p>
          </div>
        </body>
      </html>
    `

    const userText = `
      Thank You for Contacting Us

      Hi ${data.name},

      We've received your message and will get back to you as soon as possible, usually within 24 hours.

      Your Message:
      Subject: ${data.subject}
      Message: ${data.message}

      Best regards,
      The NextJS Boilerplate Team
    `

    // Send notification to admin/support
    const adminHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Contact Form Submission</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">New Contact Form Submission</h1>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Contact Details:</h3>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Subject:</strong> ${data.subject}</p>
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-line;">${data.message}</p>
            </div>
          </div>
        </body>
      </html>
    `

    const adminText = `
      New Contact Form Submission

      Contact Details:
      Name: ${data.name}
      Email: ${data.email}
      Subject: ${data.subject}
      Message: ${data.message}
    `

    // Send both emails
    await Promise.all([
      this.sendEmail({
        to: data.email,
        subject: 'Thank You for Contacting Us',
        html: userHtml,
        text: userText,
      }),
      this.sendEmail({
        to: 'support@yourapp.com', // Replace with your support email
        subject: `New Contact Form: ${data.subject}`,
        html: adminHtml,
        text: adminText,
      }),
    ])

    logger.info('Contact form emails sent:', {
      userEmail: data.email,
      subject: data.subject,
    })
  }

  async sendNotificationEmail(
    to: string,
    subject: string,
    message: string,
    type: 'info' | 'warning' | 'error' = 'info'
  ): Promise<void> {
    const colors = {
      info: '#2563eb',
      warning: '#d97706',
      error: '#dc2626',
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: ${colors[type]};">${subject}</h1>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p style="white-space: pre-line;">${message}</p>
            </div>
            <p>Best regards,<br>The NextJS Boilerplate Team</p>
          </div>
        </body>
      </html>
    `

    await this.sendEmail({
      to,
      subject,
      html,
      text: message,
    })
  }
}

export const emailService = new EmailService()
