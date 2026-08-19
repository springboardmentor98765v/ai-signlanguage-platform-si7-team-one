import subprocess
import os
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
# PostgreSQL installation path
PG_BIN = r"C:\Program Files\PostgreSQL\18\bin"

PG_DUMP = str(Path(PG_BIN) / "pg_dump.exe")

HOST = os.getenv("PGHOST")
PORT = os.getenv("PGPORT")
DATABASE = os.getenv("PGDATABASE")
USERNAME = os.getenv("PGUSER")
PASSWORD = os.getenv("PGPASSWORD")

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

env = os.environ.copy()
env["PGPASSWORD"] = PASSWORD
print("Creating backup...")

subprocess.run(command, env=env, check=True)
print(f"\nBackup created successfully:\n{backup_file}")