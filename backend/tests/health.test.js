const http = require('http');
const app = require('../src/app');

describe('Backend Smoke Health Test', () => {
  it('should return 200 with healthy status and 3 roles', (done) => {
    const testPort = 5098;
    const server = app.listen(testPort, () => {
      const options = {
        hostname: '127.0.0.1',
        port: testPort,
        path: '/health',
        method: 'GET',
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          server.close(() => {
            expect(res.statusCode).toBe(200);
            const body = JSON.parse(data);
            expect(body.status).toBe('healthy');
            expect(body.infrastructure.allowedRoles).toEqual(['PATIENT', 'DOCTOR', 'ADMINISTRATION']);
            expect(body.infrastructure.ephemeralDefault).toBe(true);
            done();
          });
        });
      });

      req.on('error', (err) => {
        server.close(() => {
          done(err);
        });
      });

      req.end();
    });
  });
});
