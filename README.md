# AI-Powered Sign Language Learning & Assessment Platform

## Milestone 1

This repository contains the source code for **Milestone 1** of the AI-Powered Sign Language Learning & Assessment Platform.

The goal of this milestone is to build a working end-to-end prototype that allows a learner to:

- Register and Login
- View sign language lessons
- Practice signs using a webcam
- Receive AI-based sign predictions
- Get assessment scores and feedback
- Store practice data in PostgreSQL

---

# Team Structure

| Intern | Responsibility |
|---------|----------------|
| Intern 1 | Frontend / UI |
| Intern 2 | Backend API |
| Intern 3 | AI / Computer Vision |
| Intern 4 | Business Logic |
| Intern 5 | Database & DevOps |

---

# Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS

## Backend

- FastAPI
- Uvicorn

## AI Service

- MediaPipe
- OpenCV
- XGBoost
- NumPy
- Joblib

## Database

- PostgreSQL

## DevOps

- Docker
- Docker Compose
- GitHub Actions

---

# Project Structure

```text
ai-signlanguage-platform-si7-team-one/

├── AIML_CV/
├── backend_API/
├── Frontend/
├── Business_Logic/
├── Database/
│   ├── schema.sql
│   └── seed.sql
├── docker-compose.yml
├── README.md
└── .github/
    └── workflows/
        └── ci.yml
```

---

# Prerequisites

Before running the project, install:

- Git
- Docker Desktop
- Python 3.11 (optional for local development)
- VS Code (recommended)

---

# Clone Repository

```bash
git clone <repository-url>

cd ai-signlanguage-platform-si7-team-one
```

---

# Database Configuration

The project uses PostgreSQL.

Default configuration:

```text
Database : sign_language_learning

Username : postgres

Password : postgres

Port : 5432
```

---

# Running the Project

After all project modules are available:

```bash
docker compose up --build
```

To stop all containers:

```bash
docker compose down
```

---

# Service Ports

| Service | Port |
|----------|------|
| PostgreSQL | 5432 |
| Backend API | 8000 |
| AI Prediction Service | 8001 |
| Frontend | 5173 |

---

# Git Workflow

Development follows a feature-branch workflow.

Example branches:

- main
- divya-database-devops
- backend-aashi
- abhinaya-aiml-cv

Each intern develops in an individual feature branch before merging into the main branch.

---

# Continuous Integration

GitHub Actions is configured to perform a basic Continuous Integration (CI) check whenever code is pushed or a pull request is created.

Workflow location:

```text
.github/workflows/ci.yml
```

---

# Milestone 1 Status

The project is designed to provide:

- User Authentication
- Lesson Management
- AI-based Sign Prediction
- Assessment & Feedback
- Analytics
- PostgreSQL Data Storage
- Dockerized Development Environment

---

# Notes

The complete system requires contributions from all team members. Full integration and end-to-end execution are performed after all feature branches have been merged.

---

# Author

Prepared as part of **Milestone 1** for the AI-Powered Sign Language Learning & Assessment Platform.

Database & DevOps:
Intern 5