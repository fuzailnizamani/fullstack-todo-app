# Fullstack Todo App

> A simple Todo application (backend) built with Node.js, Express and MySQL. This repository contains the server-side code for user authentication (JWT + refresh tokens) and task CRUD operations.

## Tech Stack
- Node.js + Express
- MySQL (mysql2)
- JWT for authentication
- bcryptjs for password hashing

## Project Structure

- `server/` — Express API and configuration
  - `config/db.js` — MySQL connection pool
  - `controllers/` — request handlers for users and tasks
  - `routes/` — API route definitions
  - `middleware/authenticateToken.js` — auth middleware

## Getting Started

Prerequisites:

- Node.js (v16+ recommended)
- MySQL server

Quick start:

1. Copy the repository and open a terminal in the project folder.
2. Install server dependencies and start the server:

```bash
cd server
npm install
# start server (or use your preferred script)
node server.js
```

3. Create the database and tables (see SQL below) and add a `.env` file.

## Environment Variables

Create a `.env` file in `server/` with the following variables (replace placeholders):

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=task_manager_db
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
NODE_ENV=development
```

Do NOT commit secrets to source control.

## Database Schema (example)

Run these SQL statements in your MySQL instance to create the required tables:

```sql
CREATE DATABASE IF NOT EXISTS task_manager_db;
USE task_manager_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  is_completed TINYINT(1) DEFAULT 0,
  userId INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

## API Reference

Base path: `/api`

Auth / User routes:

- `POST /api/registerUser` — Register a new user. Body: `{ username, email, password }`
- `POST /api/loginUser` — Login; returns `accessToken` and sets refresh token cookie. Body: `{ email, password }`
- `POST /api/refreshAccessToken` — Exchanges refresh cookie for a new access token.
- `POST /api/logoutUser` — (Protected) Logs out user, clears refresh token cookie.

Task routes (require auth — add `Authorization: Bearer <accessToken>` header):

- `POST /api/createTasks` — Create a task. Body: `{ title, description, is_completed }`
- `GET /api/getalltasks` — Get all tasks for the logged-in user.
- `GET /api/gettask/:id` — Get single task by id.
- `PUT /api/updatetask/:id` — Update fields for a task.
- `DELETE /api/deletetask/:id` — Delete a task.

Notes:

- The app uses access tokens (JWT) for authorization and a refresh token stored in an HttpOnly cookie for renewing access tokens.
- Send the access token in requests requiring auth in the `Authorization` header: `Authorization: Bearer <token>`.

## Security & Deployment Notes

- Use strong, randomly-generated values for `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`.
- In production, set `NODE_ENV=production` and enable HTTPS; ensure cookie `secure` is true.

## Contributing

Contributions are welcome — open issues or pull requests describing the change.

## License

This project is provided as-is. Add a license if you wish to make it explicit.
