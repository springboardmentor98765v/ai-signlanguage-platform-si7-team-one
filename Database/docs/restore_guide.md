# Database Restore Guide

## Requirements

- PostgreSQL 18
- pgAdmin 4
- Python 3.13+

---

## Restore using pgAdmin

1. Create a database named:

```
SIGN LANGUAGE LEARNING
```

2. Open Query Tool.

3. Open:

```
schema.sql
```

4. Execute the script.

5. Open:

```
seed.sql
```

6. Execute the script.

---

## Restore using Python

Run:

```bash
python scripts/restore_database.py
```

---

## Create Backup

Run:

```bash
python scripts/backup_database.py
```

Backups will be stored in:

```
backups/
```