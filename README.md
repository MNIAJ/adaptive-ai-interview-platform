# AI Campus Placement Interview Simulator — MVP

Reconstructed from the supplied Spring Boot and React source archives. Six hiring profiles; 123 seeded questions including original follow-ups. Public reports are anecdotal and NOT verified records from your college. Question wording, stage assignments and difficulty ratings are editorial practice adaptations, not official company rubrics. The simulator approximates interview segments, not aptitude/online tests or actual hiring outcomes. TCS panels can include a managerial segment; other profiles use technical and HR segments. No live coding execution or resume personalization is implemented.

## Run on Windows (recommended first)
Use a new PostgreSQL database or back up the existing one. Old sessions cannot be resumed; old questions without stage metadata are not selected. No destructive schema changes are intended. Rotate the old database password and JWT secret, especially if committed to GitHub.

Prerequisites: JDK 21, Maven 3.9+, Node 22, PostgreSQL, Ollama. Create database `interview_platform` in pgAdmin. In PowerShell:

```powershell
ollama pull llama3.2
# In a separate terminal if Ollama is not already running: ollama serve
cd backend
$env:DB_PASSWORD = 'YOUR_NEW_POSTGRES_PASSWORD'
$env:DB_USER = 'postgres'
$env:DB_URL = 'jdbc:postgresql://localhost:5432/interview_platform'
$env:JWT_SECRET = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
$env:AI_PROVIDER = 'springai'
mvn clean spring-boot:run
```

In a second PowerShell terminal at project root:

```powershell
npm install
npm run dev
```
Open http://localhost:5173, register, select a profile and Campus simulation. Keep both terminals running. Preserve your generated JWT secret between restarts if you wish to keep logged-in sessions valid.

For infrastructure smoke testing ONLY, set `$env:AI_PROVIDER='mock'` before launching backend. This uses answer length, not correctness. Do not present mock scores as AI results. Real scoring requires a working Ollama endpoint; the backend returns a retryable error if evaluation fails. OpenAI provider is not supported by this MVP's report configuration.

## Deployment plan
Fastest path: Linux VM with Docker, persistent PostgreSQL and reachable Ollama inference. Frontend may be hosted independently (Vercel static Vite build). Backend Dockerfile and Compose provided. Copy `.env.example` to `.env`, set a unique password and random JWT secret. Ensure Ollama is accessible from backend container; for local Ollama on Linux, a protected host endpoint or internal Docker network is needed. Do not expose unauthenticated Ollama to the public internet. Use HTTPS reverse proxy in front of backend; restrict exposed ports with firewall. `docker compose up --build -d` starts database and backend, but does not install Ollama or configure TLS. On frontend host set `VITE_API_URL=https://YOUR-BACKEND-HOST/api`, build command `npm run build`, output `dist`. Set backend `FRONTEND_URL` to exact frontend HTTPS origin. Alternatively run both on laptop for local demo while provisioning the public deployment. Never commit `.env`.

## Dataset
`backend/src/main/resources/seed-data/campus_questions.psv` is the import source. Columns: company, stage, topic, difficulty (1–5), question, origin, source_url, follow_up. No candidate names or private data. To add a company, append rows with all stages and add its dashboard card. Avoid pipe characters inside fields (the MVP importer uses delimiter splitting). Rows are upserted by company and question text. If you rename or remove questions in an existing DB, manually retire old rows; importer does not delete. For a clean demo use a fresh DB. `python validate_dataset.py` validates the supplied 123 records. Extend the expected count when adding data.

## Acceptance checks (must run locally before presentation)
1. `mvn clean test` and `npm run build` complete.
2. Backend starts and seeds all six profiles; register and login.
3. Start seven-question simulation for each profile. Observe introduction → project → technical → (where supported, managerial) → HR. Short sessions omit optional segments. Weak technical answer can branch to same-company same-topic follow-up; total answer limit includes follow-ups.
4. Submit a different question ID or duplicate previous answer; expect 409. Cross-account session access returns 403. Stop Ollama and submit; expect 503 without advancing. Restart Ollama and retry.
5. Finish interview and check stage scores, practice score, recommendations and history. Check public source links. Repeat in deployed HTTPS environment.

## Validation status
Dataset validation passed in the authoring environment. Source modifications were inspected statically. Maven is unavailable here and npm dependencies are not cached, so Java compile, frontend build, database integration and live deployment have not been verified. This is a candidate MVP, not a certified working deployment.
