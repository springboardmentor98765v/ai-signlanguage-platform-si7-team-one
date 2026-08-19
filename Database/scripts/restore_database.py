import subprocess
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# PostgreSQL installation path
PG_BIN = r"C:\Program Files\PostgreSQL\18\bin"

PSQL = str(Path(PG_BIN) / "psql.exe")

HOST = os.getenv("PGHOST")
PORT = os.getenv("PGPORT")
DATABASE = os.getenv("PGDATABASE")
USERNAME = os.getenv("PGUSER")
PASSWORD = os.getenv("PGPASSWORD")

# Select the latest backup
BACKUP_DIR = Path(__file__).parent.parent / "backups"
backup_files = sorted(BACKUP_DIR.glob("*.sql"))

if not backup_files:
    print("No backup file found.")
    exit()

backup_file = backup_files[-1]

command = [
    PSQL,
    "-h", HOST,
    "-p", PORT,
    "-U", USERNAME,
    "-d", DATABASE,
    "-f",
    str(backup_file)
]

env = os.environ.copy()
env["PGPASSWORD"] = PASSWORD

print(f"Restoring backup:\n{backup_file}\n")

try:
    subprocess.run(command, env=env, check=True)
    print("Backup restored successfully.")
except subprocess.CalledProcessError:
    print("Restore completed with warnings/errors. Review the psql output above.")


    