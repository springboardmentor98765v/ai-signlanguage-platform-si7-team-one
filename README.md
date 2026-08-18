# AI-Powered Sign Language Learning & Assessment Platform

An AI-powered web platform for learning, practicing, assessing, and improving sign-language skills through structured lessons, webcam-based practice, AI sign prediction, assessments, feedback, analytics, gamification, certifications, and role-based dashboards.

The project is organized as a multi-service application and is containerized with Docker Compose.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Services](#services)
- [Database](#database)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Run the Application](#run-the-application)
- [Service Ports](#service-ports)
- [Health Checks](#health-checks)
- [Database Setup and Validation](#database-setup-and-validation)
- [Testing](#testing)
- [AI Service](#ai-service)
- [Business Logic Service](#business-logic-service)
- [Backend API](#backend-api)
- [Frontend](#frontend)
- [Production Configuration](#production-configuration)
- [Security Notes](#security-notes)
- [Git Workflow](#git-workflow)
- [Milestone Progress](#milestone-progress)
- [Team Structure](#team-structure)
- [Important Notes](#important-notes)

---

# Project Overview

The **AI-Powered Sign Language Learning & Assessment Platform** provides an interactive environment where learners can study sign-language lessons and practice signs using a webcam.

The platform combines:

- A React/Vite frontend
- A FastAPI backend API
- A dedicated AI/Computer Vision service
- A Business Logic service
- Supabase PostgreSQL for persistent application data
- Docker and Docker Compose for local service orchestration

The application supports learner, instructor/trainer, accessibility-trainer, and administrative workflows.

---

# Core Features

### Authentication and User Management

- User registration and login
- Role-based access
- Protected frontend routes
- Backend authentication and authorization
- User and role management

### Learning

- Sign-language course catalog
- Modules and lessons
- Sign references
- Lesson management
- Learner progress tracking

### AI-Powered Practice

- Webcam-based sign practice
- Image/frame submission to the AI service
- Sign prediction
- Confidence scoring
- Gesture-quality feedback
- Hand position and distance feedback
- Suggestions for improving the gesture

### Assessment

- Practice sessions
- Assessments
- Score calculation
- Performance feedback
- Certification examinations

### Gamification

- Badges
- Streaks
- Leaderboards
- Learning progress
- Notifications

### Analytics

- Learner analytics
- Weekly analytics
- Assessment analytics
- Trainer/accessibility-trainer dashboards
- Learner engagement information

### Certification

- Certification workflow
- Certification status
- Certified level information
- Certification exam functionality
- Reports/export functionality

---

# System Architecture

```text
                         ┌─────────────────────────┐
                         │        Frontend         │
                         │      React + Vite       │
                         │       Port 80            │
                         └────────────┬────────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
                ▼                     ▼                     ▼
       ┌────────────────┐   ┌────────────────────┐   ┌────────────────┐
       │   Backend API  │   │   Business Logic   │   │   AI Service   │
       │    FastAPI     │   │      FastAPI       │   │   FastAPI      │
       │     :8000      │   │       :8002        │   │     :8001      │
       └───────┬────────┘   └─────────┬──────────┘   └────────────────┘
               │                      │
               │                      │ HTTP
               │                      │
               ▼                      ▼
       ┌─────────────────────────────────────────┐
       │          Supabase PostgreSQL             │
       │        Application Database              │
       └─────────────────────────────────────────┘
```

### Service communication

- Frontend → Backend API: `http://localhost:8000`
- Frontend → AI Service: `http://localhost:8001`
- Frontend → Business Logic: `http://localhost:8002`
- Business Logic → AI Service: `http://aiml:8001/predict`
- Business Logic → Backend API: `http://backend:8000`
- Backend API → Supabase PostgreSQL: through `DATABASE_URL`

The Business Logic service does not currently receive a `DATABASE_URL` in the root Docker Compose configuration. Database access is handled by the Backend API.

---

# Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Component-based UI architecture

## Backend API

- Python 3.11+
- FastAPI
- SQLAlchemy
- Uvicorn
- PostgreSQL
- Authentication and authorization middleware
- Rate limiting and input validation

## AI / Computer Vision

- Python
- FastAPI
- MediaPipe
- OpenCV
- XGBoost
- NumPy
- Joblib
- Keras/TensorFlow model artifacts

## Business Logic

- Python 3.11
- FastAPI
- Pydantic
- HTTPX
- Uvicorn

Business Logic handles application-level operations such as:

- Practice
- Assessment
- Scoring
- Feedback
- Recommendations
- Gamification
- Leaderboards
- Notifications
- Certification
- Export/reporting
- Trainer analytics

## Database

- PostgreSQL
- Supabase PostgreSQL as the current cloud database

## Infrastructure

- Docker
- Docker Compose
- Git
- GitHub
- GitHub Actions

---

# Repository Structure

```text
ai-signlanguage-platform-si7-team-one/
│
├── AIML_CV/
│   ├── src/
│   ├── models/
│   ├── processed/
│   ├── evaluation/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── API_DOCUMENTATION.md
│   └── MODEL_CARD.md
│
├── backend_API/
│   ├── app/
│   │   ├── core/
│   │   ├── database/
│   │   ├── db/
│   │   ├── dependencies/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
│
├── Bussiness_Logic/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── services/
│   ├── docs/
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── CERTIFICATION_AND_REPORTS.md
│
├── Database/
│   ├── schema.sql
│   ├── seed.sql
│   ├── integration_tests.sql
│   ├── data_integrity_check.sql
│   ├── requirements.txt
│   ├── scripts/
│   │   ├── backup_database.py
│   │   └── restore_database.py
│   └── docs/
│       ├── data_integrity_report.md
│       └── DEPLOYMENT_READINESS_CHECKLIST.md
│
├── public/
│   ├── asl-reference/
│   ├── characters/
│   └── sign-language-video.mp4
│
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── services/
│   └── styles/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
├── Dockerfile
├── package.json
├── package-lock.json
├── vite.config.ts
└── README.md
```

---

# Services

## 1. Backend API

Directory:

```text
backend_API/
```

Container:

```text
signlanguage-backend
```

Port:

```text
8000
```

Responsibilities:

- Authentication
- Users
- Roles
- Courses
- Lessons
- Notifications
- Trainer/instructor APIs
- Database access
- Authorization
- Backend-side validation
- Communication with the AI functionality where required

---

## 2. AI / Computer Vision Service

Directory:

```text
AIML_CV/
```

Container:

```text
signlanguage-ai
```

Port:

```text
8001
```

Responsibilities:

- Image/frame processing
- Hand detection and landmark extraction
- Sign prediction
- Confidence calculation
- Gesture quality analysis
- AI feedback
- Model inference

The service exposes the prediction endpoint used by the Business Logic service.

---

## 3. Business Logic Service

Directory:

```text
Bussiness_Logic/
```

Container:

```text
signlanguage-business
```

Port:

```text
8002
```

Responsibilities:

- Practice-session logic
- Assessment logic
- Scoring
- Feedback generation
- Recommendations
- Gamification
- Leaderboards
- Notifications
- Certification
- Reports/export
- Trainer analytics

The Business Logic service communicates with the Backend API for trainer/learner assignment information and with the AI service for predictions.

---

## 4. Frontend

Root application:

```text
src/
```

Container:

```text
signlanguage-frontend
```

Port:

```text
80
```

Responsibilities:

- User interface
- Authentication screens
- Course and lesson views
- Webcam practice
- Assessment screens
- Feedback display
- Learner dashboards
- Instructor dashboards
- Accessibility trainer dashboard
- Admin dashboard
- Certification screens
- Notifications
- Analytics
- Leaderboards

---

# Database

## Current Database

The project currently uses **Supabase PostgreSQL** as the cloud PostgreSQL database.

The Backend API receives the database connection through:

```env
DATABASE_URL=<Supabase PostgreSQL connection string>
```

The connection is configured externally and should not be committed to Git.

### Important

The old project documentation previously referenced Neon PostgreSQL. That documentation is obsolete.

The current project configuration uses Supabase.

Do not add Neon credentials, Neon hosts, or Neon-specific configuration back into the project.

---

# Environment Configuration

## Backend

The Docker Compose configuration passes the database connection to the Backend API:

```yaml
environment:
  DATABASE_URL: ${DATABASE_URL}
```

The actual value should be provided through the local environment.

Example:

```env
DATABASE_URL=postgresql://<user>:<password>@<supabase-host>:<port>/postgres
```

Do not commit the real connection string.

---

## Business Logic

The Business Logic service currently uses:

```env
AI_SERVICE_URL=http://aiml:8001/predict
USE_MOCK_AI=false
BACKEND_API_URL=http://backend:8000
AI_SERVICE_TIMEOUT_SECONDS=10.0
```

These values are configured in `docker-compose.yml`.

---

## Frontend

Development configuration:

```env
VITE_API_URL=http://localhost:8000
VITE_BUSINESS_API_URL=http://localhost:8002
```

Production configuration should contain the real deployed service URLs.

Example:

```env
VITE_API_URL=https://<production-backend>
VITE_BUSINESS_API_URL=https://<production-business-service>
```

Do not commit production secrets.

---

# Run the Application

## 1. Clone the repository

```bash
git clone <repository-url>
cd ai-signlanguage-platform-si7-team-one
```

## 2. Configure the database

Set the Supabase PostgreSQL connection string in the environment:

```env
DATABASE_URL=<your-supabase-postgresql-connection-string>
```

Do not paste real credentials into source files.

## 3. Build all containers

```bash
docker compose build
```

## 4. Start all services

```bash
docker compose up -d
```

## 5. Check service status

```bash
docker compose ps
```

## 6. View logs

```bash
docker compose logs -f
```

To view only one service:

```bash
docker compose logs -f backend
```

```bash
docker compose logs -f aiml
```

```bash
docker compose logs -f business
```

---

# Service Ports

| Service | Container Port | Host Port |
|---|---:|---:|
| Frontend | 80 | 80 |
| Backend API | 8000 | 8000 |
| AI Service | 8001 | 8001 |
| Business Logic | 8002 | 8002 |
| Database | External Supabase | External Supabase |

The PostgreSQL database is not required to run as a local Docker service in the current root `docker-compose.yml`.

---

# Health Checks

## Backend

```bash
curl http://localhost:8000/health
```

Expected:

```json
{"status":"healthy"}
```

## AI Service

```bash
curl http://localhost:8001/health
```

The AI service health response reports whether the model is loaded.

## Business Logic

```bash
curl http://localhost:8002/health
```

Expected:

```json
{"status":"ok","service":"practice"}
```

## Frontend

Open:

```text
http://localhost
```

---

# Database Setup and Validation

The repository contains database schema and validation utilities under:

```text
Database/
```

## Schema

```bash
psql -f Database/schema.sql
```

This creates the application's database structures.

## Seed Data

```bash
psql -f Database/seed.sql
```

This inserts initial application data where required.

## Integration Tests

```bash
psql -f Database/integration_tests.sql
```

These scripts validate important database functionality including application relationships and database behavior.

## Data Integrity Checks

```bash
psql -f Database/data_integrity_check.sql
```

This checks for issues such as:

- Duplicate users
- Duplicate badge codes
- Orphan records
- Invalid references
- Missing required values
- Invalid streak values

---

# Database Backup and Restore

Database utilities are located in:

```text
Database/scripts/
```

## Backup

```bash
python Database/scripts/backup_database.py
```

Backups are written to:

```text
Database/backups/
```

## Restore

```bash
python Database/scripts/restore_database.py
```

### Important

The backup and restore scripts must be reviewed before production use to ensure they read the current Supabase `DATABASE_URL` configuration and do not contain legacy Neon-specific assumptions.

Do not commit database credentials or production connection strings.

---

# Testing

## Business Logic

Python syntax can be checked with:

```bash
python -m compileall Bussiness_Logic
```

Business Logic tests are located under:

```text
Bussiness_Logic/tests/
```

Run them when `pytest` is installed:

```bash
python -m pytest Bussiness_Logic/tests -q
```

## Backend

Backend tests are located under:

```text
backend_API/tests/
```

Run:

```bash
python -m pytest backend_API/tests -q
```

The test suite covers areas such as:

- Authentication
- Core APIs
- Courses
- Notifications
- Input validation
- Rate limiting
- Integration journeys
- Security checks

---

# AI Service

The AI service contains model artifacts and computer-vision processing code.

Important components include:

```text
AIML_CV/
├── models/
├── processed/
├── evaluation/
└── src/
```

The service uses:

- MediaPipe for hand/landmark processing
- OpenCV for image processing
- XGBoost for prediction
- Keras/TensorFlow model artifacts
- NumPy for numerical processing
- Joblib for model/encoder persistence

The AI service reports its model state through:

```text
GET /health
```

---

# Business Logic Service

The Business Logic service is a FastAPI application.

Main router groups include:

- Practice
- Assessment
- Analytics
- Feedback
- Recommendations
- Certificates
- Certification
- Progress
- Gamification
- Leaderboard
- Notifications
- Export
- Trainer Analytics

The service obtains the AI endpoint from configuration rather than hardcoding a localhost AI URL.

Example container configuration:

```env
AI_SERVICE_URL=http://aiml:8001/predict
```

The service also communicates with the Backend API:

```env
BACKEND_API_URL=http://backend:8000
```

---

# Backend API

The Backend API provides the application's central API and database access layer.

Major areas include:

- Authentication
- Users
- Roles
- Courses
- Lessons
- Notifications
- Instructor/trainer functionality
- Analytics
- AI prediction integration
- Database persistence

The Backend API uses SQLAlchemy for PostgreSQL database interaction.

---

# Frontend

The frontend is a React/Vite application.

Major application areas include:

- Login
- Signup
- Onboarding
- Course catalog
- Lesson view
- Practice
- Assessment
- Feedback
- Learner dashboard
- Progress analytics
- Certificates
- Certification exam
- Instructor dashboard
- Accessibility trainer dashboard
- Trainer console
- Admin dashboard
- User management
- Notifications
- Leaderboard
- Settings

Frontend service URLs are configured using Vite environment variables.

---

# Production Configuration

For production deployment, replace local development URLs with deployed HTTPS endpoints.

Development:

```text
http://localhost:8000
http://localhost:8001
http://localhost:8002
```

Production:

```text
https://<backend-domain>
https://<ai-domain>
https://<business-domain>
```

The production frontend should use the production backend and Business Logic URLs at build time.

### Production checklist

Before deployment:

- Verify Supabase connectivity
- Verify backend health
- Verify AI model loading
- Verify Business Logic health
- Verify service-to-service communication
- Verify CORS configuration
- Verify authentication and authorization
- Verify rate limiting
- Verify security headers
- Verify secrets are externalized
- Verify no `.env` files or credentials are committed
- Verify Docker images build successfully
- Verify all required environment variables exist
- Verify production URLs use HTTPS
- Verify database backup/restore procedures

---

# Security Notes

## Secrets

Never commit:

```text
.env
.env.production
passwords
API keys
JWT secrets
database connection strings
private keys
certificates
```

Use environment variables or the deployment platform's secret-management facility.

## Database

The application currently uses Supabase PostgreSQL.

The Backend API is the database-facing service in the root Docker Compose architecture.

## CORS

CORS must be restricted to the actual production frontend origin when deployed.

Avoid using unrestricted origins in production.

## Docker

Services run in separate containers:

```text
frontend
backend
aiml
business
```

Service-to-service communication uses Docker Compose service names.

---

# Git Workflow

The project follows a feature-branch workflow.

Typical branches include:

```text
main
divya-database-devops
backend-aashi
abhinaya-aiml-cv
gana-businesslogic
```

Recommended workflow:

```bash
git checkout -b feature/my-change
```

Make changes and test them:

```bash
git status
git diff
```

Commit:

```bash
git add .
git commit -m "description of change"
```

Push:

```bash
git push origin feature/my-change
```

Create a Pull Request and merge after review.

The `main` branch contains the integrated application.

---

# Continuous Integration

GitHub Actions configuration is located at:

```text
.github/workflows/ci.yml
```

CI should be used to validate changes before production deployment.

---

# Milestone Progress

## Milestone 1

Completed areas include:

- User authentication
- Lesson management
- AI predictions
- Assessments
- Feedback
- Analytics
- Initial database design
- Docker environment

## Milestone 2

Completed areas include:

- Certificates
- Recommendations
- Weekly analytics
- Instructor-student mapping
- Database/ER updates
- Additional business logic

## Milestone 3

Completed areas include:

- Notifications
- Badges
- User badges
- Streaks
- Performance indexes
- Query optimization
- Database integration tests
- Data integrity validation
- Backup/restore utilities
- Environment configuration

## Milestone 4

The current repository includes Milestone 4 work across the frontend, Backend API, AI/CV service, Business Logic service, database/infrastructure, testing, certification, reporting, and trainer analytics.

Current integrated work includes:

- Certification functionality
- Certification exam/reporting
- Trainer analytics
- Accessibility trainer functionality
- Business Logic integration
- Backend security improvements
- Environment-based service configuration
- Dockerized multi-service execution
- Supabase PostgreSQL integration
- Production-readiness preparation

---

# Team Structure

| Team Member | Responsibility |
|---|---|
| Intern 1 | Frontend / UI |
| Intern 2 | Backend API |
| Intern 3 | AI / Computer Vision |
| Intern 4 | Business Logic |
| Intern 5 | Database & DevOps |

---

# Important Notes

1. **Supabase PostgreSQL is the current cloud database.**
2. Neon PostgreSQL is no longer the project's active database.
3. Database credentials must never be committed to Git.
4. The root Docker Compose configuration runs the Frontend, Backend, AI, and Business Logic services.
5. The Backend API is responsible for the current database connection.
6. Business Logic communicates with Backend and AI services through Docker service URLs.
7. The AI service must have its model artifacts available when the container starts.
8. Production deployments should use HTTPS and production-specific environment variables.
9. The database backup and restore scripts should be verified against the current Supabase configuration before relying on them for production recovery.
10. Generated files such as Python `__pycache__` directories should not be committed.

---

# Author

Prepared as part of the:

**AI-Powered Sign Language Learning & Assessment Platform**

**Database & DevOps**

**Intern 5**
