const crypto = require('crypto');
const { Hospital, DoctorProfile, DoctorAvailability, DataSource, SyncLog, User } = require('../models');
const registryService = require('./registry.service');
const logger = require('../utils/logger');

// India Geographical Bounding Box Limits (Rough mainland coordinates)
const INDIA_BOUNDS = {
  minLat: 6.0,
  maxLat: 37.5,
  minLng: 68.0,
  maxLng: 98.0,
};

// Haversine distance in meters
function calculateHaversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Normalized Levenshtein distance for fuzzy string comparison (0.0 = completely different, 1.0 = identical)
function calculateStringSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  const longer = s1.length > s2.length ? s1.toLowerCase().trim() : s2.toLowerCase().trim();
  const shorter = s1.length > s2.length ? s2.toLowerCase().trim() : s1.toLowerCase().trim();
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;

  // Edit distance calculation
  const costs = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }

  return (longerLength - costs[shorter.length]) / parseFloat(longerLength);
}

class SynchronizationService {
  constructor() {
    this.isAutoSyncActive = true;
    this.syncIntervalHours = 24;
    this.timer = null;
    this.isSyncRunning = false;
  }

  /**
   * Start background scheduled sync worker
   */
  startScheduledWorker() {
    if (this.timer) clearInterval(this.timer);

    logger.info('[SyncService] Scheduled sync worker initialized.', {
      intervalHours: this.syncIntervalHours,
      autoSync: this.isAutoSyncActive,
    });

    // Run periodic sync
    this.timer = setInterval(async () => {
      if (this.isAutoSyncActive && !this.isSyncRunning) {
        logger.info('[SyncService] Triggering periodic scheduled synchronization...');
        try {
          await this.executeSyncJob('SCHEDULED_CRON');
        } catch (err) {
          logger.error('[SyncService] Scheduled sync cycle error:', { error: err.message });
        }
      }
    }, this.syncIntervalHours * 3600 * 1000);
  }

