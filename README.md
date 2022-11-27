# quizard_backend

Domain of server: https://quizardbackend-production.up.railway.app/

## Routes

### Auth

#### Login

api: /auth/login

if invalid username or password:

```json
Unauthorized
```

if login success:

```json
{
    "message": "Login sucessfully",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MzdmMmFlZWVkZWViM2FhNWFmOGNlMzQiLCJlbWFpbCI6Inl1YmljdWJpbkBnbWFpbC5jb20iLCJuYW1lIjoiTmd1eeG7hW4gUXXhu5FjIFRow7RuZyIsImdlbmRlciI6Ik1hbGUiLCJkb2IiOiIyNi8wMy8yMDAxIiwiaWF0IjoxNjY5NTY2NzM1fQ.XjZzCyha4vOrvavyJsnlW-kOA06pnr0hJKUMVT8HcMw"
}
```

#### Register

api: /auth/register

if bad request:

```json
{
  "message": "Input validation failed"
}
```

if email exist

```json
{
  "message": "Email already exists"
}
```

if register successfully

```json
{
    "message": "Create user successfully",
    "user": {
        "_id": "63838b694d218e248e360c4c",
        "email": "yubicubin@gmail.com",
        "name": "Nguyễn Quốc Thông",
        "gender": "Male",
        "dob": "26/03/2001"
    }
}
```