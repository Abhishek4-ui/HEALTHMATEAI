const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const { initRedis } = require('../src/config/redis');
const registryService = require('../src/services/registry.service');

async function run() {
  console.log('\n===============================================================');
  console.log('🏛️  HEALTHMATE AI — AUTHORIZED HEALTHCARE REGISTRY SYNCHRONIZER');
  console.log('===============================================================');
  console.log(`Connecting to MongoDB...`);
  
  await connectDB();
  initRedis();

  console.log(`Synchronizing Open Government Data (OGD) & State Medical Council Records...`);
  const result = await registryService.syncAuthorizedData();

  console.log('\n✅ Synchronization Result:');
  console.log(`- New Hospitals Ingested: ${result.newHospitalsIngested}`);
  console.log(`- New Verified Doctors Ingested: ${result.newDoctorsIngested}`);
  console.log(`- Timestamp: ${result.timestamp}`);
  console.log('===============================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal synchronization error:', err);
  process.exit(1);
});
