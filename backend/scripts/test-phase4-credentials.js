const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const nodemailer = require('nodemailer');
const { S3Client, HeadBucketCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const twilio = require('twilio');

async function testGmailSMTP() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return { success: false, reason: 'SMTP credentials missing from .env' };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });

  try {
    const verified = await transporter.verify();
    return { success: true, verified, details: `Connected to ${host}:${port} as ${user}` };
  } catch (err) {
    return {
      success: false,
      code: err.code || err.responseCode,
      message: err.message,
      note: 'Gmail requires a 16-character App Password (myaccount.google.com/apppasswords) when 2FA is active.'
    };
  }
}

async function testTwilioSMS() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return { success: false, reason: 'Twilio SID / Auth Token missing' };
  }

  try {
    const client = twilio(accountSid, authToken);
    const account = await client.api.v2010.accounts(accountSid).fetch();
    return {
      success: true,
      accountName: account.friendlyName,
      status: account.status,
      type: account.type
    };
  } catch (err) {
    return { success: false, code: err.code, status: err.status, message: err.message };
  }
}

async function testTwilioWebRTC() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return { success: false, reason: 'Twilio SID / Auth Token missing' };
  }

  try {
    const client = twilio(accountSid, authToken);
    // Request an ephemeral NTS Network Traversal token for WebRTC STUN/TURN servers
    const token = await client.tokens.create();
    return {
      success: true,
      username: token.username,
      ttl: token.ttl,
      iceServersCount: token.iceServers ? token.iceServers.length : 0,
      iceServersSample: token.iceServers ? token.iceServers.map(s => s.urls).flat().slice(0, 3) : []
    };
  } catch (err) {
    return { success: false, code: err.code, status: err.status, message: err.message };
  }
}

async function testAWSS3() {
  const region = process.env.AWS_REGION || 'ap-south-1';
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey || !bucket) {
    return { success: false, reason: 'AWS S3 credentials or bucket name missing' };
  }

  try {
    const s3 = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey }
    });

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 5
    });

    const res = await s3.send(command);
    return {
      success: true,
      bucket,
      region,
      keyCount: res.KeyCount,
      statusCode: res.$metadata.httpStatusCode
    };
  } catch (err) {
    return {
      success: false,
      code: err.name,
      statusCode: err.$metadata?.httpStatusCode,
      message: err.message
    };
  }
}

async function run() {
  console.log('Testing End-to-End Integrations...\n');

  console.log('1. Testing Gmail SMTP:');
  const smtpRes = await testGmailSMTP();
  console.log(JSON.stringify(smtpRes, null, 2));

  console.log('\n2. Testing Twilio SMS / Account Lookup:');
  const twilioRes = await testTwilioSMS();
  console.log(JSON.stringify(twilioRes, null, 2));

  console.log('\n3. Testing Twilio WebRTC STUN/TURN ICE Token Creation:');
  const webrtcRes = await testTwilioWebRTC();
  console.log(JSON.stringify(webrtcRes, null, 2));

  console.log('\n4. Testing AWS S3 Bucket Access:');
  const s3Res = await testAWSS3();
  console.log(JSON.stringify(s3Res, null, 2));
}

run();
