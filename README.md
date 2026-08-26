# Adaptive AI Interview Platform

An AI-powered placement interview platform that simulates realistic technical interviews using adaptive questioning, AI-driven answer evaluation, resume analysis, and comprehensive performance reports.

The platform dynamically adjusts interview difficulty based on candidate performance, providing a personalized interview experience that helps students prepare for company-specific technical interviews.

> **Project Status:** Active Development

---

## Overview

The Adaptive AI Interview Platform is designed to bridge the gap between traditional coding practice and real technical interviews. Instead of presenting a fixed sequence of questions, the platform continuously evaluates candidate responses and adapts the interview in real time.

The system analyzes resumes, generates company-focused interview sessions, evaluates answers using AI, and provides detailed insights into technical strengths, weaknesses, and overall interview readiness.

---

## Key Features

### Adaptive Interview Engine

- Dynamic interview flow based on candidate performance
- Automatic difficulty adjustment
- Intelligent follow-up questions for weak responses
- Company-specific interview question banks
- Topic-wise adaptive questioning

### AI-Powered Evaluation

- AI-based answer assessment
- Spring AI integration
- Pluggable AI provider architecture
- Mock AI mode for local development
- Ready for OpenAI integration
- Easily extendable to additional LLM providers such as Gemini and Claude

### Student Portal

- JWT-based authentication
- Student registration and login
- Resume upload
- Resume parsing
- Company selection
- Adaptive technical interviews
- AI-generated feedback
- Detailed interview reports

### Performance Analytics

- Overall readiness score
- Topic-wise performance analysis
- Strong and weak topic identification
- AI-generated feedback
- Personalized improvement suggestions

---

## Technology Stack

### Backend

- Java 21
- Spring Boot 3
- Spring Security
- Spring AI
- Spring Data JPA
- PostgreSQL
- JWT Authentication
- Maven

### Frontend

- React
- Vite
- Axios
- React Router

### Database

- PostgreSQL

---

## Project Structure

```text
adaptive-ai-interview-platform
│
├── backend
│   ├── src/main/java/com/aiplacement/interview
│   │   ├── ai
│   │   ├── config
│   │   ├── controller
│   │   ├── dto
│   │   ├── engine
│   │   ├── entity
│   │   ├── exception
│   │   ├── repository
│   │   ├── security
│   │   └── service
│   │
│   └── src/main/resources
│
├── frontend
│   ├── src
│   │   ├── api
│   │   ├── assets
│   │   ├── components
│   │   └── pages
│
└── README.md
```

---

## Adaptive Interview Workflow

```text
Student Login
      │
      ▼
Upload Resume
      │
      ▼
Resume Parsing
      │
      ▼
Select Company
      │
      ▼
Interview Begins
      │
      ▼
Answer Submission
      │
      ▼
AI Evaluation
      │
 ┌────┴────┐
 │         │
 ▼         ▼
Strong    Weak
Answer    Answer
 │          │
 ▼          ▼
Increase  Generate
Difficulty Follow-up
 │          │
 └────┬─────┘
      ▼
Next Question
      │
      ▼
Performance Report
```

---

## Getting Started

### Prerequisites

Ensure the following software is installed:

- Java 21
- Maven
- Node.js 18 or later
- PostgreSQL

---

## Clone the Repository

```bash
git clone git@github.com:MNIAJ/adaptive-ai-interview-platform.git

cd adaptive-ai-interview-platform
```

---

## Database Setup

Create a PostgreSQL database.

```sql
CREATE DATABASE interview_platform;
```

Default database credentials:

```text
Username: postgres
Password: postgres
```

Update the configuration in:

```text
backend/src/main/resources/application.yml
```

if your credentials are different.

---

## Backend Setup

```bash
cd backend

mvn spring-boot:run
```

The backend server will start on:

```text
http://localhost:8080
```

During the initial startup, sample companies and interview questions are automatically seeded into the database.

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

---

## AI Configuration

The platform currently supports two AI execution modes.

### Mock Mode (Default)

- No API key required
- Ideal for local development and testing

### OpenAI Mode

Set the following environment variables before starting the backend.

```bash
export AI_PROVIDER=openai
export OPENAI_API_KEY=your_api_key
```

The project is built using Spring AI, allowing additional providers such as Gemini and Claude to be integrated with minimal changes.

---

## Current Features

- JWT Authentication
- Resume Upload
- Resume Parsing
- Company Selection
- Adaptive Interview Engine
- AI Answer Evaluation
- Interview Reports
- Spring AI Integration
- PostgreSQL Persistence

---

## Planned Features

- Faculty Dashboard
- Placement Cell Dashboard
- Admin Panel
- Coding Interview Module
- Integrated Code Editor
- HR Communication Assessment
- Resume Scoring
- Interview Question Management
- Docker Support
- Refresh Token Authentication
- Email Notifications
- Multi-LLM Support (Gemini, Claude, and others)

---

## Future Scope

The platform is designed with extensibility in mind. Planned enhancements include:

- Voice-based interviews
- Real-time coding assessments
- Behavioral interview simulation
- Company-specific interview preparation
- Advanced analytics dashboard
- Multi-language interview support
- AI-powered resume optimization
- Interview recording and playback
