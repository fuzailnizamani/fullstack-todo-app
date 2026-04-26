# TODO_APP_APIS

> **System Status:** Node.js/Express backend engineered for secure task persistence via MySQL. Implements a dual-token JWT strategy (Access/Refresh) to ensure session integrity and data security.

---

## 🛠 Technical Stack
* **Runtime:** Node.js (v18+)
* **Engine:** Express.js
* **Database:** MySQL (Relational)
* **Security:** `bcryptjs` (Hashing), `jsonwebtoken` (Authorization)

---

## 🚀 Mandatory Setup Sequence

### 1. Environment Lockdown
Create a `.gitignore` in the root directory immediately to prevent credential leaks.
```text
node_modules/
.env
.DS_Store

2. Database Injection
Execute these SQL commands in your MySQL terminal to establish the relational schema.

SQL
CREATE DATABASE IF NOT EXISTS task_manager_db;
USE task_manager_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_completed TINYINT(1) DEFAULT 0,
  userId INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (userId)
);
```
3. Server Deployment
Install Dependencies:

```Bash
cd server && npm install
```

Configure Environment:
Create a .env file in the /server directory:

```Code snippet
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=task_manager_db
ACCESS_TOKEN_SECRET=your_secret_key
REFRESH_TOKEN_SECRET=your_refresh_key
```
Execution:

```Bash
npm start
```

# 📡 API Interface (RESTful)
Base URL: /api

Authentication Authority

| Endpoint | Method  | Action   |
| -------- | ------- | -------- |
| /auth/register | POST | User Ingestion |
| /auth/login	| POST	| Credential Validation & Token Issuance |
| /auth/refresh |	POST |	Token Rotation |
| /auth/logout	| POST |	Session Termination | 

Task Management (Bearer Token Required)
| Endpoint | Method  | Action   |
| -------- | ------- | -------- |
| /tasks | GET | Inventory Retrieval |
| /tasks | POST | Task Injection |
| /tasks/:id | GET | Specific Entry Retrieval |
| /tasks/:id | PUT | State Modification |
| /tasks/:id | DELETE | Surgical Removal |

# 🔐 Security Enforcement
* **Data Integrity:** Passwords are salted and hashed via bcryptjs.
* **Session Control:** Access tokens are short-lived. Refresh tokens are stored in HttpOnly cookies to prevent XSS-based extraction.
* **Architecture:** Utilizes a MySQL connection pool to prevent server hanging under high-frequency requests.

## 📄 License
This project is licensed under the **MIT License**.
Copyright (c) 2026 **Fuzail Nizamani**
