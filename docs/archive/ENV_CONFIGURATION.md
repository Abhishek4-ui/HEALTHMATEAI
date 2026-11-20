# HEALTHMATE AI — ENVIRONMENT CONFIGURATION MASTER GUIDE

**Project Name:** HEALTHMATE AI  
**Academic Degree:** B.Tech Computer Science & Engineering (AI/ML)  
**Document Code:** ENG-DOC-15  
**Security Policy:** Strict Zero-Secret Disclosure (Public vs. Private Classification)  

---

## 1. CONFIGURATION MASTER MATRIX

| Variable Name | Service | Classification | Required / Optional | Purpose & Usage | Where to Obtain |
|---|---|---|---|---|---|
| `PORT` | Backend / AI | Public | Required | Port on which the HTTP/ASGI server listens | Host assigned |
| `NODE_ENV` | Backend | Public | Required | Set to `production` or `development` | Host assigned |
| `FRONTEND_URL` | Backend | Public | Required | Permitted CORS origin for browser API calls | Vercel Deployment URL |
| `MONGODB_URI` | Backend | **Private / Secret** | **Critical** | Connection string for MongoDB Atlas database | MongoDB Atlas Dashboard |
| `REDIS_URL` | Backend | **Private / Secret** | **Critical** | TLS connection string for Upstash Redis | Upstash Console |
| `JWT_SECRET` | Backend | **Private / Secret** | **Critical** | 64-byte cryptographic secret for JWT signing | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET`| Backend | **Private / Secret** | **Critical** | 64-byte cryptographic secret for refresh tokens| `openssl rand -hex 32` |
| `AI_SERVICE_URL` | Backend | Public | Required | URL of the deployed Python FastAPI microservice | Render Web Service URL |
| `EMAIL_SERVICE` | Backend | Public | Required | Email dispatch protocol (`gmail`) | System setting |
| `EMAIL_USER` | Backend | Public | Required | Outbound clinic email address for OTP delivery | Google Account |
| `EMAIL_PASS` | Backend | **Private / Secret** | **Critical** | 16-character Google App Password | Google Account > Security |
| `RESEND_API_KEY` | Backend | **Private / Secret** | Recommended | High-availability fallback email API token | Resend Dashboard |
| `FAST2SMS_API_KEY` | Backend | **Private / Secret** | Optional | Indian SMS gateway authentication key | Fast2SMS Portal |
| `FAST2SMS_DLT_TEMPLATE_ID` | Backend | Public | Required for SMS | TRAI-mandated DLT content template ID | Telecom DLT Portal |
| `RAZORPAY_KEY_ID` | Backend / Front | Public | Required for Card | Razorpay public key ID (`rzp_test_...`) | Razorpay Dashboard |
| `RAZORPAY_KEY_SECRET` | Backend | **Private / Secret** | **Critical** | Razorpay private HMAC SHA-256 secret key | Razorpay Dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | Backend | **Private / Secret** | **Critical** | Razorpay webhook cryptographic validation key | Razorpay Dashboard |
| `MERCHANT_UPI_ID` | Backend / Front | Public | Required for UPI | Payee Virtual Payment Address (e.g. `healthmate@okhdfcbank`) | Indian Bank / UPI App |
| `MERCHANT_NAME` | Backend / Front | Public | Required for UPI | Payee trade display name for QR codes | Clinic Trade Name |
| `AWS_ACCESS_KEY_ID` | Backend | **Private / Secret** | Required for Files | AWS IAM user access key for medical S3 storage | AWS IAM Console |
| `AWS_SECRET_ACCESS_KEY` | Backend | **Private / Secret** | **Critical** | AWS IAM user secret key for presigned URLs | AWS IAM Console |
| `AWS_REGION` | Backend | Public | Required for Files | AWS region hosting S3 bucket (`ap-south-1`) | AWS S3 Console |
| `AWS_S3_BUCKET` | Backend | Public | Required for Files | S3 bucket name for encrypted medical scans | AWS S3 Console |
| `TURN_SERVER_URL` | Backend | Public | Optional | TURN relay URL for symmetric cellular NAT | Coturn / Twilio Traversal |
| `TURN_USERNAME` | Backend | Public | Optional | Username for TURN server authentication | Coturn / Twilio Traversal |
| `TURN_CREDENTIAL` | Backend | **Private / Secret** | Optional | Password / token for TURN relay traversal | Coturn / Twilio Traversal |
| `GEMINI_API_KEY` | AI Service | **Private / Secret** | Recommended | Google AI Studio key for clinical LLM copilot | Google AI Studio |
| `OPENROUTER_API_KEY`| AI Service | **Private / Secret** | Optional | Multi-LLM fallback API key | OpenRouter Portal |
| `VITE_API_BASE_URL` | Frontend | Public | **Critical** | Backend API base path (`/api/v1`) | Vercel Environment |
| `VITE_AI_SERVICE_URL`| Frontend | Public | **Critical** | AI microservice direct base URL | Vercel Environment |

---

## 2. SECURITY VERIFICATION CONFIRMATION

- No secrets are stored in Git repositories.
- All client-facing variables prefixed with `VITE_` contain strictly non-sensitive configuration parameters.
- Private backend secrets are injected exclusively via encrypted cloud environment dashboards (Render / AWS Parameter Store).
