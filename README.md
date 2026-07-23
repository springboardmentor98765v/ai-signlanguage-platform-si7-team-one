# AI-Powered Sign Language Learning & Assessment Platform

## Milestone 1

This repository contains the source code for **Milestone 1** of the AI-Powered Sign Language Learning & Assessment Platform.

The goal of this milestone is to build a working end-to-end prototype that allows a learner to:

- Register and Login
- View sign language lessons
- Practice signs using a webcam
- Receive AI-based sign predictions
- Get assessment scores and feedback
- Store practice data in PostgreSQL.

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

- PostgreSQL 18

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
│   ├── seed.sql
│   ├── scripts/
│   │   ├── backup_database.py
│   │   └── restore_database.py
│   ├── backups/
│   └── docs/
│       └── restore_guide.md
├── docker-compose.yml
├── README.md
└── .github/
    └── workflows/
        └── ci.yml
```

---

# Prerequisites

Install the following before running the project:

- Git
- Docker Desktop
- PostgreSQL 18
- Python 3.11
- VS Code (recommended)

---

# Clone Repository

```bash
git clone <repository-url>

cd ai-signlanguage-platform-si7-team-one
```

---

# Database Configuration

Database Name

```text
sign_language_learning
```

Default PostgreSQL Configuration

```text
Host     : localhost
Port     : 5432
Username : postgres
Password : postgres
```

---

# Create Database

Create a PostgreSQL database named:

```text
sign_language_learning
```

Example using psql:

```sql
CREATE DATABASE sign_language_learning;
```

---

# Create Database Schema

Execute:

```bash
psql -U postgres -d sign_language_learning -f Database/schema.sql
```

This creates all database tables, constraints, indexes, and relationships.

---

# Seed Initial Data

Execute:

```bash
psql -U postgres -d sign_language_learning -f Database/seed.sql
```

This inserts the initial application data.

---

# Database Backup

Run:

```bash
cd Database

python scripts/backup_database.py
```

The generated backup will be stored in:

```text
Database/backups/
```

---

# Database Restore

Run:

```bash
cd Database

python scripts/restore_database.py
```

This restores the database schema from `schema.sql`.

For complete instructions, refer to:

```text
Database/docs/restore_guide.md
```

---

# Running the Project

After all project modules are available:

```bash
docker compose up --build
```

To stop all services:

```bash
docker compose down
```

---

# Service Ports

| Service | Port |
|----------|------|
| PostgreSQL | 5432 |
| Backend API | 8000 |
| AI Service | 8001 |
| Frontend | 5173 |

---

# Git Workflow

Development follows a feature-branch workflow.

Example branches:

- main
- divya-database-devops
- backend-aashi
- abhinaya-aiml-cv

Each intern develops in an individual feature branch before creating a Pull Request and merging into the `main` branch.

---

# Continuous Integration

GitHub Actions performs a basic Continuous Integration (CI) check whenever code is pushed or a Pull Request is created.

Workflow location:

```text
.github/workflows/ci.yml
```

---

# Milestone 1 Status

The project provides:

- User Authentication
- Lesson Management
- AI-based Sign Prediction
- Assessment & Feedback
- Analytics
- PostgreSQL Data Storage
- Dockerized Development Environment

---

# Notes

- Database schema is maintained by Intern 5.
- Backup and restore utilities are included for database maintenance.
- Full end-to-end execution requires contributions from all team members after merging all feature branches.

---

# Author

Prepared as part of **Milestone 1** for the AI-Powered Sign Language Learning & Assessment Platform.

**Database & DevOps**

Intern 5