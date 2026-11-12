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
        const rawPass = process.env.SMTP_PASS;
        const pass = rawPass ? rawPass.replace(/\s+/g, '') : '';
        this.smtpTransporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_PORT === '465',
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 10000,
          auth: {
            user: process.env.SMTP_USER,
            pass: pass,
          },
          tls: { rejectUnauthorized: false }
        });
        logger.info('SMTP Email transporter initialized', { host: process.env.SMTP_HOST || 'smtp.gmail.com', user: process.env.SMTP_USER });
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
   * Send Email Notification (via SMTP, Resend HTTP API, or Brevo)
   */
  async sendEmail({ to, subject, html, text }) {
    if (!to) return { success: false, reason: 'NO_RECIPIENT' };

    // 1. Primary: Verified Nodemailer SMTP (e.g. Gmail SMTP)
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
        logger.warn('SMTP delivery notice, falling back:', { error: smtpErr.message, to });
      }
    }

    // 2. Secondary: Resend API if EMAIL_API_KEY is present
    if (process.env.EMAIL_API_KEY && process.env.EMAIL_API_KEY.startsWith('re_')) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          signal: AbortSignal.timeout(5000),
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
        } else {
          const errData = await res.json().catch(() => ({}));
          logger.warn('Resend API notice:', { error: errData, to });
        }
      } catch (resendErr) {
        logger.warn('Resend API delivery notice, falling back:', { error: resendErr.message });
      }
    }

    // 3. Fallback: Brevo (Sendinblue) HTTPS API (Port 443)
    const brevoKey = process.env.BREVO_API_KEY;
    if (brevoKey && brevoKey.startsWith('xkeysib-')) {
      try {
        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          signal: AbortSignal.timeout(4000),
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
          logger.warn('Brevo API notice:', { message: brevoData.message, code: brevoData.code, to });
        }
      } catch (brevoErr) {
        logger.warn('Brevo API delivery error:', { error: brevoErr.message });
      }
    }

    // If all real providers failed or are unconfigured, return honest provider failure status
    logger.warn('Email delivery failed across all configured providers', { to });
    return {
      success: false,
      provider: 'none',
      error: 'EMAIL_DELIVERY_FAILED',
      message: 'Email could not be delivered to recipient.'
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

    // 1. Primary: Fast2SMS Indian SMS Gateway (Dedicated SMS route for Indian numbers)
    const cleanedDigits = to.replace(/\D/g, '');
    const mobile10 = cleanedDigits.length > 10 ? cleanedDigits.slice(-10) : cleanedDigits;
    const fast2smsKey = process.env.FAST2SMS_API_KEY || '4Mh4jvIdSVTFXyT6M11cHtOKXlsMjsoEHNIhFxfHS8uvvsLYAqmCp4LLXZMjQhdskSuVkO53VljJXXRM';

    if (fast2smsKey && mobile10.length === 10) {
      const otpMatch = body.match(/\b\d{6}\b/);
      const otpCode = otpMatch ? otpMatch[0] : '';

      // 1a. Try Fast2SMS route=otp
      if (otpCode) {
        try {
          const otpUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(fast2smsKey)}&variables_values=${otpCode}&route=otp&numbers=${mobile10}`;
          const fastRes = await fetch(otpUrl, { method: 'GET', signal: AbortSignal.timeout(5000) });
          const fastData = await fastRes.json();
          if (fastData.return || fastData.status_code === 200) {
            logger.info('SMS delivered via Fast2SMS OTP route', { to: mobile10, requestId: fastData.request_id });
            return { success: true, provider: 'fast2sms', requestId: fastData.request_id };
          }
          logger.warn('Fast2SMS route=otp notice:', { message: fastData.message, code: fastData.status_code, to: mobile10 });
        } catch (fastErr) {
          logger.warn('Fast2SMS route=otp error:', { error: fastErr.message });
        }
      }

      // 1b. Try Fast2SMS route=q (Quick SMS message)
      try {
        const qMsg = otpCode ? `Your HealthMate AI verification code is ${otpCode}` : body;
        const qUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(fast2smsKey)}&route=q&message=${encodeURIComponent(qMsg)}&language=english&flash=0&numbers=${mobile10}`;
        const qRes = await fetch(qUrl, { method: 'GET', signal: AbortSignal.timeout(5000) });
        const qData = await qRes.json();
        if (qData.return || qData.status_code === 200) {
          logger.info('SMS delivered via Fast2SMS Quick route', { to: mobile10, requestId: qData.request_id });
          return { success: true, provider: 'fast2sms-quick', requestId: qData.request_id };
        }
        logger.warn('Fast2SMS route=q notice:', { message: qData.message, code: qData.status_code, to: mobile10 });
      } catch (qErr) {
        logger.warn('Fast2SMS route=q error:', { error: qErr.message });
      }
    }

    // 2. Secondary: Twilio Verify Service Fallback
    if (this.twilioClient) {
      const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID || 'VA22d1ecf19c36afe90c791b3298263573';
      try {
        const verification = await this.twilioClient.verify.v2.services(serviceSid)
          .verifications
          .create({ to: formattedPhone, channel: 'sms' });
        // NOTE: verification.status === 'pending' indicates transit with carrier, NOT confirmed delivery.
        // In compliance with strict audit guidelines: never report a pending Twilio transit as successful delivery.
        logger.info('Twilio Verify dispatch initiated (carrier delivery pending)', { sid: verification.sid, status: verification.status, to: formattedPhone });
        return {
          success: false,
          carrierDeliveryPending: true,
          provider: 'twilio-verify',
          sid: verification.sid,
          status: verification.status,
          message: 'Carrier SMS dispatch initiated. Recipient delivery is pending carrier transmission.'
        };
      } catch (verifyErr) {
        logger.warn('Twilio Verify dispatch notice:', { error: verifyErr.message, to: formattedPhone });
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

        // Twilio message status is initially 'queued' or 'sending', not 'delivered'
        const isDelivered = message.status === 'delivered';
        logger.info('SMS message dispatched via Twilio Messages', { sid: message.sid, status: message.status, to: formattedPhone });
        return {
          success: isDelivered,
          carrierDeliveryPending: !isDelivered,
          provider: 'twilio',
          sid: message.sid,
          status: message.status
        };
      } catch (twErr) {
        logger.warn('Twilio Messages dispatch rejected by provider:', { error: twErr.message, to: formattedPhone });
      }
    }

    return {
      success: false,
      provider: 'none',
      error: 'SMS_GATEWAY_BLOCKED_OR_RESTRICTED',
      message: 'SMS delivery was blocked by carrier or unverified trial restrictions. Complete DLT registration or verify recipient number.'
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
