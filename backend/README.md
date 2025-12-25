EduFarm backend (development)

Setup:

1. Open a terminal in this folder:

```bash
cd backend
npm install
npm start
```

2. The server listens on `http://localhost:3000` by default.

Notes:
- This is a minimal dev backend storing users in `users.json` (no hashing, not secure).
- For production, replace with a proper DB and password hashing.

Now: this backend uses SQLite and issues JWTs. Endpoints:
- `POST /api/register` -> { fullname, email, phone, password, userType } returns { user, token }
- `POST /api/login` -> { email, password } returns { user, token }
- `GET /api/me` -> requires `Authorization: Bearer <token>` returns { user }

Security note: passwords are hashed with bcryptjs but this is still a simple dev server. Use HTTPS and strong secrets in production.
