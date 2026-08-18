# tests/security_check.py
# Run this manually with: python tests/security_check.py
# It sends "bad" data to your API and prints what happens.

import httpx

BASE_URL = "http://localhost:8000"

bad_inputs = [
    "<script>alert(1)</script>",   # trying to inject a script
    "' OR '1'='1",                  # trying SQL injection
    "a" * 5000,                     # way too long text
]

def test_register_with_bad_email():
    print("\n--- Testing /auth/register with bad inputs ---")
    for bad in bad_inputs:
        r = httpx.post(f"{BASE_URL}/auth/register", json={
            "email": bad,
            "password": "TestPass123",
            "full_name": "Test User"
        })
        print(f"Input: {bad[:30]!r}... | Status: {r.status_code}")
        # GOOD: status should be 400 or 422 (rejected)
        # BAD: status 500 (crashed) or 200/201 (accepted bad data)

if __name__ == "__main__":
    test_register_with_bad_email()
    