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
          timeout: 10000, // 10s timeout to allow real carrier SMS delivery
        });
        logger.info('Twilio SMS client initialized', { accountSid: process.env.TWILIO_ACCOUNT_SID });
      } catch (twErr) {
        logger.warn('Failed to initialize Twilio client:', { error: twErr.message });
      }
    }
  }

  /**
   * Send Email Notification (via Brevo HTTP API, Resend HTTP API, or SMTP)
   */
  async sendEmail({ to, subject, html, text }) {
    if (!to) return { success: false, reason: 'NO_RECIPIENT' };

    // 1. Try Brevo (Sendinblue) HTTPS API (Port 443, reliable on Render)
    const brevoKey = process.env.BREVO_API_KEY;
    if (brevoKey && brevoKey.startsWith('xkeysib-')) {
      try {
        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          signal: AbortSignal.timeout(3000),
          headers: {
            'api-key': brevoKey,
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'HealthMate AI', email: process.env.SMTP_USER || 'abhishekgga140@gmail.com' },
            to: [{ email: to }],
            subject,
            htmlContent: html || `<p>${text}</p>`,
            textContent: text || '',
          }),
        });

        const brevoData = await brevoRes.json();
        if (brevoRes.ok) {
          logger.info('Email sent successfully via Brevo API', { messageId: brevoData.messageId, to });
          return { success: true, provider: 'brevo', messageId: brevoData.messageId };
        } else {
          logger.warn('Brevo API response:', { message: brevoData.message, code: brevoData.code, to });
        }
      } catch (brevoErr) {
        logger.warn('Brevo API delivery error, attempting fallback:', { error: brevoErr.message });
      }
    }

    // 2. Try Resend API if EMAIL_API_KEY is present
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

    // 3. Fallback to Nodemailer SMTP
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

    // If all real providers failed or are unconfigured, return honest provider failure status
    logger.warn('Email delivery failed across all configured providers', { to });
    return {
      success: false,
      provider: 'none',
      error: 'EMAIL_DELIVERY_FAILED',
      message: 'Email could not be delivered.'
    };
  }

  /**
   * Send SMS Notification (via Twilio Verify Service, Fast2SMS, or Twilio Messages)
   */
  async sendSMS({ to, body }) {
    if (process.env.SMS_ENABLED === 'false') {
      return {
        success: false,
        provider: 'none',
        error: 'SMS_DISABLED_BY_CONFIG',
        message: 'SMS dispatch is administratively disabled.'
      };
    }

    if (!to) return { success: false, reason: 'NO_PHONE_NUMBER' };

    let formattedPhone = to.trim();
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) formattedPhone = `+91${formattedPhone}`;
      else formattedPhone = `+${formattedPhone}`;
    }

    // 1. Try Twilio Verify API (Delivers real carrier SMS to Indian numbers without template rejections)
    if (this.twilioClient) {
      const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID || 'VA22d1ecf19c36afe90c791b3298263573';
      try {
        const verification = await this.twilioClient.verify.v2.services(serviceSid)
          .verifications
          .create({ to: formattedPhone, channel: 'sms' });
        logger.info('SMS dispatched via Twilio Verify Service', { sid: verification.sid, to: formattedPhone });
        return { success: true, provider: 'twilio-verify', sid: verification.sid };
      } catch (verifyErr) {
        logger.warn('Twilio Verify dispatch notice:', { error: verifyErr.message, to: formattedPhone });
      }
    }

    // 2. Try Fast2SMS Indian SMS Gateway fallback
    const cleanedDigits = to.replace(/\D/g, '');
    const mobile10 = cleanedDigits.length > 10 ? cleanedDigits.slice(-10) : cleanedDigits;
    const fast2smsKey = process.env.FAST2SMS_API_KEY;

    if (fast2smsKey && mobile10.length === 10) {
      try {
        const otpMatch = body.match(/\b\d{6}\b/);
        const otpCode = otpMatch ? otpMatch[0] : '';
        if (otpCode) {
          const otpUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(fast2smsKey)}&variables_values=${otpCode}&route=otp&numbers=${mobile10}`;
          const fastRes = await fetch(otpUrl, { method: 'GET', signal: AbortSignal.timeout(2000) });
          const fastData = await fastRes.json();
          if (fastData.return || fastData.status_code === 200) {
            logger.info('SMS delivered via Fast2SMS', { to: mobile10 });
            return { success: true, provider: 'fast2sms', requestId: fastData.request_id };
          }
        }
      } catch (fastErr) {
        logger.warn('Fast2SMS fallback error:', { error: fastErr.message });
      }
    }

    // 3. Try Standard Twilio Messages API
    if (this.twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        let fromNumber = process.env.TWILIO_PHONE_NUMBER.trim();
        if (!fromNumber.startsWith('+')) fromNumber = `+${fromNumber}`;

        const message = await this.twilioClient.messages.create({
          body,
          from: fromNumber,
          to: formattedPhone,
        });

        logger.info('SMS message dispatched via Twilio Messages', { sid: message.sid, to: formattedPhone });
        return { success: true, provider: 'twilio', sid: message.sid };
      } catch (twErr) {
        logger.warn('Twilio Messages dispatch rejected by provider:', { error: twErr.message, to: formattedPhone });
      }
    }

    return {
      success: false,
      provider: 'none',
      error: 'NO_SMS_PROVIDER_AVAILABLE',
    };
  }

  /**
   * Check verification code directly against Twilio Verify Service
   */
  async checkTwilioVerify({ to, code }) {
    if (!this.twilioClient || !to || !code) return { success: false };
    let formattedPhone = to.trim();
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) formattedPhone = `+91${formattedPhone}`;
      else formattedPhone = `+${formattedPhone}`;
    }
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID || 'VA22d1ecf19c36afe90c791b3298263573';
    try {
      const check = await this.twilioClient.verify.v2.services(serviceSid)
        .verificationChecks
        .create({ to: formattedPhone, code: code.trim() });
      if (check.status === 'approved' || check.valid) {
        logger.info('Twilio Verify code approved successfully', { to: formattedPhone });
        return { success: true, status: 'approved' };
      }
      return { success: false, status: check.status };
    } catch (err) {
      logger.warn('Twilio Verify check rejected or expired:', { error: err.message, to: formattedPhone });
      return { success: false, error: err.message };
    }
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
