import os
os.environ["TESTING"] = "1"

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.models.role import Role

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def ensure_roles_seeded():
    """Make sure default roles exist before any test runs."""
    db = SessionLocal()
    try:
        for role_name in ["learner", "instructor", "trainer", "admin"]:
            if not db.query(Role).filter(Role.role_name == role_name).first():
                db.add(Role(role_name=role_name))
        db.commit()
    finally:
        db.close()


@pytest.fixture
def test_client():
    return client