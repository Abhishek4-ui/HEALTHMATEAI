const nodemailer = require('nodemailer');
require('../config/env');
const logger = require('../utils/logger');

class CommunicationService {
  constructor() {
    this.smtpTransporter = null;
    this.twilioClient = null;
    this.initProviders();
  }

  initProviders() {
    // 1. Initialize SMTP / Email provider
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        this.smtpTransporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_PORT === '465',
          connectionTimeout: 2500,
          greetingTimeout: 2500,
          socketTimeout: 2500,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        logger.info('SMTP Email transporter initialized', { host: process.env.SMTP_HOST, user: process.env.SMTP_USER });
      } catch (err) {
        logger.warn('Failed to initialize SMTP transporter:', { error: err.message });
      }
    }

    // 2. Initialize Twilio SMS Client
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN, {
          timeout: 2000, // 2s timeout to prevent test hangs
        });
        logger.info('Twilio SMS client initialized', { accountSid: process.env.TWILIO_ACCOUNT_SID });
      } catch (twErr) {
        logger.warn('Failed to initialize Twilio client:', { error: twErr.message });
      }
    }
  }

  /**
   * Send Email Notification (via Resend HTTP API or SMTP)
   */
  async sendEmail({ to, subject, html, text }) {
    if (!to) return { success: false, reason: 'NO_RECIPIENT' };

    // Try Resend API if EMAIL_API_KEY is present
    if (process.env.EMAIL_API_KEY && process.env.EMAIL_API_KEY.startsWith('re_')) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          signal: AbortSignal.timeout(2000),
          headers: {
            Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'HealthMate AI <onboarding@resend.dev>',
            to: [to],
            subject,
            html: html || `<p>${text}</p>`,
          }),
        });

        if (res.ok) {
          const resData = await res.json();
          logger.info('Email sent successfully via Resend API', { id: resData.id, to });
          return { success: true, provider: 'resend', messageId: resData.id };
        }
      } catch (resendErr) {
        logger.warn('Resend API delivery error, falling back to SMTP:', { error: resendErr.message });
      }
    }

    // Fallback to Nodemailer SMTP
    if (this.smtpTransporter) {
      try {
        const info = await this.smtpTransporter.sendMail({
          from: `"HealthMate AI" <${process.env.SMTP_USER}>`,
          to,
          subject,
          text: text || '',
          html: html || `<p>${text}</p>`,
        });
        logger.info('Email dispatched via SMTP transporter', { messageId: info.messageId, to });
        return { success: true, provider: 'smtp', messageId: info.messageId };
      } catch (smtpErr) {
        logger.warn('SMTP delivery failed:', { error: smtpErr.message, to });
      }
    }

    // If both real providers failed or are unconfigured, return honest provider failure status
    logger.warn('Email delivery failed across all configured providers', { to });
    return {
      success: false,
      provider: 'none',
      error: 'EMAIL_DELIVERY_FAILED',
      message: 'Email could not be delivered. In development, Resend requires verified recipient (abhishekgga140@gmail.com) and Gmail SMTP requires a 16-character App Password.'
    };
  }

  /**
   * Send SMS Notification via Twilio
   */
  async sendSMS({ to, body }) {
    if (process.env.SMS_ENABLED === 'false') {
      return {
        success: false,
        provider: 'twilio',
        error: 'SMS_DISABLED_BY_CONFIG',
        message: 'SMS dispatch is administratively disabled or requires verified TRAI DLT registration and production sender ID in production.'
      };
    }

    if (!to) return { success: false, reason: 'NO_PHONE_NUMBER' };

    let formattedPhone = to.trim();
    if (!formattedPhone.startsWith('+')) {
      // Standardize Indian mobile number
      if (formattedPhone.length === 10) formattedPhone = `+91${formattedPhone}`;
      else formattedPhone = `+${formattedPhone}`;
    }

    if (this.twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        let fromNumber = process.env.TWILIO_PHONE_NUMBER.trim();
        if (!fromNumber.startsWith('+')) fromNumber = `+${fromNumber}`;

        const message = await this.twilioClient.messages.create({
          body,
          from: fromNumber,
          to: formattedPhone,
        });

        logger.info('SMS message dispatched via Twilio', { sid: message.sid, to: formattedPhone });
        return { success: true, provider: 'twilio', sid: message.sid };
      } catch (twErr) {
        logger.warn('Twilio SMS dispatch rejected by provider:', { error: twErr.message, to: formattedPhone });
        return {
          success: false,
          provider: 'twilio',
          error: 'TWILIO_PROVIDER_ERROR',
          details: twErr.message,
          message: 'SMS delivery rejected by Twilio. Trial accounts require provisioned Twilio phone numbers and verified recipient numbers.'
        };
      }
    }

    logger.warn('Twilio client or sender phone number not configured for SMS', { to: formattedPhone });
    return {
      success: false,
      provider: 'twilio',
      error: 'TWILIO_NOT_CONFIGURED',
      message: 'Twilio SMS is not fully configured with a provisioned sender phone number.'
    };
  }

  /**
   * Send Appointment Confirmation Notifications (Both Email & SMS)
   */
  async sendAppointmentConfirmation({ patientEmail, patientPhone, doctorName, date, time, appointmentId }) {
    const emailSubject = `Appointment Confirmed with Dr. ${doctorName} - HealthMate AI`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-2xl;">
        <h2 style="color: #0D9488;">HealthMate AI Healthcare</h2>
        <p>Dear Patient,</p>
        <p>Your consultation slot has been confirmed with <strong>Dr. ${doctorName}</strong>.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 10px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Appointment Reference:</strong> ${appointmentId}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 5px 0;"><strong>Time Slot:</strong> ${time}</p>
        </div>
        <p>You can access your consultation room via the Patient Portal prior to your appointment time.</p>
        <p style="font-size: 12px; color: #64748b; margin-top: 20px;">HealthMate AI • Confidential Health Information Notice</p>
      </div>
    `;

    const smsBody = `HealthMate AI: Your appointment with Dr. ${doctorName} on ${date} at ${time} is confirmed. Ref: ${appointmentId.slice(-8)}.`;

    const results = await Promise.allSettled([
      patientEmail ? this.sendEmail({ to: patientEmail, subject: emailSubject, html: emailHtml }) : Promise.resolve(null),
      patientPhone ? this.sendSMS({ to: patientPhone, body: smsBody }) : Promise.resolve(null),
    ]);

    return {
      emailStatus: results[0].status === 'fulfilled' ? results[0].value : null,
      smsStatus: results[1].status === 'fulfilled' ? results[1].value : null,
    };
  }
}

module.exports = new CommunicationService();
