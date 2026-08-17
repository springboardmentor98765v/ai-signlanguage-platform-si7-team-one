# AI-Powered Sign Language Learning & Assessment Platform

## Project Overview

This repository contains the source code for the **AI-Powered Sign Language Learning & Assessment Platform**.

The project is being developed incrementally across multiple milestones.

### Current Progress

- ✅ Milestone 1 Completed
- ✅ Milestone 2 Completed
- ✅ Milestone 3 (Completed up to Day 5)

The platform allows learners to:

- Register and Login
- Learn Sign Language Lessons
- Practice Signs using a Webcam
- Receive AI-based Sign Predictions
- Complete Assessments
- Earn Badges
- Maintain Learning Streaks
- Receive Notifications
- View Learning Analytics
- Store application data securely in PostgreSQL

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
- SQLAlchemy
- Uvicorn

## AI Service

- MediaPipe
- OpenCV
- XGBoost
- NumPy
- Joblib

## Database

- PostgreSQL 18
- Neon PostgreSQL

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
├── Business_Logic/
├── Database/
│
├── schema.sql
├── seed.sql
├── integration_tests.sql
├── data_integrity_check.sql
│
├── scripts/
│   ├── backup_database.py
│   └── restore_database.py
│
├── backups/
│
├── docs/
│   ├── restore_guide.md
│   └── data_integrity_report.md
│
├── docker-compose.yml
├── README.md
└── .github/
    └── workflows/
        └── ci.yml
```

---

# Prerequisites

Install the following software before running the project.

- Git
- Docker Desktop
- PostgreSQL 18
- Python 3.11+
- pgAdmin 4
- VS Code (Recommended)

---

# Clone Repository

```bash
git clone <repository-url>

cd ai-signlanguage-platform-si7-team-one
```

---

# Database Configuration

The project uses **Neon PostgreSQL** as the primary cloud database.

Database credentials are stored in the project's `.env` file.

Example:

```env
HOST=your_neon_host
PORT=5432
DATABASE=neondb
USERNAME=neondb_owner
PASSWORD=your_password
```

> **Note:** Never commit the `.env` file to GitHub.

---

# Create Database Schema

Execute:

```bash
psql -f Database/schema.sql
```

This creates all database tables, constraints, indexes, triggers, and relationships.

---

# Seed Initial Data

Execute:

```bash
psql -f Database/seed.sql
```

This inserts the initial application data.

---

# Database Integration Tests

Run:

```bash
psql -f Database/integration_tests.sql
```

This verifies:

- Notifications
- Badges
- User Badges
- Streaks
- Database Indexes
- Database Triggers

---

# Database Data Integrity Checks

Run:

```bash
psql -f Database/data_integrity_check.sql
```

This validates:

- Duplicate Users
- Duplicate Badge Codes
- Orphan Notifications
- Orphan User Badges
- Invalid Badge References
- NULL Required Fields
- Invalid Streak Values

---

# Database Backup

Run:

```bash
python Database/scripts/backup_database.py
```

The script automatically:

- Connects to the Neon PostgreSQL database
- Creates a timestamped SQL backup
- Saves the backup inside:

```text
Database/backups/
```

Example:

```text
database_backup_20260731_211554.sql
```

---

# Database Restore

Run:

```bash
python Database/scripts/restore_database.py
```

The restore script:

- Connects to the configured Neon PostgreSQL database
- Restores the generated SQL backup
- Reports restore warnings or errors when applicable

For complete instructions, see:

```text
Database/docs/restore_guide.md
```

---

# Running the Project

Start all services:

```bash
docker compose up --build
```

Stop all services:

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

Each intern develops independently in their feature branch before creating a Pull Request.

---

# Continuous Integration

GitHub Actions automatically performs Continuous Integration (CI) checks whenever code is pushed or a Pull Request is created.

Workflow location:

```text
.github/workflows/ci.yml
```

---

# Milestone Progress

## ✅ Milestone 1

Completed:

- User Authentication
- Lesson Management
- AI Predictions
- Assessments
- Feedback
- Analytics
- Docker Environment
- PostgreSQL Database Design

---

## ✅ Milestone 2

Completed:

- Certificates
- Recommendations
- Weekly Analytics
- Instructor-Student Mapping
- Updated ER Diagram
- Database Documentation

---

## ✅ Milestone 3 (Completed up to Day 5)

### Day 1

Completed:

- Notifications Table
- Badges Table
- User Badges Table
- Streaks Table

### Day 2

Completed:

- Performance Indexes
- Query Optimization

### Day 3

Completed:

- Database Integration Tests

### Day 4

Completed:

- Data Integrity Validation
- Data Integrity Report

### Day 5

Completed:

- Automated Database Backup
- Automated Database Restore
- Restore Documentation
- Environment Variable Configuration
- Neon PostgreSQL Support

---

# Notes

- Database schema is maintained by **Intern 5 (Database & DevOps)**.
- The project uses **Neon PostgreSQL** as the primary cloud database.
- Backup and Restore utilities support Neon PostgreSQL.
- Integration testing scripts are included.
- Data integrity validation scripts are included.
- Full end-to-end execution requires all team branches to be merged.

---

# Author

Prepared as part of the

**AI-Powered Sign Language Learning & Assessment Platform**

**Database & DevOps**

**Intern 5**