# Contributing to HealthMate AI

Thank you for your interest in contributing to **HealthMate AI**! We welcome contributions from software engineers, medical informatics specialists, UI/UX designers, and clinical researchers.

Because HealthMate AI is a healthcare platform handling clinical data, all contributions must uphold our core pillars of **patient privacy**, **algorithmic honesty**, and **code quality**.

---

## 1. Code of Conduct & Clinical Ethics

By contributing to HealthMate AI, you agree to:
1. **Never fabricate clinical data:** Do not commit synthetic fake patients, falsified test results, simulated medical diagnoses, or artificial validation metrics.
2. **Mandatory Non-Diagnostic Labeling:** Any contribution introducing or modifying machine learning, computer vision, or signal processing algorithms must explicitly label outputs as **non-diagnostic / experimental prototypes** without regulatory clearance.
3. **Respect Patient Privacy:** Adhere strictly to the Digital Personal Data Protection Act (DPDP Act 2023) and HIPAA security principles. Enforce tenant isolation on all database queries.

---

## 2. Development & Pull Request Workflow

1. **Fork the Repository:** Create a personal fork on GitHub.
2. **Create a Feature Branch:** Use descriptive branch naming conventions:
   - `feat/feature-name` (e.g. `feat/voice-hindi-support`)
   - `fix/bug-description` (e.g. `fix/camera-aspect-ratio`)
   - `docs/doc-update` (e.g. `docs/update-api-spec`)
3. **Set Up Local Environment:** Follow the setup instructions in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
4. **Write Clean, Documented Code:** Ensure code is well-commented, conforms to existing linting styles, and includes relevant unit tests.
5. **Run Pre-Commit Verification:** Before opening a pull request, run all test suites locally:
   ```bash
   # Backend Unit Tests
   npm run test:unit --prefix backend

   # AI Service Tests
   cd ai-service && ./venv/bin/pytest tests/ && cd ..

   # Frontend Build Check
   npm run build --prefix frontend
   ```
6. **Commit Message Conventions:** We follow Conventional Commits:
   - `feat(module): description`
   - `fix(module): description`
   - `docs(topic): description`
   - `test(scope): description`
   - `chore(repo): description`
7. **Submit Pull Request:** Provide a clear description of changes, motivation, test evidence, and any affected documentation.

---

## 3. Reporting Issues & Security Vulnerabilities

- **General Bugs & Feature Requests:** Open an issue on GitHub using our issue templates.
- **Security Vulnerabilities:** Do **NOT** open a public issue. Review our security reporting guidelines in [SECURITY.md](SECURITY.md) and report privately.

---

## 4. License

By submitting code to HealthMate AI, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
