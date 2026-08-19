# 🚀 Adaptive AI Interview Platform

An AI-powered placement interview platform that simulates real technical interviews with adaptive questioning, AI-based answer evaluation, resume analysis, and detailed performance reports.

The platform is designed to provide a realistic interview experience by dynamically adjusting question difficulty based on the candidate's performance, helping students prepare for company-specific placement interviews.

> **Project Status:** 🚧 Active Development

---

# ✨ Features

## 🎯 Adaptive AI Interview Engine

- Dynamic interview flow based on candidate performance
- Difficulty automatically increases after strong answers
- Weak answers trigger intelligent follow-up questions
- Company-specific interview question banks
- Topic-wise adaptive questioning

## 🤖 AI Evaluation

- Spring AI Integration
- Pluggable AI evaluation architecture
- Mock AI mode for development
- Ready for OpenAI integration
- Easily extendable to Gemini and other LLMs

## 👨‍🎓 Student Features

- Secure JWT Authentication
- Student Registration & Login
- Resume Upload
- Resume Parsing
- Company Selection
- Adaptive Technical Interview
- AI Generated Feedback
- Interview Report & Analytics

## 📊 Performance Analytics

- Readiness Score
- Topic-wise Performance
- Strong Topics
- Weak Topics
- AI Feedback
- Improvement Suggestions

---

# 🛠 Tech Stack

## Backend

- Java 21
- Spring Boot 3
- Spring Security
- Spring AI
- Spring Data JPA
- PostgreSQL
- JWT Authentication
- Maven

## Frontend

- React
- Vite
- Axios
- React Router

## Database

- PostgreSQL

---

# 📁 Project Structure

```
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
│   │   ├── components
│   │   ├── pages
│   │   └── assets
│
└── README.md
```

---

# 🧠 Adaptive Interview Flow

```
Student Login
      │
      ▼
Upload Resume
      │
      ▼
Choose Company
      │
      ▼
Interview Starts
      │
      ▼
Answer Submitted
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
Increase  Follow-up
Difficulty Question
 │          │
 └────┬─────┘
      ▼
 Next Question
      │
      ▼
 Final Report
```

---

# 🚀 Getting Started

## Prerequisites

- Java 21
- Maven
- Node.js 18+
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

Default credentials:

```
Username : postgres
Password : postgres
```

Update them in `backend/src/main/resources/application.yml` if required.

---

## Backend Setup

```bash
cd backend
mvn spring-boot:run
```

The backend will start at:

```
http://localhost:8080
```

On the first run, sample companies and interview questions are automatically seeded into the database.

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🤖 AI Configuration

The project currently supports two AI modes.

### Mock Mode (Default)

No API key required.

Useful for local development and testing.

### OpenAI Mode

Set the following environment variables before starting the backend:

```bash
export AI_PROVIDER=openai
export OPENAI_API_KEY=your_api_key
```

The architecture is built using Spring AI, making it easy to integrate additional providers like Gemini in the future.

---

# 📈 Current Features

- ✅ JWT Authentication
- ✅ Resume Upload
- ✅ Resume Parsing
- ✅ Company Selection
- ✅ Adaptive Interview Engine
- ✅ AI Evaluation Service
- ✅ Interview Reports
- ✅ Spring AI Integration
- ✅ PostgreSQL Persistence

---

# 🚧 Upcoming Features

- Faculty Dashboard
- Placement Cell Dashboard
- Admin Panel
- Coding Interview Module
- Live Code Editor
- HR Communication Evaluation
- Resume Scoring
- Question Bank Management
- Docker Deployment
- Refresh Tokens
- Email Notifications
- Multi-LLM Support (Gemini, Claude)

---

# 🤝 Contributing

Contributions, suggestions, and improvements are always welcome.

Feel free to fork the repository, create a feature branch, and submit a pull request.

---

# 📄 License

This project is developed for educational purposes and placement preparation.

---

## ⭐ If you like this project, consider giving it a Star!