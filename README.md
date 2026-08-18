# Adaptive AI Placement Interview Platform

This is a working MVP skeleton, not the full enterprise system described in
the master prompt. It implements the core loop end-to-end — auth, resume
upload/parsing, an adaptive interview (weak answers trigger a same-topic
follow-up, strong answers raise the difficulty and move on), and a report —
for two seeded companies (Amazon, TCS Digital).

The adaptive algorithm here was proven working in a live sandbox test before
this code was written: a weak answer correctly triggered a follow-up
question on the same topic, a strong answer correctly advanced difficulty
and moved to the next question, and the report correctly computed
readiness % and weak/strong topics. `AdaptiveInterviewEngine.java` is that
same logic, wired to real JPA entities and PostgreSQL instead of in-memory
maps.

**What's NOT in this MVP** (see the roadmap in-chat for suggested order to
add these): Faculty/Placement Cell/Admin dashboards, the coding-interview
editor, HR communication scoring, question-bank management UI, refresh
tokens, Docker deployment. The architecture (pluggable AIEvaluationService,
clean Controller→Service→Repository layering) is built so these slot in
without rewrites.

## Prerequisites

- Java 21 (JDK, not just JRE)
- Maven (or just use your IDE's built-in Maven support)
- Node.js 18+
- PostgreSQL running locally

## 1. Database setup

```bash
createdb interview_platform
# or, in psql:
# CREATE DATABASE interview_platform;
```

Default credentials expected (override via env vars — see `application.yml`):
- username: `postgres`
- password: `postgres`

## 2. Run the backend

```bash
cd backend
mvn spring-boot:run
```

On first run, `DataSeeder.java` automatically inserts the two companies and
their question banks — you don't need to do anything manually.

The API will be at `http://localhost:8080`. AI evaluation runs in **mock
mode by default** (a heuristic based on answer length/detail — same one
proven in the demo) so you can run everything with zero API keys.

To use a real LLM instead, set these environment variables before starting:
```bash
export AI_PROVIDER=openai
export OPENAI_API_KEY=sk-...
mvn spring-boot:run
```
(`OpenAIEvaluationService.java` is already wired up — this just activates it.)

## 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Register a student account, optionally upload
a resume PDF, pick a company, and start the interview.

## Project structure

```
backend/
  src/main/java/com/aiplacement/interview/
    entity/       JPA entities (User, Company, Question, InterviewSession, Response, Resume)
    repository/   Spring Data JPA repositories
    dto/          Request/response DTOs — controllers never expose entities directly
    security/     JwtUtil + JwtAuthFilter
    config/       SecurityConfig, DataSeeder
    ai/           AIEvaluationService interface + Mock/OpenAI implementations
    engine/       AdaptiveInterviewEngine — the core branching algorithm
    service/      AuthService, InterviewService, ResumeService — business logic lives here
    controller/   Thin REST controllers
    exception/    ApiException + GlobalExceptionHandler
frontend/
  src/
    api/axios.js        shared HTTP client, auto-attaches JWT
    pages/               Login, Register, Dashboard, Interview, Report
    components/          ProtectedRoute
```

## A note on how this was built

This sandbox can't reach Maven Central, so the backend couldn't be
compiled/run inside the chat — only carefully written against Spring Boot
3.3 APIs. **Before you dig into feature work, do a clean `mvn spring-boot:run`
locally first** and fix whatever small issues surface (there's a real chance
of a typo or minor API mismatch somewhere in 38 files written without a
compiler checking them). That first successful run is also a great forcing
function to make sure your local Postgres/Java/Maven setup is solid before
you start building on top of it.