  stopScheduledWorker() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    logger.info('[SyncService] Scheduled sync worker stopped.');
  }

  setAutoSync(active) {
    this.isAutoSyncActive = Boolean(active);
    logger.info('[SyncService] AutoSync status updated.', { active: this.isAutoSyncActive });
    return { isAutoSyncActive: this.isAutoSyncActive };
  }

  /**
   * Execute an operation with exponential backoff retries
   */
  async executeWithRetry(operationFn, maxRetries = 3, initialDelayMs = 1000, backoffFactor = 2) {
    let attempt = 0;
    let delay = initialDelayMs;

    while (attempt < maxRetries) {
      try {
        return await operationFn(attempt);
      } catch (err) {
        attempt++;
        if (attempt >= maxRetries) {
          throw err;
        }
        logger.warn(`[SyncService] Retry attempt ${attempt}/${maxRetries} after error: ${err.message}. Waiting ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        delay *= backoffFactor;
      }
    }
  }

  /**
   * Validate a facility or doctor record against Indian healthcare data standards
   */
  validateRecord(entityType, record) {
    const errors = [];

    // 1. Name validation
    if (!record.name && !record.fullName) {
      errors.push('Entity name or full name is missing.');
    } else {
      const name = record.name || record.fullName;
      if (typeof name !== 'string' || name.trim().length < 3) {
        errors.push('Entity name must be at least 3 characters.');
      }
    }

    // 2. Geographic coordinates validation
    if (record.location && record.location.coordinates) {
      const [lng, lat] = record.location.coordinates;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        errors.push('Coordinates must be numeric.');
      } else if (lat < INDIA_BOUNDS.minLat || lat > INDIA_BOUNDS.maxLat || lng < INDIA_BOUNDS.minLng || lng > INDIA_BOUNDS.maxLng) {
        errors.push(`Coordinates (${lat}, ${lng}) fall outside legitimate Indian territory bounds.`);
      }
    } else {
      errors.push('Geographical coordinates are required for healthcare discovery.');
    }

    // 3. Entity-specific requirements
    if (entityType === 'DOCTOR') {
      if (!record.medicalRegistrationNumber || String(record.medicalRegistrationNumber).trim().length < 4) {
        errors.push('Valid Medical Registration Number from state or national council is required.');
      }
      if (!record.specialization || String(record.specialization).trim().length < 2) {
        errors.push('Medical specialization is required.');
      }
    } else if (entityType === 'HOSPITAL') {
      if (!record.address || !record.address.city) {
        errors.push('Hospital address city is required.');
      }
      if (record.address && record.address.pincode) {
        const pincodeStr = String(record.address.pincode).trim();
        if (!/^[1-9][0-9]{5}$/.test(pincodeStr)) {
          errors.push('PIN code must be a valid 6-digit Indian postal code.');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Run complete synchronization pipeline with duplicate matching and quarantine
   */
  async executeSyncJob(triggerType = 'ADMIN_MANUAL') {
    if (this.isSyncRunning) {
      throw new Error('A synchronization job is already running in background.');
    }

    this.isSyncRunning = true;
    const jobId = `sync_job_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const startTime = Date.now();

    const syncLog = await SyncLog.create({
      jobId,
      sourceName: 'National & State Healthcare Registries (MoHFW / OGD / NMC / Places)',
      triggerType,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
    });

    logger.info(`[SyncService] Starting sync job ${jobId} (trigger: ${triggerType})...`);

    let recordsProcessed = 0;
    let recordsInserted = 0;
    let recordsUpdated = 0;
    const duplicatesSummary = [];
    const quarantinedRecords = [];

    try {
      // 1. Fetch authorized hospital records with exponential backoff
      const rawHospitals = await this.executeWithRetry(async () => {
        return registryService.getOfficialHospitalsDataset();
      }, 3, 500, 2);

      // 2. Fetch existing database records to perform entity matching
      const existingHospitals = await Hospital.find({}).lean();

      // 3. Process hospital records through validation and deduplication
      for (const h of rawHospitals) {
        recordsProcessed++;

        // Quality & Boundary Validation
        const val = this.validateRecord('HOSPITAL', h);
        if (!val.isValid) {
          quarantinedRecords.push({
            entityType: 'HOSPITAL',
            sourceIdentifier: h.sourceIdentifier || 'UNKNOWN',
            reason: val.errors.join('; '),
            failedFields: val.errors,
            rawData: h,
            quarantinedAt: new Date(),
          });
          continue;
        }

        // Entity Matching & Duplicate Detection
        let duplicateMatch = null;

        // Exact match by sourceIdentifier
        if (h.sourceIdentifier) {
          duplicateMatch = existingHospitals.find(eh => eh.sourceIdentifier === h.sourceIdentifier);
        }

        // Fuzzy match: Name similarity > 0.85 within 200m or same city & PIN
        if (!duplicateMatch) {
          duplicateMatch = existingHospitals.find(eh => {
            const nameSim = calculateStringSimilarity(eh.name, h.name);
            const sameCity = eh.address?.city?.toLowerCase() === h.address?.city?.toLowerCase();
            const samePincode = eh.address?.pincode === h.address?.pincode;

            let distanceMeters = Infinity;
            if (eh.location?.coordinates && h.location?.coordinates) {
              distanceMeters = calculateHaversineMeters(
                eh.location.coordinates[1],
                eh.location.coordinates[0],
                h.location.coordinates[1],
                h.location.coordinates[0]
              );
            }

            return (nameSim >= 0.88 && sameCity) || (nameSim >= 0.80 && distanceMeters < 300) || (nameSim >= 0.90 && samePincode);
          });
        }

        if (duplicateMatch) {
          // Entity match found: Update existing record idempotently
          await Hospital.findByIdAndUpdate(duplicateMatch._id, {
            $set: {
              contact: h.contact || duplicateMatch.contact,
              departments: h.departments || duplicateMatch.departments,
              directionsUrl: h.directionsUrl || duplicateMatch.directionsUrl,
              lastSynchronizedAt: new Date(),
            },
          });
          recordsUpdated++;
          duplicatesSummary.push({
            entityType: 'HOSPITAL',
            identifier: h.sourceIdentifier || h.name,
            matchReason: `Matched existing facility '${duplicateMatch.name}' (ID: ${duplicateMatch._id})`,
            existingId: String(duplicateMatch._id),
          });
        } else {
          // New verified facility: Insert
          await Hospital.create({
            ...h,
            lastSynchronizedAt: new Date(),
          });
          recordsInserted++;
        }
      }

      // 4. Ingest and synchronize verified doctors
      const rawDoctors = await this.executeWithRetry(async () => {
        return registryService.getOfficialDoctorsDataset();
      }, 3, 500, 2);

      const existingDoctors = await DoctorProfile.find({}).lean();

      for (const d of rawDoctors) {
        recordsProcessed++;

        // Quality Validation
        const val = this.validateRecord('DOCTOR', d);
        if (!val.isValid) {
          quarantinedRecords.push({
            entityType: 'DOCTOR',
            sourceIdentifier: d.medicalRegistrationNumber || 'UNKNOWN',
            reason: val.errors.join('; '),
            failedFields: val.errors,
            rawData: d,
            quarantinedAt: new Date(),
          });
          continue;
        }

        // Doctor Deduplication: Exact match on Medical Registration Number
        const duplicateDoc = existingDoctors.find(
          ed => ed.medicalRegistrationNumber?.trim().toLowerCase() === d.medicalRegistrationNumber?.trim().toLowerCase()
        );

        if (duplicateDoc) {
          await DoctorProfile.findByIdAndUpdate(duplicateDoc._id, {
            $set: {
              specialization: d.specialization,
              consultationFee: d.consultationFee,
              experienceYears: d.experienceYears,
              updatedAt: new Date(),
            },
          });
          recordsUpdated++;
          duplicatesSummary.push({
            entityType: 'DOCTOR',
            identifier: d.medicalRegistrationNumber,
            matchReason: `Matched registration number with Dr. ${duplicateDoc.fullName}`,
            existingId: String(duplicateDoc._id),
          });
        } else {
          // Create new verified doctor profile with availability
          const { schedule, ...doctorFields } = d;
          const emailSlug = d.fullName.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.');
          const doctorEmail = `${emailSlug}@healthmate.ai`;

          let docUser = await User.findOne({ email: doctorEmail });
          if (!docUser) {
            const { hashPassword } = require('../security/argon2');
            const defaultHash = await hashPassword('DoctorAuth2026!');
            docUser = await User.create({
              email: doctorEmail,
              fullName: d.fullName,
              passwordHash: defaultHash,
              role: 'DOCTOR',
              status: 'ACTIVE',
              isEmailVerified: true,
              isPhoneVerified: true,
            });
          }

          const newDoc = await DoctorProfile.create({
            userId: docUser._id,
            ...doctorFields,
          });

          if (schedule && schedule.length > 0) {
            const availabilityRecords = schedule.map(s => ({
              doctorId: newDoc._id,
              ...s,
            }));
            await DoctorAvailability.insertMany(availabilityRecords);
          }

          recordsInserted++;
        }
      }

      // Update Data Source fresh status
      await DataSource.findOneAndUpdate(
        { sourceName: 'Open Government Data Platform India (data.gov.in) / MoHFW' },
        {
          sourceName: 'Open Government Data Platform India (data.gov.in) / MoHFW',
          sourceType: 'OPEN_DATASET',
          provider: 'Ministry of Health and Family Welfare, Government of India',
          status: 'HEALTHY',
          recordCount: recordsInserted + recordsUpdated,
          lastSyncTimestamp: new Date(),
          syncFrequency: 'DAILY',
        },
        { upsert: true }
      );

      // Finalize Sync Log
      const durationMs = Date.now() - startTime;
      syncLog.status = quarantinedRecords.length > 0 ? 'PARTIAL_SUCCESS' : 'SUCCESS';
      syncLog.completedAt = new Date();
      syncLog.durationMs = durationMs;
      syncLog.recordsProcessed = recordsProcessed;
      syncLog.recordsInserted = recordsInserted;
      syncLog.recordsUpdated = recordsUpdated;
      syncLog.duplicatesDetectedCount = duplicatesSummary.length;
      syncLog.duplicatesSummary = duplicatesSummary;
      syncLog.quarantinedCount = quarantinedRecords.length;
      syncLog.quarantinedRecords = quarantinedRecords;
      await syncLog.save();

      logger.info(`[SyncService] Sync job ${jobId} finished in ${durationMs}ms`, {
        status: syncLog.status,
        inserted: recordsInserted,
        updated: recordsUpdated,
        duplicates: duplicatesSummary.length,
        quarantined: quarantinedRecords.length,
      });

      return {
        jobId,
        status: syncLog.status,
        durationMs,
        recordsProcessed,
        recordsInserted,
        recordsUpdated,
        duplicatesDetected: duplicatesSummary.length,
        quarantinedCount: quarantinedRecords.length,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      syncLog.status = 'FAILED';
      syncLog.completedAt = new Date();
      syncLog.durationMs = durationMs;
      syncLog.errorDetails = err.message;
      await syncLog.save();

      logger.error(`[SyncService] Sync job ${jobId} failed: ${err.message}`);
      throw err;
    } finally {
      this.isSyncRunning = false;
    }
  }

  /**
   * Get sync status overview and telemetry for administration portal
   */
  async getSyncStatus() {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return {
        isAutoSyncActive: this.isAutoSyncActive,
        isSyncRunning: this.isSyncRunning,
        syncIntervalHours: this.syncIntervalHours,
        totalCatalogHospitals: 0,
        totalCatalogDoctors: 0,
        totalQuarantinedRecords: 0,
        dataSources: [],
        recentSyncRuns: [],
      };
    }

    const recentLogs = await SyncLog.find({}).sort({ startedAt: -1 }).limit(10).lean();
    const dataSources = await DataSource.find({}).lean();
    const totalHospitals = await Hospital.countDocuments({});
    const totalDoctors = await DoctorProfile.countDocuments({});
    const totalQuarantined = await SyncLog.aggregate([
      { $group: { _id: null, total: { $sum: '$quarantinedCount' } } },
    ]);

    return {
      isAutoSyncActive: this.isAutoSyncActive,
      isSyncRunning: this.isSyncRunning,
      syncIntervalHours: this.syncIntervalHours,
      totalCatalogHospitals: totalHospitals,
      totalCatalogDoctors: totalDoctors,
      totalQuarantinedRecords: totalQuarantined[0]?.total || 0,
      dataSources,
      recentSyncRuns: recentLogs,
    };
  }

  /**
   * List all quarantined invalid records across recent syncs
   */
  async getQuarantinedRecords(limit = 20) {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return [];
    }

    const logs = await SyncLog.find({ quarantinedCount: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const allQuarantined = [];
    for (const log of logs) {
      if (log.quarantinedRecords) {
        log.quarantinedRecords.forEach(qr => {
          allQuarantined.push({
            jobId: log.jobId,
            sourceName: log.sourceName,
            ...qr,
          });
        });
      }
    }

    return allQuarantined.slice(0, limit);
  }
}

module.exports = new SynchronizationService();
