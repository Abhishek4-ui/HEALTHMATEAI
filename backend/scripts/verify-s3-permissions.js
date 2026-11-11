const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');
const {
  S3Client,
  HeadBucketCommand,
  GetBucketLocationCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CreateMultipartUploadCommand,
  AbortMultipartUploadCommand,
} = require('@aws-sdk/client-s3');

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

async function verifyS3Integration() {
  const region = process.env.AWS_REGION || 'ap-southeast-2';
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  console.log('\n===============================================================');
  console.log('🔒 AWS S3 INTEGRATION & IAM PERMISSIONS VERIFICATION SUITE');
  console.log('===============================================================');
  console.log(`Target Bucket: ${bucket}`);
  console.log(`Configured Region: ${region}`);
  console.log('Note: Zero credentials or raw secrets are displayed.\n');

  const results = {
    authentication: { status: 'PENDING' },
    bucketAccess: { status: 'PENDING' },
    getBucketLocation: { status: 'PENDING' },
    uploadTestFile: { status: 'PENDING' },
    downloadTestFile: { status: 'PENDING' },
    deleteTestFile: { status: 'PENDING' },
    verifyDeletion: { status: 'PENDING' },
    multipartUpload: { status: 'PENDING' },
  };

  if (!accessKeyId || !secretAccessKey || !bucket) {
    console.error('❌ Missing AWS credentials or bucket name in environment.');
    return { success: false, reason: 'Credentials not configured' };
  }

  const credentials = { accessKeyId, secretAccessKey };

  // 1. AWS Authentication
  console.log('1. Testing AWS Authentication (STS GetCallerIdentity)...');
  try {
    const sts = new STSClient({ region, credentials });
    const identity = await sts.send(new GetCallerIdentityCommand({}));
    results.authentication = {
      status: 'PASSED',
      arn: identity.Arn,
      userId: identity.UserId,
      account: identity.Account,
    };
    console.log(`   ✅ Authenticated successfully as IAM Identity: ${identity.Arn}\n`);
  } catch (err) {
    results.authentication = {
      status: 'FAILED',
      error: err.name,
      message: err.message,
    };
    console.log(`   ❌ Authentication failed: ${err.message}\n`);
    return { success: false, results };
  }

  const s3 = new S3Client({ region, credentials });

  // 2. Bucket Access
  console.log('2. Testing Bucket Access (HeadBucket)...');
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    results.bucketAccess = { status: 'PASSED', details: 'Bucket exists and accessible' };
    console.log(`   ✅ Bucket exists and IAM user has permission to access it.\n`);
  } catch (err) {
    results.bucketAccess = {
      status: 'FAILED',
      error: err.name,
      message: err.message,
      missingPermission: 's3:ListBucket or s3:HeadBucket',
    };
    console.log(`   ❌ HeadBucket failed: ${err.name} - ${err.message}\n`);
  }

  // 3. GetBucketLocation
  console.log('3. Testing GetBucketLocation...');
  try {
    const locRes = await s3.send(new GetBucketLocationCommand({ Bucket: bucket }));
    const detectedLocation = locRes.LocationConstraint || 'us-east-1';
    results.getBucketLocation = {
      status: 'PASSED',
      locationConstraint: detectedLocation,
    };
    console.log(`   ✅ Location retrieved: ${detectedLocation}\n`);
  } catch (err) {
    results.getBucketLocation = {
      status: 'FAILED',
      error: err.name,
      message: err.message,
      missingPermission: 's3:GetBucketLocation',
    };
    console.log(`   ❌ GetBucketLocation failed: ${err.name} - ${err.message}\n`);
  }

  // 4. Upload Temporary Test File
  const testKey = `healthmate-test-audit/probe-${Date.now()}.txt`;
  const testPayload = `HealthMate AI Test Verification Probe - Generated at ${new Date().toISOString()}`;

  console.log(`4. Testing Upload (PutObject: ${testKey})...`);
  try {
    const putRes = await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: testKey,
        Body: testPayload,
        ContentType: 'text/plain',
        Metadata: { purpose: 'integration-test' },
      })
    );
    results.uploadTestFile = {
      status: 'PASSED',
      key: testKey,
      etag: putRes.ETag,
    };
    console.log(`   ✅ Upload successful. ETag: ${putRes.ETag}\n`);
  } catch (err) {
    results.uploadTestFile = {
      status: 'FAILED',
      error: err.name,
      message: err.message,
      missingPermission: 's3:PutObject on arn:aws:s3:::' + bucket + '/*',
    };
    console.log(`   ❌ PutObject failed: ${err.name} - ${err.message}\n`);
  }

  // 5. Download Same File
  if (results.uploadTestFile.status === 'PASSED') {
    console.log(`5. Testing Download (GetObject: ${testKey})...`);
    try {
      const getRes = await s3.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: testKey,
        })
      );
      const downloadedContent = await streamToString(getRes.Body);
      const isContentMatch = downloadedContent === testPayload;

      results.downloadTestFile = {
        status: isContentMatch ? 'PASSED' : 'CORRUPTED',
        contentType: getRes.ContentType,
        contentLength: getRes.ContentLength,
        integrityVerified: isContentMatch,
      };

      if (isContentMatch) {
        console.log(`   ✅ Download successful and payload integrity verified.\n`);
      } else {
        console.log(`   ⚠️ Content mismatch during download test.\n`);
      }
    } catch (err) {
      results.downloadTestFile = {
        status: 'FAILED',
        error: err.name,
        message: err.message,
        missingPermission: 's3:GetObject on arn:aws:s3:::' + bucket + '/*',
      };
      console.log(`   ❌ GetObject failed: ${err.name} - ${err.message}\n`);
    }

    // 6. Delete Test File
    console.log(`6. Testing Delete (DeleteObject: ${testKey})...`);
    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: testKey,
        })
      );
      results.deleteTestFile = { status: 'PASSED', key: testKey };
      console.log(`   ✅ DeleteObject command executed successfully.\n`);
    } catch (err) {
      results.deleteTestFile = {
        status: 'FAILED',
        error: err.name,
        message: err.message,
        missingPermission: 's3:DeleteObject on arn:aws:s3:::' + bucket + '/*',
      };
      console.log(`   ❌ DeleteObject failed: ${err.name} - ${err.message}\n`);
    }

    // 7. Verify Deletion
    console.log('7. Verifying Deletion (HeadObject expecting 404/NotFound)...');
    try {
      await s3.send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: testKey,
        })
      );
      results.verifyDeletion = {
        status: 'FAILED',
        message: 'Object still exists after delete command',
      };
      console.log('   ❌ File still found after deletion.\n');
    } catch (err) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        results.verifyDeletion = {
          status: 'PASSED',
          details: 'Confirmed file no longer exists (HTTP 404 NotFound)',
        };
        console.log('   ✅ Deletion verified: Target file no longer exists in bucket.\n');
      } else {
        results.verifyDeletion = {
          status: 'UNVERIFIED',
          error: err.name,
          message: err.message,
        };
        console.log(`   ⚠️ Verify deletion check returned: ${err.name} - ${err.message}\n`);
      }
    }
  } else {
    console.log('Skipping Download & Delete tests due to Upload failure.\n');
  }

  // 8. Check Multipart Upload Permissions
  console.log('8. Testing Multipart Upload Permissions (CreateMultipartUpload & Abort)...');
  const mpKey = `healthmate-test-audit/multipart-probe-${Date.now()}.bin`;
  try {
    const mpCreate = await s3.send(
      new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: mpKey,
        ContentType: 'application/octet-stream',
      })
    );
    const uploadId = mpCreate.UploadId;

    await s3.send(
      new AbortMultipartUploadCommand({
        Bucket: bucket,
        Key: mpKey,
        UploadId: uploadId,
      })
    );

    results.multipartUpload = {
      status: 'PASSED',
      uploadIdCreated: Boolean(uploadId),
      abortedSuccessfully: true,
    };
    console.log('   ✅ Multipart upload initialization and abort verified.\n');
  } catch (err) {
    results.multipartUpload = {
      status: 'FAILED',
      error: err.name,
      message: err.message,
      missingPermission: 's3:PutObject or s3:AbortMultipartUpload',
    };
    console.log(`   ❌ Multipart upload check failed: ${err.name} - ${err.message}\n`);
  }

  console.log('===============================================================');
  console.log('TEST SUMMARY MATRIX:');
  console.log('===============================================================');
  console.table(
    Object.keys(results).map((step) => ({
      Test: step,
      Status: results[step].status,
      Details: results[step].details || results[step].arn || results[step].locationConstraint || results[step].missingPermission || 'OK',
    }))
  );
  console.log('===============================================================\n');

  const allPassed = Object.values(results).every((r) => r.status === 'PASSED');
  return { success: allPassed, results };
}

verifyS3Integration()
  .then((res) => {
    if (!res.success) {
      process.exit(1);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
