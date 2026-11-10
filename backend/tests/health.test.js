const http = require('http');
const { app } = require('../src/server');

const testPort = 5099;

const runHealthTest = async () => {
  console.log('[Test] Starting backend health verification test...');

  const server = app.listen(testPort, () => {
    const options = {
      hostname: '127.0.0.1',
      port: testPort,
      path: '/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        server.close(() => {
          try {
            console.log(`[Test] HTTP Status: ${res.statusCode}`);
            if (res.statusCode !== 200) {
              console.error(`[Test Failed] Expected status 200, received ${res.statusCode}`);
              process.exit(1);
            }

            const body = JSON.parse(data);
            console.log(`[Test] Health Response Status: ${body.status}`);
            console.log(`[Test] Roles Configured: ${body.infrastructure.allowedRoles.join(', ')}`);
            console.log(`[Test] Ephemeral Default: ${body.infrastructure.ephemeralDefault}`);

            if (
              body.status === 'healthy' &&
              body.infrastructure.allowedRoles.includes('PATIENT') &&
              body.infrastructure.allowedRoles.includes('DOCTOR') &&
              body.infrastructure.allowedRoles.includes('ADMINISTRATION') &&
              body.infrastructure.allowedRoles.length === 3
            ) {
              console.log('✅ [Backend Health Smoke Test PASSED]');
              process.exit(0);
            } else {
              console.error('[Test Failed] Payload validation error:', body);
              process.exit(1);
            }
          } catch (err) {
            console.error('[Test Error] Failed parsing response:', err);
            process.exit(1);
          }
        });
      });
    });

    req.on('error', (err) => {
      server.close(() => {
        console.error('[Test Error] Request failed:', err.message);
        process.exit(1);
      });
    });

    req.end();
  });
};

runHealthTest();
