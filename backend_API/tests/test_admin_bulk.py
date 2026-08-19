import io
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

BASE_URL = "http://test"
transport = ASGITransport(app=app)


@pytest.mark.asyncio
async def test_bulk_user_action(auth_headers, test_user):
    async with AsyncClient(transport=transport, base_url=BASE_URL) as ac:
        resp = await ac.post("/admin/users/bulk-action", headers=auth_headers, json={
            "user_ids": [str(test_user.user_id)],
            "action": "deactivate",
        })
        assert resp.status_code in (200, 403)


@pytest.mark.asyncio
async def test_bulk_lesson_upload(auth_headers):
    # Use a random high sequence_order range each run so this test
    # can be re-run against a persistent shared DB without colliding
    # with leftover data from a previous run.
    base = uuid.uuid4().int % 100000  # random offset, e.g. 47213
    csv_content = (
        "module_id,title,sequence_order,difficulty_level,category\n"
        f"1,Test Lesson A,{base},beginner,Alphabet\n"
        f"1,Test Lesson B,{base + 1},intermediate,Alphabet\n"
    )
    files = {"file": ("lessons.csv", io.BytesIO(csv_content.encode()), "text/csv")}

    async with AsyncClient(transport=transport, base_url=BASE_URL) as ac:
        resp = await ac.post("/admin/lessons/bulk-upload", headers=auth_headers, files=files)
        assert resp.status_code in (200, 403)
        if resp.status_code == 200:
            assert resp.json()["created_count"] == 2