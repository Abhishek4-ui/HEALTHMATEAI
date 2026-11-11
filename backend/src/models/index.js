const User = require('./User');
const PatientProfile = require('./PatientProfile');
const DoctorProfile = require('./DoctorProfile');
const Hospital = require('./Hospital');
const DoctorVerification = require('./DoctorVerification');
const Appointment = require('./Appointment');
const Consultation = require('./Consultation');
const Prescription = require('./Prescription');
const Notification = require('./Notification');
const Consent = require('./Consent');
const PaymentTransaction = require('./PaymentTransaction');
const AuditLog = require('./AuditLog');
const DataSource = require('./DataSource');
const AIModelMetadata = require('./AIModelMetadata');
const DatasetMetadata = require('./DatasetMetadata');
const IntegrationStatus = require('./IntegrationStatus');
const UserSession = require('./UserSession');
const RefreshToken = require('./RefreshToken');
const EmergencyContact = require('./EmergencyContact');
const DoctorAvailability = require('./DoctorAvailability');
const SyncLog = require('./SyncLog');
const MLOpsTelemetry = require('./MLOpsTelemetry');

// Idempotent controlled index initialization without modifying data
const initIndexes = async () => {
  try {
    const models = [
      User, PatientProfile, DoctorProfile, Hospital, DoctorVerification,
      Appointment, Consultation, Prescription, Notification, Consent,
      PaymentTransaction, AuditLog, DataSource, AIModelMetadata,
      DatasetMetadata, IntegrationStatus, UserSession, RefreshToken,
      EmergencyContact, DoctorAvailability, SyncLog, MLOpsTelemetry
    ];

    for (const model of models) {
      if (model.init) {
        await model.init();
      }
    }
    console.log('[Database] All 20 Mongoose collection indexes verified and initialized.');
  } catch (error) {
    console.warn(`[Database] Index initialization notice: ${error.message}`);
  }
};

module.exports = {
  User,
  PatientProfile,
  DoctorProfile,
  Hospital,
  DoctorVerification,
  Appointment,
  Consultation,
  Prescription,
  Notification,
  Consent,
  PaymentTransaction,
  AuditLog,
  DataSource,
  AIModelMetadata,
  DatasetMetadata,
  IntegrationStatus,
  UserSession,
  RefreshToken,
  EmergencyContact,
  DoctorAvailability,
  SyncLog,
  MLOpsTelemetry,
  initIndexes,
};
