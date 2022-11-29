# quizard_backend

Domain of server: https://quizardbackend-production.up.railway.app/

## Routes

### Auth

#### Login

api: /auth/login

if invalid username or password:

```json
statusCode: 401
Unauthorized
```

if login success:

```json
statusCode: 200
{
    "message": "Login sucessfully",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MzdmMmFlZWVkZWViM2FhNWFmOGNlMzQiLCJlbWFpbCI6Inl1YmljdWJpbkBnbWFpbC5jb20iLCJuYW1lIjoiTmd1eeG7hW4gUXXhu5FjIFRow7RuZyIsImdlbmRlciI6Ik1hbGUiLCJkb2IiOiIyNi8wMy8yMDAxIiwiaWF0IjoxNjY5NTY2NzM1fQ.XjZzCyha4vOrvavyJsnlW-kOA06pnr0hJKUMVT8HcMw"
}
```

#### Register

api: /auth/register

if bad request:

```json
statusCode: 400
{
  "message": "Input validation failed"
}
```

if email exist

```json
statusCode: 400
{
  "message": "Email already exists"
}
```

if register successfully

```json
statusCode: 201
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

### Groups

#### Get detail group

api: /groups/detail/:groupId

if group not found:

```json
statusCode: 404
{ 
  "message": "Not found"
}
```

if get detail successfully:

```json
statusCode: 200
{
    "_id": "6385bda532217cc07f13171d",
    "groupId": "LnqC-U0Ak8",
    "name": "Group 1",
    "description": "Test group",
    "joinedUser": [
        {
            "_id": "6385be939f331928a1ac3b9a",
            "email": "yubicubin3@gmail.com",
            "name": "Nguyễn Quốc Thông",
            "__v": 0,
            "role": "Co-Owner"
        },
        {
            "_id": "6385bf109f331928a1ac3b9d",
            "email": "yubicubin2@gmail.com",
            "name": "Nguyễn Quốc Thông",
            "__v": 0,
            "role": "Owner"
        },
        {
            "_id": "6385cc6004ba85ce3f52f2cc",
            "email": "yubicubin4@gmail.com",
            "name": "Nguyễn Quốc Thông",
            "__v": 0,
            "role": "Member"
        }
    ]
}
```