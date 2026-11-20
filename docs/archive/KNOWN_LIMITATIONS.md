# HEALTHMATE AI — KNOWN LIMITATIONS & DISCLOSURE RECORD

**Project Name:** HEALTHMATE AI  
**Academic Degree:** B.Tech Computer Science & Engineering (AI/ML)  
**Document Code:** ENG-DOC-17  
**Policy:** Uncompromised Academic Integrity & Honest Engineering Disclosures  

---

## 1. TECHNICAL & INFRASTRUCTURE LIMITATIONS

1. **WebRTC Video Traversal on Mobile Cellular Networks (Symmetric NAT):**
   - HealthMate AI's video teleconsultation module relies on Google's public STUN server (`stun:stun.l.google.com:19302`).
   - While STUN successfully negotiates peer-to-peer UDP media connections over home/office Wi-Fi networks and full-cone NATs, it cannot traverse **Symmetric Carrier-Grade NAT (CGNAT)** commonly enforced by mobile operators (e.g. Jio and Airtel 4G/5G).
   - In production cellular environments, deploying a dedicated TURN (Traversal Using Relays around NAT) relay server (e.g. Coturn or Twilio Network Traversal) is technically necessary to prevent dropped video connections.
2. **Indian SMS OTP Delivery via Fast2SMS (TRAI DLT Regulation):**
   - Programmatic SMS dispatch via Fast2SMS is currently blocked at the operator firewall due to the Telecom Regulatory Authority of India (TRAI) TCCCPR-2018 regulations requiring Principal Entity (PE) registration, 14-character Header approval, and approved Content Template IDs.
   - The platform transparently reports `delivered: false` without fabricating SMS delivery, and routes verification codes through **Email OTP** via Gmail SMTP with Resend API fallback.
3. **Payment Collection Mode (Razorpay Test Mode):**
   - Razorpay integration operates strictly in **Test Mode** (`rzp_test_...`). Real INR debits from patient credit/debit cards cannot be processed until business legal entity KYC is approved by Razorpay.
   - The zero-fee Manual UPI QR Rail with UTR bank reconciliation serves as an active, zero-commission payment alternative.

---

## 2. CLINICAL & REGULATORY LIMITATIONS

1. **Clinical Decision Support System (CDSS) Non-Diagnostic Stance:**
   - The AI symptom analysis, cardiovascular risk scoring, and medical imaging anomaly detectors function strictly as **clinical screening aids** and **educational decision-support tools**.
   - They do not possess formal Central Drugs Standard Control Organisation (CDSCO) Software as a Medical Device (SaMD) Class B/C clearance and must not be interpreted as definitive medical diagnoses or unsupervised clinical prescriptions.
2. **Top-1 Categorical Disease Accuracy (47.50%):**
   - On the held-out 40-vignette clinical cohort, the triage model achieved 100.00% sensitivity on acute emergencies, but a top-1 categorical accuracy of 47.50% across 8 nuanced differential classes.
   - This reflects genuine clinical symptom overlap and underscores the necessity of physician-in-the-loop oversight.
3. **Lack of Live ABDM Sandbox API Token:**
   - HealthMate AI implements format-compliant 14-digit ABHA validation, but cannot generate official Ayushman Bharat Health Cards via real Aadhaar OTP without signing formal developer agreements with the National Health Authority (NHA).

---

## 3. AUDIT CONCLUSION

These documented limitations represent regulatory gates and specialized network relay infrastructure rather than unhandled software defects. Acknowledging them openly preserves complete academic integrity.
