const mongoose = require('mongoose');
const paymentService = require('../../src/services/payment.service');
const { PaymentTransaction, Appointment } = require('../../src/models');

describe('Manual UPI Payment Lifecycle & Reconciliation Unit Tests', () => {
  const mockPatientId = new mongoose.Types.ObjectId();
  const mockAdminId = new mongoose.Types.ObjectId();
  let mockAppointmentId;

  beforeAll(async () => {
    // Set test merchant details
    process.env.MERCHANT_UPI_ID = 'healthmate@icici';
    process.env.MERCHANT_NAME = 'HealthMate Medical Care';

    // Mock Appointment
    mockAppointmentId = new mongoose.Types.ObjectId();
    jest.spyOn(Appointment, 'findById').mockImplementation(async (id) => {
      if (id.toString() === mockAppointmentId.toString()) {
        return {
          _id: mockAppointmentId,
          paymentAmount: 500,
          paymentStatus: 'PENDING',
          patientId: mockPatientId,
        };
      }
      return null;
    });

    jest.spyOn(Appointment, 'findByIdAndUpdate').mockImplementation(async (id, update) => {
      return { _id: id, ...update };
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('UPI-TEST-01: Initiate Manual UPI payment with genuine deep link and PENDING status', async () => {
    jest.spyOn(PaymentTransaction, 'create').mockImplementation(async (data) => ({
      _id: new mongoose.Types.ObjectId(),
      ...data,
      save: jest.fn(),
    }));

    const result = await paymentService.initiateManualUpi({
      appointmentId: mockAppointmentId,
      patientId: mockPatientId,
      paymentType: 'APPOINTMENT',
      amount: 500,
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('PENDING');
    expect(result.paymentReference).toMatch(/^UPI-HM-/);
    expect(result.merchantConfigured).toBe(true);
    expect(result.upiDeepLink).toContain('healthmate%40icici');
    expect(result.upiDeepLink).toContain('am=500');
  });

  test('UPI-TEST-02: Submit UTR updates status to PENDING_VERIFICATION and rejects malformed UTR', async () => {
    // Malformed UTR rejection
    await expect(
      paymentService.submitUpiUtr({
        transactionId: new mongoose.Types.ObjectId(),
        patientId: mockPatientId,
        utrNumber: '123', // Too short
      })
    ).rejects.toThrow('Valid bank UTR / transaction reference number');

    // Valid UTR submission
    const mockTx = {
      _id: new mongoose.Types.ObjectId(),
      appointmentId: mockAppointmentId,
      patientId: mockPatientId,
      status: 'PENDING',
      paymentReference: 'UPI-HM-TEST123',
      manualUpi: {},
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(PaymentTransaction, 'findOne').mockImplementation(async (query) => {
      if (query._id && query.patientId) return mockTx;
      if (query['manualUpi.utrNumber']) return null; // No duplicate
      return null;
    });

    const submitRes = await paymentService.submitUpiUtr({
      transactionId: mockTx._id,
      patientId: mockPatientId,
      utrNumber: '412345678901',
      receiptUrl: 'https://s3.amazonaws.com/healthmate/receipt_001.png',
    });

    expect(submitRes.success).toBe(true);
    expect(submitRes.status).toBe('PENDING_VERIFICATION');
    expect(mockTx.manualUpi.utrNumber).toBe('412345678901');
    expect(mockTx.status).toBe('PENDING_VERIFICATION');
  });

  test('UPI-TEST-03: Rejection of duplicate UTR across different transactions', async () => {
    const existingTx = { _id: new mongoose.Types.ObjectId(), status: 'VERIFIED' };
    const currentTx = {
      _id: new mongoose.Types.ObjectId(),
      patientId: mockPatientId,
      status: 'PENDING',
      manualUpi: {},
    };

    jest.spyOn(PaymentTransaction, 'findOne').mockImplementation(async (query) => {
      if (query._id) return currentTx;
      if (query['manualUpi.utrNumber']) return existingTx; // Duplicate found
      return null;
    });

    await expect(
      paymentService.submitUpiUtr({
        transactionId: currentTx._id,
        patientId: mockPatientId,
        utrNumber: 'DUPLICATE1234',
      })
    ).rejects.toThrow('This UTR number has already been submitted');
  });

  test('UPI-TEST-04: Admin verifies manual UPI payment upon bank statement reconciliation', async () => {
    const mockTx = {
      _id: new mongoose.Types.ObjectId(),
      appointmentId: mockAppointmentId,
      status: 'PENDING_VERIFICATION',
      manualUpi: { utrNumber: '412345678901' },
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(PaymentTransaction, 'findById').mockResolvedValue(mockTx);

    const verifyRes = await paymentService.adminVerifyUpiPayment({
      transactionId: mockTx._id,
      adminUserId: mockAdminId,
      notes: 'Verified against bank credits batch 2026-11-12',
    });

    expect(verifyRes.success).toBe(true);
    expect(verifyRes.status).toBe('VERIFIED');
    expect(mockTx.status).toBe('VERIFIED');
    expect(mockTx.manualUpi.verifiedBy).toEqual(mockAdminId);
    expect(mockTx.manualUpi.verifiedAt).toBeInstanceOf(Date);
  });

  test('UPI-TEST-05: Admin rejects manual UPI payment with required legitimate reason', async () => {
    const mockTx = {
      _id: new mongoose.Types.ObjectId(),
      appointmentId: mockAppointmentId,
      status: 'PENDING_VERIFICATION',
      manualUpi: { utrNumber: 'FAKE99999999' },
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(PaymentTransaction, 'findById').mockResolvedValue(mockTx);

    // Missing reason rejection
    await expect(
      paymentService.adminRejectUpiPayment({
        transactionId: mockTx._id,
        adminUserId: mockAdminId,
        reason: '',
      })
    ).rejects.toThrow('A legitimate reason for rejection is required');

    // Valid rejection
    const rejectRes = await paymentService.adminRejectUpiPayment({
      transactionId: mockTx._id,
      adminUserId: mockAdminId,
      reason: 'UTR reference not found in ICICI merchant bank account ledger',
    });

    expect(rejectRes.success).toBe(true);
    expect(rejectRes.status).toBe('REJECTED');
    expect(mockTx.status).toBe('REJECTED');
    expect(mockTx.manualUpi.rejectionReason).toContain('not found in ICICI');
  });

  test('UPI-TEST-06: Refund request and administrative refund processing lifecycle', async () => {
    const mockTx = {
      _id: new mongoose.Types.ObjectId(),
      appointmentId: mockAppointmentId,
      patientId: mockPatientId,
      status: 'VERIFIED',
      manualUpi: {},
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(PaymentTransaction, 'findOne').mockResolvedValue(mockTx);
    jest.spyOn(PaymentTransaction, 'findById').mockResolvedValue(mockTx);

    // 1. Patient requests refund
    const refundReq = await paymentService.requestRefund({
      transactionId: mockTx._id,
      patientId: mockPatientId,
      reason: 'Clinician emergency cancellation',
    });

    expect(refundReq.success).toBe(true);
    expect(refundReq.status).toBe('REFUND_REQUESTED');
    expect(mockTx.status).toBe('REFUND_REQUESTED');

    // 2. Admin processes refund
    const processRes = await paymentService.adminProcessRefund({
      transactionId: mockTx._id,
      adminUserId: mockAdminId,
      refundNotes: 'Approved full refund back to original source UPI handle',
    });

    expect(processRes.success).toBe(true);
    expect(processRes.status).toBe('REFUNDED');
    expect(mockTx.status).toBe('REFUNDED');
    expect(mockTx.manualUpi.refundProcessedAt).toBeInstanceOf(Date);
  });
});
