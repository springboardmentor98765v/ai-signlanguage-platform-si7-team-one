import subprocess
from pathlib import Path

PG_BIN = r"C:\Program Files\PostgreSQL\18\bin"

PSQL = str(Path(PG_BIN) / "psql.exe")

HOST = "localhost"
PORT = "5432"
DATABASE = "sign_language_learning"
USERNAME = "postgres"

schema = Path(__file__).parent.parent / "schema.sql"

command = [
    PSQL,
    "-h", HOST,
    "-p", PORT,
    "-U", USERNAME,
    "-d", DATABASE,
    "-f",
    str(schema)
]

print("Restoring schema...")

result = subprocess.run(command)

if result.returncode == 0:
    print("Schema restored successfully.")
else:
    print("Schema restore completed with warnings/errors.")