const http = require('http');
const crypto = require('crypto');
const path = require('path');
const mongoose = require(path.join(__dirname, '../backend/node_modules/mongoose'));
require(path.join(__dirname, '../backend/node_modules/dotenv')).config({ path: path.join(__dirname, '../backend/.env') });

const CORRELATION_ID = 'TRACE-' + Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex');

function logStage(stageNum, stageName, details) {
  console.log(`\n[${CORRELATION_ID}] [STAGE ${stageNum}: ${stageName}]`);
  for (const [k, v] of Object.entries(details)) {
    console.log(`   ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`);
  }
}

async function apiRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5001,
        path: '/api/v1' + path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Origin: 'http://localhost:5174',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTrace() {
  console.log(`Starting Payment Workflow Diagnostic Trace with Correlation ID: ${CORRELATION_ID}`);

  // Connect to DB directly to observe records
  await mongoose.connect(process.env.MONGODB_URI);
  const { User, DoctorProfile, Appointment, PaymentTransaction } = require(path.join(__dirname, '../backend/src/models'));

  // Step 0: Ensure Test Patient & Doctor exist
  let testPatient = await User.findOne({ email: 'testpatient.audit@healthmate.ai' });
  if (!testPatient) {
    testPatient = await User.create({
      fullName: 'Test Audit Patient',
      email: 'testpatient.audit@healthmate.ai',
      passwordHash: 'dummy_hash_for_test',
      role: 'PATIENT',
      phone: '+919999999999',
    });
  }

  // Get or create test doctor
  let doctor = await DoctorProfile.findOne();
  if (!doctor) {
    throw new Error('No doctor profile found in DB for booking test.');
  }

  // Generate test JWT for patient
  const { generateAccessToken } = require(path.join(__dirname, '../backend/src/security/jwt'));
  const patientToken = generateAccessToken({
    id: testPatient._id.toString(),
    role: 'PATIENT',
    email: testPatient.email,
  });

  // Stage 1 & 2: Appointment creation
  const futureDays = 5 + Math.floor(Math.random() * 20);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + futureDays);
  const dateStr = tomorrow.toISOString().split('T')[0];
  const randomMinutes = Math.floor(Math.random() * 50);
  const timeSlot = `1${Math.floor(Math.random() * 8)}:${randomMinutes < 10 ? '0' + randomMinutes : randomMinutes}`;

  const bookRes = await apiRequest(
    'POST',
    '/appointments/book',
    {
      doctorId: doctor._id.toString(),
      scheduledDate: dateStr,
      timeSlot,
      consultationType: 'VIDEO',
      chiefComplaint: `Diagnostic Payment Trace complaint for ${CORRELATION_ID}`,
    },
    patientToken
  );

  logStage(1, 'Appointment Creation Request', {
    httpStatus: bookRes.status,
    success: bookRes.body.success,
    message: bookRes.body.message,
  });

  if (bookRes.status !== 201) {
    console.error('Failed to create appointment in trace:', bookRes.body);
    process.exit(1);
  }

  const appointmentData = bookRes.body.data;
  const appointmentId = appointmentData._id;
  const consultationFee = appointmentData.paymentAmount;

  logStage(2, 'Appointment ID & Consultation Fee', {
    appointmentId,
    consultationFee,
    initialStatus: appointmentData.status,
    initialPaymentStatus: appointmentData.paymentStatus,
    initialPaymentMethod: appointmentData.paymentMethod,
  });

  // Stage 3 & 4: Payment order creation API
  const orderRes = await apiRequest(
    'POST',
    '/payments/order',
    {
      appointmentId,
      amount: consultationFee,
      currency: 'INR',
    },
    patientToken
  );

  logStage(3, 'Payment Order Creation API Call', {
    httpStatus: orderRes.status,
    success: orderRes.body.success,
    error: orderRes.body.error,
    message: orderRes.body.message,
    body: orderRes.body,
    orderIdReturned: orderRes.body.data?.orderId,
    currency: orderRes.body.data?.currency,
    amount: orderRes.body.data?.amount,
  });

  const orderData = orderRes.body.data;
  const razorpayOrderId = orderData.orderId;

  logStage(4, 'Razorpay Order ID Returned by Backend', {
    orderId: razorpayOrderId,
    keyId: orderData.keyId,
    orderStatus: orderData.status,
  });

  // Stage 5: Razorpay Checkout Initialization
  const checkoutOptions = {
    key: orderData.keyId,
    amount: Math.round(consultationFee * 100),
    currency: orderData.currency || 'INR',
    name: 'HealthMate AI Healthcare',
    description: `Consultation with Dr. ${doctor.fullName}`,
    order_id: razorpayOrderId,
    prefill: {
      name: testPatient.fullName,
      email: testPatient.email,
    },
  };

  logStage(5, 'Razorpay Checkout Client Initialization Options', {
    amountInPaise: checkoutOptions.amount,
    currency: checkoutOptions.currency,
    orderIdPassed: checkoutOptions.order_id,
    hasKeyId: Boolean(checkoutOptions.key),
  });

  // Stage 6 & 7: Simulating Checkout Callback (Payment Success in Test Mode)
  const simulatedPaymentId = 'pay_trace_' + crypto.randomBytes(6).toString('hex');
  const validSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${simulatedPaymentId}`)
    .digest('hex');

  logStage(6, 'Checkout Success Callback Received', {
    event: 'handler',
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: simulatedPaymentId,
    signatureLength: validSignature.length,
  });

  logStage(7, 'Payment ID & Order ID Received by Frontend', {
    orderId: razorpayOrderId,
    paymentId: simulatedPaymentId,
  });

  // Stage 8: Signature verification API request
  logStage(8, 'Signature Verification API Request Sending', {
    endpoint: '/api/v1/payments/verify-signature',
    orderId: razorpayOrderId,
    paymentId: simulatedPaymentId,
    appointmentId,
  });

  const verifyRes = await apiRequest(
    'POST',
    '/payments/verify-signature',
    {
      orderId: razorpayOrderId,
      paymentId: simulatedPaymentId,
      signature: validSignature,
      appointmentId,
    },
    patientToken
  );

  // Stage 9: Backend HMAC verification response
  logStage(9, 'Backend HMAC Verification Response', {
    httpStatus: verifyRes.status,
    success: verifyRes.body.success,
    verified: verifyRes.body.data?.verified,
    backendStatus: verifyRes.body.data?.status,
    errorMessage: verifyRes.body.message || verifyRes.body.error,
  });

  // Stage 10: MongoDB payment record update
  const paymentRecord = await PaymentTransaction.findOne({ orderId: razorpayOrderId });
  logStage(10, 'MongoDB Payment Record State', {
    transactionId: paymentRecord?._id.toString(),
    status: paymentRecord?.status,
    method: paymentRecord?.method,
    paymentId: paymentRecord?.paymentId,
    amount: paymentRecord?.amount,
  });

  // Stage 11: Appointment status update
  const updatedAppointment = await Appointment.findById(appointmentId);
  logStage(11, 'Appointment Status in MongoDB Post-Verification', {
    appointmentId: updatedAppointment?._id.toString(),
    status: updatedAppointment?.status,
    paymentStatus: updatedAppointment?.paymentStatus,
    paymentMethod: updatedAppointment?.paymentMethod,
    paymentReferenceId: updatedAppointment?.paymentReferenceId,
  });

  // Stage 12: Frontend Final Status Display logic
  const isConfirmed = updatedAppointment?.status === 'CONFIRMED' && updatedAppointment?.paymentStatus === 'PAID';
  const isPaymentPending = updatedAppointment?.status === 'PENDING_PAYMENT' || updatedAppointment?.paymentStatus === 'PENDING';
  const isPaymentFailed = updatedAppointment?.status === 'PAYMENT_FAILED' || updatedAppointment?.paymentStatus === 'FAILED';

  logStage(12, 'Frontend Final Status Display Evaluation', {
    isConfirmed,
    isPaymentPending,
    isPaymentFailed,
    computedBadge: isConfirmed ? 'Confirmed & Paid (Emerald)' : isPaymentFailed ? 'Payment Failed (Red)' : 'Payment Pending (Amber)',
  });

  await mongoose.disconnect();
  console.log('\nDiagnostic trace completed successfully.\n');
}

runTrace().catch((err) => {
  console.error('Trace error:', err);
  process.exit(1);
});
