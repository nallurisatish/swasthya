def test_register_and_login(client):
    # Register
    reg_payload = {
        "email": "test.patient@example.com",
        "password": "SecurePassword123!",
        "full_name": "Ravi Kumar",
        "date_of_birth": "1985-06-15",
        "gender": "Male",
        "preferred_language": "en"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["email"] == "test.patient@example.com"
    token = data["access_token"]

    # Login
    login_payload = {
        "email": "test.patient@example.com",
        "password": "SecurePassword123!"
    }
    res_login = client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()

    # Get Profile
    headers = {"Authorization": f"Bearer {token}"}
    res_prof = client.get("/api/auth/profile", headers=headers)
    assert res_prof.status_code == 200
    prof_data = res_prof.json()
    assert prof_data["full_name"] == "Ravi Kumar"
    assert prof_data["profile"]["gender"] == "Male"
