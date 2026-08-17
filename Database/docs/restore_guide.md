# Database Backup & Restore Guide

## Requirements

- PostgreSQL 18 (pg_dump and psql installed)
- Python 3.11+
- pgAdmin 4 (optional)
- Neon PostgreSQL Database
- python-dotenv

---

# Project Database

This project uses **Neon PostgreSQL** as the primary database.

Database connection details are stored in the project's `.env` file.

---

# Environment Variables

Create a `.env` file in the project root.

Example:

```env
HOST=ep-old-river-az2pxljy.c-3.ap-southeast-1.aws.neon.tech
PORT=5432
DATABASE=neondb
USERNAME=neondb_owner
PASSWORD=your_password
```

> Never commit the `.env` file to GitHub.

---

# Restore Database

Run:

```bash
python Database/scripts/restore_database.py
```

The script will:

- Connect to the Neon PostgreSQL database
- Restore the latest SQL backup
- Report any warnings or restore errors

> If restoring into an existing database, PostgreSQL may report "already exists" warnings for tables, indexes, constraints, and triggers. This is expected.

---

# Create Backup

Run:

```bash
python Database/scripts/backup_database.py
```

The script will:

- Connect to the Neon PostgreSQL database
- Create a timestamped SQL backup

Example:

```
database_backup_20260731_211554.sql
```

---

# Backup Location

All backups are stored in:

```
Database/backups/
```

---

# Restore Notes

For a clean restore:

- Restore into an empty database
- OR create a new Neon branch/database before restoring

Restoring over an existing database may produce warnings because database objects already exist.

---

# Tools Used

- PostgreSQL 18
- Neon PostgreSQL
- pg_dump
- psql
- Python
- subprocess
- python-dotenv