import subprocess
from datetime import datetime
from pathlib import Path

# PostgreSQL installation path
PG_BIN = r"C:\Program Files\PostgreSQL\18\bin"

PG_DUMP = str(Path(PG_BIN) / "pg_dump.exe")

HOST = "localhost"
PORT = "5432"
DATABASE = "sign_language_learning"
USERNAME = "postgres"

OUTPUT_DIR = Path(__file__).parent.parent / "backups"
OUTPUT_DIR.mkdir(exist_ok=True)

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

backup_file = OUTPUT_DIR / f"database_backup_{timestamp}.sql"

command = [
    PG_DUMP,
    "-h", HOST,
    "-p", PORT,
    "-U", USERNAME,
    "-F", "p",
    "-f", str(backup_file),
    DATABASE
]

print("Creating backup...")

subprocess.run(command)

print(f"\nBackup created successfully:\n{backup_file}")