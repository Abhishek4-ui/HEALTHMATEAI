import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Lock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  QrCode,
  ArrowRight,
  X,
  Video,
  Phone,
  Building,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';
import { patientService } from '../../../services/patientService';
import { discoveryService } from '../../../services/discoveryService';

export default function Module08_AppointmentManagement() {
  const [searchParams] = useSearchParams();
  const preselectedDoctorId = searchParams.get('doctorId');

  const [tab, setTab] = useState(preselectedDoctorId ? 'book' : 'upcoming');
  const [loading, setLoading] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotMessage, setSlotMessage] = useState('');
  
  // Real patient appointments list
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Dedicated Payment Selection Modal State
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    appointment: null,
    doctor: null,
    method: 'RAZORPAY', // 'RAZORPAY' or 'MANUAL_UPI'
    loading: false,
    orderData: null,
    upiDetails: null,
    utrNumber: '',
    receiptUrl: '',
    submittedUtr: false,
  });

  const { addToast } = useToast();

  const [bookingForm, setBookingForm] = useState({
    doctorId: preselectedDoctorId || '',
    consultationType: 'VIDEO',
    scheduledDate: '',
    timeSlot: '',
    chiefComplaint: '',
  });

  // Load real verified doctors on mount
  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await discoveryService.searchDoctors({ verificationStatus: 'CREDENTIAL_VERIFIED' });
        const docs = res.doctors || [];
        setDoctorsList(docs);
        if (preselectedDoctorId && docs.some(d => d._id === preselectedDoctorId)) {
          setBookingForm(prev => ({ ...prev, doctorId: preselectedDoctorId }));
        } else if (docs.length > 0 && !bookingForm.doctorId) {
          setBookingForm(prev => ({ ...prev, doctorId: docs[0]._id }));
        }
      } catch (e) {
        setDoctorsList([]);
      }
    }
    fetchDoctors();
  }, [preselectedDoctorId]);

  // Load patient appointments on mount and when tab changes
  useEffect(() => {
    loadAppointments();
  }, [tab]);

  const loadAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const res = await patientService.getAppointments();
      const list = res.data?.appointments || res.data || [];
      setAppointments(Array.isArray(list) ? list : []);
    } catch (err) {
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // When doctor or date changes, dynamically fetch genuine available slots
  useEffect(() => {
    if (!bookingForm.doctorId || !bookingForm.scheduledDate) {
      setAvailableSlots([]);
      setSlotMessage('');
      return;
    }

    async function fetchSlots() {
      setLoadingSlots(true);
      setSlotMessage('');
      try {
        const res = await discoveryService.getDoctorAvailability(bookingForm.doctorId, bookingForm.scheduledDate);
        if (res.isAvailable && res.slots && res.slots.length > 0) {
          setAvailableSlots(res.slots);
          setSlotMessage(`${res.availableSlotsCount} verified slot(s) available.`);
        } else {
          setAvailableSlots([]);
          setSlotMessage(res.message || 'No slots available for this day. Please select another date.');
        }
      } catch (err) {
        setAvailableSlots([]);
        setSlotMessage('Could not retrieve slot availability for selected date.');
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [bookingForm.doctorId, bookingForm.scheduledDate]);

  // Handle Booking Submission -> Creates appointment as PENDING_PAYMENT, then opens Payment Modal
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.scheduledDate || !bookingForm.timeSlot || !bookingForm.chiefComplaint) {
      addToast({ type: 'warning', title: 'Missing Details', message: 'Please select a date, verified time slot, and reason for consultation.' });
      return;
    }

    setLoading(true);
    try {
      const res = await patientService.bookAppointment(bookingForm);
      const newAppointment = res.data?.appointment || res.data;
      const targetDoctor = selectedDoctorObj || { fullName: 'Specialist', consultationFee: 500 };

      addToast({
        type: 'info',
        title: 'Appointment Reserved',
        message: 'Please choose your preferred payment option to confirm your consultation.',
      });

      // Open dedicated Payment Selection Modal
      openPaymentModal(newAppointment, targetDoctor);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Booking Request Failed',
        message: err?.response?.data?.message || err?.message || 'Could not complete appointment booking. Please try another slot or contact the clinic.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Open Payment Selection Modal
  const openPaymentModal = async (appointment, doctor) => {
    const docObj = doctor || appointment?.doctorId || {};
    setPaymentModal({
      isOpen: true,
      appointment,
      doctor: docObj,
      method: 'RAZORPAY',
      loading: false,
      orderData: null,
      upiDetails: null,
      utrNumber: '',
      receiptUrl: '',
      submittedUtr: false,
    });
  };

  // Trigger Razorpay Checkout
  const handleRazorpayPay = async () => {
    if (!paymentModal.appointment) return;
    const appointmentId = paymentModal.appointment._id || paymentModal.appointment.id;
    const amount = paymentModal.appointment.paymentAmount || paymentModal.doctor?.consultationFee || 500;

    setPaymentModal(prev => ({ ...prev, loading: true }));
    try {
      const orderRes = await patientService.createPaymentOrder({
        appointmentId,
        amount,
        currency: 'INR',
      });
      const orderData = orderRes.data || orderRes;

      // Dynamically load Razorpay SDK
      const scriptLoaded = await new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Razorpay payment gateway SDK could not be loaded. Please check your network.');
      }

      const options = {
        key: orderData.keyId || 'rzp_test_Tyml08EyeVHKJY',
        amount: Math.round(amount * 100),
        currency: orderData.currency || 'INR',
        name: 'HealthMate AI Healthcare',
        description: `Consultation with Dr. ${paymentModal.doctor?.fullName || 'Specialist'}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            await patientService.verifyPaymentSignature({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              appointmentId: appointmentId,
            });

            addToast({
              type: 'success',
              title: 'Payment & Consultation Confirmed',
              message: `Payment ${response.razorpay_payment_id} verified. Appointment confirmed!`,
            });

            setPaymentModal(prev => ({ ...prev, isOpen: false }));
            loadAppointments();
            setTab('upcoming');
          } catch (sigErr) {
            addToast({
              type: 'error',
              title: 'Signature Verification Failed',
              message: sigErr.message || 'Payment signature could not be verified.',
            });
          }
        },
        prefill: {
          name: 'HealthMate Patient',
          email: 'patient@healthmate.ai',
          contact: '9999999999',
        },
        theme: {
          color: '#0D9488',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        addToast({
          type: 'error',
          title: 'Payment Incomplete',
          message: resp?.error?.description || 'Payment was cancelled or rejected by gateway.',
        });
      });
      rzp.open();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Payment Gateway Error',
        message: err?.response?.data?.message || err?.message || 'Failed to initiate Razorpay checkout.',
      });
    } finally {
      setPaymentModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Switch to Manual UPI Rail & Fetch dynamic QR / VPA details
  const handleSelectManualUpi = async () => {
    setPaymentModal(prev => ({ ...prev, method: 'MANUAL_UPI', loading: true }));
    try {
      const appointmentId = paymentModal.appointment._id || paymentModal.appointment.id;
      const amount = paymentModal.appointment.paymentAmount || paymentModal.doctor?.consultationFee || 500;

      const upiRes = await patientService.initiateManualUpi({
        appointmentId,
        amount,
        paymentType: 'APPOINTMENT',
      });
      const data = upiRes.data || upiRes;
      setPaymentModal(prev => ({
        ...prev,
        upiDetails: data,
        loading: false,
      }));
    } catch (err) {
      addToast({
        type: 'error',
        title: 'UPI Initiation Error',
        message: err?.response?.data?.message || err?.message || 'Could not load manual UPI details.',
      });
      setPaymentModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Submit 12-Digit Bank UTR Number for Manual UPI
  const handleSubmitUpiUtr = async (e) => {
    e.preventDefault();
    if (!paymentModal.utrNumber || !/^[A-Za-z0-9]{8,22}$/.test(paymentModal.utrNumber.trim())) {
      addToast({
        type: 'warning',
        title: 'Invalid UTR Number',
        message: 'Please provide a valid 8 to 22-character alphanumeric bank reference / UTR number from your payment app.',
      });
      return;
    }

    setPaymentModal(prev => ({ ...prev, loading: true }));
    try {
      const transactionId = paymentModal.upiDetails?.transactionId;
      await patientService.submitUpiUtr({
        transactionId,
        utrNumber: paymentModal.utrNumber.trim(),
        receiptUrl: paymentModal.receiptUrl || undefined,
      });

      addToast({
        type: 'success',
        title: 'UTR Submitted for Verification',
        message: 'Your payment reference has been recorded and is pending administrative reconciliation.',
      });

      setPaymentModal(prev => ({ ...prev, isOpen: false, submittedUtr: true }));
      loadAppointments();
      setTab('upcoming');
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: err?.response?.data?.message || err?.message || 'Failed to submit bank UTR.',
      });
    } finally {
      setPaymentModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Cancel Appointment
  const handleCancelAppointment = async (appointmentId) => {
    const reason = window.prompt('Please enter the reason for cancellation:') || 'Patient requested cancellation.';
    if (!reason) return;

    try {
      await patientService.cancelAppointment(appointmentId, reason);
      addToast({
        type: 'info',
        title: 'Appointment Cancelled',
        message: 'Your consultation has been cancelled.',
      });
      loadAppointments();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Cancellation Failed',
        message: err?.response?.data?.message || err?.message || 'Could not cancel appointment.',
      });
    }
  };

  const selectedDoctorObj = doctorsList.find(d => d._id === bookingForm.doctorId);

  // Group appointments
  const upcomingList = appointments.filter(a => ['CONFIRMED', 'PENDING_PAYMENT', 'REQUESTED'].includes(a.status));
  const previousList = appointments.filter(a => ['COMPLETED', 'CANCELLED', 'RESCHEDULED'].includes(a.status));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Appointments & Consultations
          </h2>
          <p className="text-xs text-slate-500">
            Schedule council-accredited consultations, choose secure payment rails, and access verified appointments.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            tab === 'upcoming'
              ? 'bg-aurora-teal text-aurora-midnight shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-aurora-navy'
          }`}
        >
          <span>Upcoming</span>
          {upcomingList.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900/10 text-[10px] font-bold">
              {upcomingList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setTab('book')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            tab === 'book'
              ? 'bg-aurora-teal text-aurora-midnight shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-aurora-navy'
          }`}
        >
          <span>Book Consultation</span>
        </button>

        <button
          onClick={() => setTab('previous')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            tab === 'previous'
              ? 'bg-aurora-teal text-aurora-midnight shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-aurora-navy'
          }`}
        >
          <span>Past Consultations</span>
        </button>
      </div>

      {/* Tab: Book Consultation */}
      {tab === 'book' && (
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Schedule Verified Consultation</h3>
            <Badge variant="teal">Council Accredited</Badge>
          </div>

          <form onSubmit={handleBookingSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Doctor *</label>
              <select
                value={bookingForm.doctorId}
                onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value, timeSlot: '' })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              >
                {doctorsList.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.fullName} — {doc.specialization} ({doc.address?.state ? `${doc.address.city}, ${doc.address.state}` : 'India'}) • ₹{doc.consultationFee || 500}
                  </option>
                ))}
              </select>
              {selectedDoctorObj && (
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                  <span>Reg: {selectedDoctorObj.medicalRegistrationNumber} ({selectedDoctorObj.stateMedicalCouncil})</span>
                  <span>•</span>
                  <span>Fee: ₹{selectedDoctorObj.consultationFee || 500}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mode</label>
                <select
                  value={bookingForm.consultationType}
                  onChange={(e) => setBookingForm({ ...bookingForm, consultationType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                >
                  <option value="VIDEO">Encrypted Video Call</option>
                  <option value="AUDIO">Audio Call</option>
                  <option value="IN_PERSON">In-Person Clinic Visit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingForm.scheduledDate}
                  onChange={(e) => setBookingForm({ ...bookingForm, scheduledDate: e.target.value, timeSlot: '' })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Real Time Slot * {loadingSlots && <span className="text-aurora-teal text-[10px]">(Checking...)</span>}
                </label>
                <select
                  value={bookingForm.timeSlot}
                  onChange={(e) => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                  disabled={availableSlots.length === 0 || loadingSlots}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white disabled:opacity-50"
                >
                  <option value="">{availableSlots.length === 0 ? 'No slots available' : 'Choose verified slot'}</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {slotMessage && (
              <p className={`text-[11px] flex items-center gap-1.5 ${availableSlots.length > 0 ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {availableSlots.length > 0 ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{slotMessage}</span>
              </p>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason for Visit *</label>
              <textarea
                rows={3}
                required
                value={bookingForm.chiefComplaint}
                onChange={(e) => setBookingForm({ ...bookingForm, chiefComplaint: e.target.value })}
                placeholder="Describe your health symptoms, medical concern, or questions for the doctor..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-800 dark:text-teal-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-aurora-teal shrink-0" />
              <span>
                Dual-rail payment protection: Pay securely via Razorpay Test Mode or direct manual UPI transfer with zero platform fee.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={availableSlots.length === 0 || !bookingForm.timeSlot}
              className="w-full flex items-center justify-center gap-2"
            >
              <span>Proceed to Payment (₹{selectedDoctorObj?.consultationFee || 500})</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      )}

      {/* Tab: Upcoming Appointments */}
      {tab === 'upcoming' && (
        <div className="space-y-4">
          {loadingAppointments ? (
            <div className="p-8 text-center text-xs text-slate-500">
              <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-aurora-teal" />
              Loading your scheduled consultations...
            </div>
          ) : upcomingList.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming appointments"
              description="You do not have any active consultations scheduled at this moment."
              actionLabel="Schedule an Appointment"
              onAction={() => setTab('book')}
            />
          ) : (
            upcomingList.map((apt) => {
              const doc = apt.doctorId || {};
              const isPaymentPending = apt.status === 'PENDING_PAYMENT' || apt.paymentStatus === 'PENDING';
              const isUpiVerification = apt.paymentStatus === 'PENDING_VERIFICATION';
              const isConfirmed = apt.status === 'CONFIRMED' && apt.paymentStatus === 'PAID';

              return (
                <Card key={apt._id} className="p-4 sm:p-5 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Dr. {doc.fullName || 'Medical Specialist'}
                        </h4>
                        <Badge variant="teal">{doc.specialization || 'Consultant'}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {doc.hospitalAffiliation?.facilityName || 'HealthMate Healthcare Network'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isConfirmed && (
                        <Badge variant="emerald" className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Confirmed & Paid</span>
                        </Badge>
                      )}
                      {isPaymentPending && (
                        <Badge variant="amber" className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Payment Pending</span>
                        </Badge>
                      )}
                      {isUpiVerification && (
                        <Badge variant="blue" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>UTR Verification Pending</span>
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-aurora-teal shrink-0" />
                      <span>{new Date(apt.scheduledDate).toDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-aurora-teal shrink-0" />
                      <span>{apt.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {apt.consultationType === 'IN_PERSON' ? (
                        <Building className="w-3.5 h-3.5 text-aurora-teal shrink-0" />
                      ) : (
                        <Video className="w-3.5 h-3.5 text-aurora-teal shrink-0" />
                      )}
                      <span>{apt.consultationType || 'VIDEO'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                      <span>Fee: ₹{apt.paymentAmount || doc.consultationFee || 500}</span>
                    </div>
                  </div>

                  {apt.chiefComplaint && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">Reason: </span>
                      {apt.chiefComplaint}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                    {isPaymentPending && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => openPaymentModal(apt, doc)}
                        className="flex items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Complete Payment (₹{apt.paymentAmount || doc.consultationFee || 500})</span>
                      </Button>
                    )}

                    {isConfirmed && apt.teleconsultationRoomId && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          window.location.href = `/teleconsultation/${apt.teleconsultationRoomId}`;
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5 text-aurora-teal" />
                        <span>Join Teleconsultation</span>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancelAppointment(apt._id)}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      Cancel Consultation
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Past Consultations */}
      {tab === 'previous' && (
        <div className="space-y-4">
          {previousList.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No past appointments"
              description="Your completed or past consultations will appear here."
            />
          ) : (
            previousList.map((apt) => {
              const doc = apt.doctorId || {};
              return (
                <Card key={apt._id} className="p-4 sm:p-5 space-y-2 opacity-80">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Dr. {doc.fullName || 'Medical Specialist'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {new Date(apt.scheduledDate).toDateString()} at {apt.timeSlot}
                      </p>
                    </div>
                    <Badge variant={apt.status === 'COMPLETED' ? 'emerald' : 'slate'}>
                      {apt.status}
                    </Badge>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DUAL-RAIL PAYMENT SELECTION MODAL                                         */}
      {/* ========================================================================= */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-aurora-teal" />
                  <span>Consultation Payment Options</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your preferred payment rail to confirm your appointment.
                </p>
              </div>
              <button
                onClick={() => setPaymentModal(prev => ({ ...prev, isOpen: false }))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Appointment Summary Box */}
            <div className="p-4 bg-slate-50 dark:bg-aurora-midnight/50 border-b border-slate-100 dark:border-slate-800 text-xs space-y-1">
              <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                <span>Practitioner:</span>
                <span>Dr. {paymentModal.doctor?.fullName || 'Specialist'}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Specialization & Clinic:</span>
                <span>{paymentModal.doctor?.specialization || 'Medicine'}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Schedule:</span>
                <span>
                  {paymentModal.appointment?.scheduledDate ? new Date(paymentModal.appointment.scheduledDate).toDateString() : ''} at {paymentModal.appointment?.timeSlot}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-aurora-teal pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Consultation Fee:</span>
                <span>₹{paymentModal.appointment?.paymentAmount || paymentModal.doctor?.consultationFee || 500}</span>
              </div>
            </div>

            {/* Dual-Rail Selector Tabs */}
            <div className="p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentModal(prev => ({ ...prev, method: 'RAZORPAY' }))}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentModal.method === 'RAZORPAY'
                      ? 'border-aurora-teal bg-teal-50/50 dark:bg-teal-950/30 ring-2 ring-aurora-teal/20'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <CreditCard className="w-4 h-4 text-aurora-teal" />
                    <Badge variant="teal" className="text-[9px]">Instant</Badge>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Razorpay Gateway</div>
                  <div className="text-[10px] text-slate-500">Cards, UPI, NetBanking, Wallets</div>
                </button>

                <button
                  type="button"
                  onClick={handleSelectManualUpi}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentModal.method === 'MANUAL_UPI'
                      ? 'border-aurora-teal bg-teal-50/50 dark:bg-teal-950/30 ring-2 ring-aurora-teal/20'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <QrCode className="w-4 h-4 text-aurora-blue" />
                    <Badge variant="blue" className="text-[9px]">Zero Fee</Badge>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Direct Manual UPI</div>
                  <div className="text-[10px] text-slate-500">GPay, PhonePe, Paytm QR</div>
                </button>
              </div>

              {/* Rail 1 Content: Razorpay Gateway */}
              {paymentModal.method === 'RAZORPAY' && (
                <div className="space-y-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-aurora-teal" />
                      <span>Razorpay Secure Checkout</span>
                    </p>
                    <p>
                      Supports all major Indian credit and debit cards, UPI QR/intent, NetBanking across 50+ banks, and digital wallets.
                    </p>
                    <p className="text-[10px] text-slate-400 pt-1">
                      Mode: Razorpay Test Mode (Simulated secure payment environment with HMAC-SHA256 signature verification).
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleRazorpayPay}
                    loading={paymentModal.loading}
                    className="w-full py-2.5 flex items-center justify-center gap-2"
                  >
                    <span>Pay ₹{paymentModal.appointment?.paymentAmount || paymentModal.doctor?.consultationFee || 500} via Razorpay</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Rail 2 Content: Direct Manual UPI */}
              {paymentModal.method === 'MANUAL_UPI' && (
                <form onSubmit={handleSubmitUpiUtr} className="space-y-3 pt-1">
                  {paymentModal.loading && !paymentModal.upiDetails ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-1 text-aurora-teal" />
                      Generating dynamic UPI payment QR...
                    </div>
                  ) : (
                    <>
                      {/* Dynamic QR Display */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-2">
                        {paymentModal.upiDetails?.qrPayload ? (
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(paymentModal.upiDetails.qrPayload)}`}
                            alt="Merchant UPI QR"
                            className="w-36 h-36 rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-2 shadow-xs"
                          />
                        ) : (
                          <div className="w-36 h-36 rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-2 flex items-center justify-center">
                            <QrCode className="w-16 h-16 text-slate-400" />
                          </div>
                        )}

                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {paymentModal.upiDetails?.merchantName || 'HealthMate Healthcare Network'}
                          </div>
                          <div className="text-[11px] font-mono text-aurora-teal">
                            UPI ID: {paymentModal.upiDetails?.merchantUpiId || 'healthmate@icici'}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Amount: ₹{paymentModal.upiDetails?.amount || 500} • Ref: {paymentModal.upiDetails?.paymentReference}
                          </div>
                        </div>

                        {paymentModal.upiDetails?.upiDeepLink && (
                          <a
                            href={paymentModal.upiDetails.upiDeepLink}
                            className="text-xs font-semibold text-aurora-teal hover:underline flex items-center gap-1"
                          >
                            <span>Open in Mobile UPI App</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* UTR Input Form */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Enter 12-Digit Bank UTR / Reference Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={paymentModal.utrNumber}
                          onChange={(e) => setPaymentModal(prev => ({ ...prev, utrNumber: e.target.value }))}
                          placeholder="e.g. 403819284719"
                          maxLength={22}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-aurora-navy text-xs font-mono text-slate-900 dark:text-white"
                        />
                        <p className="text-[10px] text-slate-500">
                          Found in your payment app receipt under 'UPI Transaction ID' or 'Bank Reference No'.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        loading={paymentModal.loading}
                        disabled={!paymentModal.utrNumber}
                        className="w-full py-2.5 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Submit UTR for Verification</span>
                      </Button>
                    </>
                  )}
                </form>
              )}

              {/* Close / Pay Later Option */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentModal(prev => ({ ...prev, isOpen: false }));
                    loadAppointments();
                    setTab('upcoming');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                >
                  Pay later from Upcoming Appointments tab
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
