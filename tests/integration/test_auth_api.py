def test_register_user_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "Password123!",
            "full_name": "New User",
            "role_name": "user",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "newuser@example.com"
    assert data["data"]["full_name"] == "New User"
    assert data["data"]["role"]["name"] == "user"


def test_register_duplicate_email(client):
    payload = {
        "email": "duplicate@example.com",
        "password": "Password123!",
        "full_name": "Duplicate User",
        "role_name": "user",
    }
    r1 = client.post("/api/v1/auth/register", json=payload)
    assert r1.status_code == 200

    r2 = client.post("/api/v1/auth/register", json=payload)
    assert r2.status_code == 409
    assert "already exists" in r2.json()["error"]["message"]


def test_login_flow(client):
    # Register
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "loginuser@example.com",
            "password": "ValidPassword123!",
            "full_name": "Login User",
            "role_name": "user",
        },
    )

    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "loginuser@example.com",
            "password": "ValidPassword123!",
        },
    )
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    # Profile lookup with token
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["data"]["email"] == "loginuser@example.com"


def test_login_invalid_password(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "testpass@example.com",
            "password": "CorrectPassword123!",
            "full_name": "Test Pass",
            "role_name": "user",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "testpass@example.com",
            "password": "WrongPassword!",
        },
    )
    assert response.status_code == 401

