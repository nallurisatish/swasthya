from app.models.user import User
from app.models.document import Document
from app.services.auth_service import hash_password, create_access_token

def test_user_data_isolation(client, db):
    # Create User A
    user_a = User(email="user_a@test.com", hashed_password=hash_password("Pass1!"), full_name="User A")
    # Create User B
    user_b = User(email="user_b@test.com", hashed_password=hash_password("Pass2!"), full_name="User B")
    db.add_all([user_a, user_b])
    db.commit()

    # Create Document owned by User B
    doc_b = Document(
        user_id=user_b.id,
        original_filename="user_b_private_report.pdf",
        stored_filename="b_file.pdf",
        file_size=1000,
        mime_type="application/pdf",
        content_hash="hash_b",
        document_type="lab_report"
    )
    db.add(doc_b)
    db.commit()

    # User A tries to access User B's document
    token_a = create_access_token({"sub": user_a.id, "user_id": user_a.id, "email": user_a.email})
    headers_a = {"Authorization": f"Bearer {token_a}"}

    res = client.get(f"/api/documents/{doc_b.id}", headers=headers_a)
    assert res.status_code == 404

    # User A tries to delete User B's document
    del_res = client.delete(f"/api/documents/{doc_b.id}", headers=headers_a)
    assert del_res.status_code == 404

    # User A's document list does not contain User B's document
    list_res = client.get("/api/documents", headers=headers_a)
    assert list_res.status_code == 200
    docs = list_res.json()
    assert len(docs) == 0
