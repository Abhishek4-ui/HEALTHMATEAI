const mongoose = require('mongoose');
const patientService = require('../../src/services/patient.service');
const { 
  MedicationSchedule, 
  PatientVital, 
  WellnessLog, 
  FamilyMember, 
  LabOrder 
} = require('../../src/models');

describe('Patient Clinical Data Persistence Unit Tests', () => {
  const mockPatientId = new mongoose.Types.ObjectId();

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('PAT-PERSIST-01: should add and retrieve persistent medication schedules with provenance', async () => {
    const mockMed = {
      _id: new mongoose.Types.ObjectId(),
      patientId: mockPatientId,
      medicineName: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      provenance: { source: 'Patient Entered', verified: false },
    };

    jest.spyOn(MedicationSchedule, 'create').mockResolvedValue(mockMed);
    jest.spyOn(MedicationSchedule, 'find').mockReturnValue({
      sort: jest.fn().mockResolvedValue([mockMed]),
    });

    const created = await patientService.addMedication(mockPatientId, {
      medicineName: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
    });

    expect(created.medicineName).toBe('Metformin');
    expect(created.provenance.source).toBe('Patient Entered');

    const list = await patientService.getMedications(mockPatientId);
    expect(list.length).toBe(1);
    expect(list[0].medicineName).toBe('Metformin');
  });

  test('PAT-PERSIST-02: should log and retrieve clinical patient vitals', async () => {
    const mockVital = {
      _id: new mongoose.Types.ObjectId(),
      patientId: mockPatientId,
      vitalType: 'BLOOD_PRESSURE',
      value: { systolic: 120, diastolic: 80 },
      unit: 'mmHg',
      status: 'NORMAL',
      source: 'Patient Entered',
      recordedAt: new Date(),
    };

    jest.spyOn(PatientVital, 'create').mockResolvedValue(mockVital);
    jest.spyOn(PatientVital, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([mockVital]),
      }),
    });

    const logged = await patientService.logVital(mockPatientId, {
      vitalType: 'BLOOD_PRESSURE',
      value: { systolic: 120, diastolic: 80 },
      unit: 'mmHg',
      status: 'NORMAL',
    });

    expect(logged.vitalType).toBe('BLOOD_PRESSURE');
    expect(logged.value.systolic).toBe(120);

    const vitals = await patientService.getVitals(mockPatientId, 'BLOOD_PRESSURE');
    expect(vitals.length).toBe(1);
  });

  test('PAT-PERSIST-03: should log and retrieve wellness sleep and mood metrics', async () => {
    const mockLog = {
      _id: new mongoose.Types.ObjectId(),
      patientId: mockPatientId,
      sleepHours: 7.5,
      sleepQuality: 'Deep & Restful',
      moodScore: 8,
      waterIntakeMl: 2500,
      logDate: new Date(),
    };

    jest.spyOn(WellnessLog, 'create').mockResolvedValue(mockLog);
    jest.spyOn(WellnessLog, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([mockLog]),
      }),
    });

    const saved = await patientService.logWellness(mockPatientId, {
      sleepHours: 7.5,
      sleepQuality: 'Deep & Restful',
      moodScore: 8,
      waterIntakeMl: 2500,
    });

    expect(saved.sleepHours).toBe(7.5);
    expect(saved.moodScore).toBe(8);

    const logs = await patientService.getWellnessLogs(mockPatientId);
    expect(logs.length).toBe(1);
  });

  test('PAT-PERSIST-04: should add and manage dependent family health profiles', async () => {
    const mockMember = {
      _id: new mongoose.Types.ObjectId(),
      patientId: mockPatientId,
      fullName: 'Aarav Sharma',
      relationship: 'Child',
      bloodGroup: 'B+',
    };

    jest.spyOn(FamilyMember, 'create').mockResolvedValue(mockMember);
    jest.spyOn(FamilyMember, 'find').mockReturnValue({
      sort: jest.fn().mockResolvedValue([mockMember]),
    });
    jest.spyOn(FamilyMember, 'findOneAndDelete').mockResolvedValue(mockMember);

    const member = await patientService.addFamilyMember(mockPatientId, {
      fullName: 'Aarav Sharma',
      relationship: 'Child',
      bloodGroup: 'B+',
    });

    expect(member.fullName).toBe('Aarav Sharma');
    expect(member.relationship).toBe('Child');

    const members = await patientService.getFamilyMembers(mockPatientId);
    expect(members.length).toBe(1);

    const deleted = await patientService.deleteFamilyMember(mockPatientId, member._id);
    expect(deleted._id).toBe(member._id);
  });

  test('PAT-PERSIST-05: should create persistent diagnostic laboratory booking orders', async () => {
    const mockOrder = {
      _id: new mongoose.Types.ObjectId(),
      patientId: mockPatientId,
      testName: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      diagnosticCenter: 'Dr. Lal PathLabs - Green Park',
      status: 'REQUESTED',
      fastingRequired: true,
      priceEstimate: 350,
    };

    jest.spyOn(LabOrder, 'create').mockResolvedValue(mockOrder);
    jest.spyOn(LabOrder, 'find').mockReturnValue({
      sort: jest.fn().mockResolvedValue([mockOrder]),
    });

    const order = await patientService.createLabOrder(mockPatientId, {
      testName: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      diagnosticCenter: 'Dr. Lal PathLabs - Green Park',
      fastingRequired: true,
      priceEstimate: 350,
    });

    expect(order.testName).toBe('Complete Blood Count (CBC)');
    expect(order.status).toBe('REQUESTED');

    const orders = await patientService.getLabOrders(mockPatientId);
    expect(orders.length).toBe(1);
  });

  test('PAT-PERSIST-06: should purge clinical records upon DPDP Forget Me request', async () => {
    jest.spyOn(MedicationSchedule, 'deleteMany').mockResolvedValue({ deletedCount: 2 });
    jest.spyOn(PatientVital, 'deleteMany').mockResolvedValue({ deletedCount: 5 });
    jest.spyOn(WellnessLog, 'deleteMany').mockResolvedValue({ deletedCount: 3 });
    jest.spyOn(FamilyMember, 'deleteMany').mockResolvedValue({ deletedCount: 1 });

    const result = await patientService.executeForgetMe(mockPatientId, 'sess_test_123');
    expect(result.success).toBe(true);
    expect(result.message).toContain('completely wiped');
  });
});
