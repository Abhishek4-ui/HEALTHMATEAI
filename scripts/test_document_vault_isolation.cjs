const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function runVaultIsolationAudit() {
  console.log('========================================================================');
  console.log('  HEALTHMATE AI — DOCUMENT VAULT PERSISTENCE & ISOLATION AUDIT');
  console.log('========================================================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthmate';
  await mongoose.connect(mongoUri);

  const { MedicalDocument } = require('../backend/src/models');
  const reportService = require('../backend/src/services/report.service');
  const patientService = require('../backend/src/services/patient.service');

  const testPatientId = '660000000000000000000001';
  const otherPatientId = '660000000000000000000002';
  const testFileName = 'patient_vault_test_record.pdf';
  const dummyBuffer = Buffer.from('%PDF-1.4 Clinical Diagnostic Blood Panel Report - Strictly Confidential');

  try {
    // 1. Authenticated Patient Vault Upload (Should be permanent: expiresAt: null)
    process.stdout.write('[*] Step 1: Uploading patient confidential document... ');
    const uploadRes = await reportService.processUpload({
      originalname: testFileName,
      mimetype: 'application/pdf',
      buffer: dummyBuffer,
      size: dummyBuffer.length,
    }, testPatientId);

    const docInDb = await MedicalDocument.findOne({ uploadToken: uploadRes.uploadToken });
    if (!docInDb) throw new Error('Document was not saved in MongoDB MedicalDocument vault!');
    if (docInDb.expiresAt !== null && docInDb.expiresAt !== undefined) {
      throw new Error(`Expected expiresAt: null for authenticated patient, but got ${docInDb.expiresAt}`);
    }
    console.log(`PASS [Storage: ${docInDb.storageType}, expiresAt: ${docInDb.expiresAt === null ? 'NULL (Permanent Vault)' : docInDb.expiresAt}]`);

    // 2. Unauthenticated Access Attempt (Should be rejected with 401/Unauthorized)
    process.stdout.write('[*] Step 2: Testing unauthenticated download attempt... ');
    let unauthBlocked = false;
    try {
      await reportService.getSecureSignedUrl(uploadRes.uploadToken, null);
    } catch (err) {
      if (err.message.includes('Unauthorized')) {
        unauthBlocked = true;
      } else {
        throw err;
      }
    }
    if (!unauthBlocked) throw new Error('Unauthenticated user was allowed to download confidential patient document!');
    console.log('PASS [Rejected as Unauthorized]');

    // 3. Cross-Patient Access Attempt (Wrong userId, should be rejected)
    process.stdout.write('[*] Step 3: Testing cross-patient unauthorized download attempt... ');
    let crossPatientBlocked = false;
    try {
      await reportService.getSecureSignedUrl(uploadRes.uploadToken, otherPatientId);
    } catch (err) {
      if (err.message.includes('Unauthorized')) {
        crossPatientBlocked = true;
      } else {
        throw err;
      }
    }
    if (!crossPatientBlocked) throw new Error('Patient 2 was allowed to download Patient 1 confidential document!');
    console.log('PASS [Strict Patient Isolation Enforced]');

    // 4. Authorized Download Attempt (Owner patient, should succeed)
    process.stdout.write('[*] Step 4: Testing authorized patient download... ');
    const authorizedRes = await reportService.getSecureSignedUrl(uploadRes.uploadToken, testPatientId);
    if (!authorizedRes || (!authorizedRes.signedUrl && !authorizedRes.localPath)) {
      throw new Error('Authorized patient failed to generate secure download access!');
    }
    console.log(`PASS [Secure access granted: ${authorizedRes.storageType}, URL: ${authorizedRes.signedUrl ? 'Presigned S3 (15m TTL)' : 'Local'}]`);

    // 5. Right to Erasure (Forget Me) Purge Test
    process.stdout.write('[*] Step 5: Testing Forget Me (Right to Erasure) document vault purge... ');
    await patientService.executeForgetMe(testPatientId, uploadRes.uploadToken);
    const docAfterForgetMe = await MedicalDocument.findOne({ uploadToken: uploadRes.uploadToken });
    if (docAfterForgetMe) {
      throw new Error('Document still exists in vault after executeForgetMe!');
    }
    console.log('PASS [Document completely erased from MongoDB MedicalDocument collection]');

    console.log('\n========================================================================');
    console.log('  DOCUMENT VAULT AUDIT RESULTS: ALL 5 CHECKS PASSED');
    console.log('========================================================================\n');
  } finally {
    await mongoose.disconnect();
  }
}

runVaultIsolationAudit().catch(err => {
  console.error('\nFAIL:', err.message);
  process.exit(1);
});
