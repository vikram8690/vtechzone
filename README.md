# ⚡ vTechZone – Full Stack Website

> Domain: **vtechzone.in** | Stack: HTML/CSS/JS · Node.js · SQL Server · JWT Auth

---

## 📁 Project Structure

```
vtechzone/
├── public/                 ← Frontend (static files)
│   ├── index.html          ← Home page
│   ├── services.html       ← Services page
│   ├── projects.html       ← Projects portfolio
│   ├── contact.html        ← Contact form
│   ├── login.html          ← Login page
│   ├── signup.html         ← Registration page
│   ├── dashboard.html      ← User dashboard
│   ├── admin.html          ← Admin panel
│   ├── css/style.css       ← Main stylesheet
│   └── js/api.js           ← Shared API helpers
│
├── backend/
│   ├── server.js           ← Express entry point
│   ├── db.js               ← SQL Server connection
│   ├── .env.example        ← Environment template
│   ├── middleware/
│   │   └── auth.js         ← JWT verify + admin guard
│   └── routes/
│       ├── auth.js         ← POST /api/auth/signup, /login, GET /me
│       ├── contact.js      ← POST /api/contact, GET/DELETE messages
│       ├── services.js     ← CRUD /api/services
│       ├── projects.js     ← CRUD /api/projects
│       └── users.js        ← GET/PUT/DELETE /api/users
│
├── database_setup.sql      ← Run this first in SQL Server
└── README.md
```

---

## 🚀 Setup Instructions

### Step 1 – Database

1. Open **SQL Server Management Studio (SSMS)**
2. Connect to your SQL Server instance
3. Open `database_setup.sql` and run it (**F5**)
4. This creates:
   - Database: `vtechzone`
   - Tables: `users`, `messages`, `services`, `projects`
   - Default admin account + sample data

### Step 2 – Backend

```bash
cd backend
cp .env.example .env          # Copy env template
# Edit .env with your SQL Server credentials
npm install                   # Install dependencies
npm start                     # Starts on http://localhost:5000
# OR for development with auto-reload:
npm run dev
```

### Step 3 – Frontend

Option A – Serve via Node (already set up):
The backend serves the `public/` folder automatically.
Open: **http://localhost:5000**

Option B – Open directly:
Open `public/index.html` in your browser.
*(Note: API calls require the backend running)*

---

## 🔐 Default Login Credentials

| Role  | Email                  | Password    |
|-------|------------------------|-------------|
| Admin | admin@vtechzone.in     | Admin@123   |
| User  | Register via signup page | Your choice |

---

## 🌐 API Endpoints

| Method | Endpoint                        | Auth     | Description            |
|--------|---------------------------------|----------|------------------------|
| POST   | /api/auth/signup                | —        | Register new user      |
| POST   | /api/auth/login                 | —        | Login, returns JWT     |
| GET    | /api/auth/me                    | User     | Get current user       |
| POST   | /api/contact                    | —        | Submit contact form    |
| GET    | /api/contact/messages           | Admin    | All messages           |
| GET    | /api/contact/messages/user      | User     | Own messages           |
| DELETE | /api/contact/messages/:id       | Admin    | Delete message         |
| GET    | /api/services                   | —        | List services          |
| POST   | /api/services                   | Admin    | Add service            |
| PUT    | /api/services/:id               | Admin    | Update service         |
| DELETE | /api/services/:id               | Admin    | Delete service         |
| GET    | /api/projects                   | —        | List projects          |
| POST   | /api/projects                   | Admin    | Add project            |
| PUT    | /api/projects/:id               | Admin    | Update project         |
| DELETE | /api/projects/:id               | Admin    | Delete project         |
| GET    | /api/users                      | Admin    | List users             |
| PUT    | /api/users/:id/role             | Admin    | Change user role       |
| DELETE | /api/users/:id                  | Admin    | Delete user            |

---

## ⚙️ .env Configuration

```env
DB_SERVER=localhost
DB_DATABASE=vtechzone
DB_USER=sa
DB_PASSWORD=YourPassword123
DB_PORT=1433
JWT_SECRET=vtechzone_super_secret_jwt_key_2024
PORT=5000
```

---

## 🎨 Pages Summary

| Page           | URL                | Description                              |
|----------------|--------------------|------------------------------------------|
| Home           | /index.html        | Hero, services overview, testimonials    |
| Services       | /services.html     | Detailed service listings                |
| Projects       | /projects.html     | Portfolio (loads from DB)                |
| Contact        | /contact.html      | Form → saves to messages table           |
| Login          | /login.html        | JWT auth, role-based redirect            |
| Sign Up        | /signup.html       | Register + hashed password               |
| Dashboard      | /dashboard.html    | User: messages, profile                  |
| Admin Panel    | /admin.html        | Full CRUD: messages, services, projects, users |

---

## 🛡️ Security Features

- Passwords hashed with **bcryptjs** (12 salt rounds)
- **JWT** tokens (24h expiry) for session management
- **Admin-only routes** protected by middleware
- Input validation via **express-validator**
- SQL injection prevented by **parameterised queries** (mssql)
- CORS configured for local development

---

## 📦 Dependencies

| Package            | Purpose                    |
|--------------------|----------------------------|
| express            | Web framework              |
| mssql              | SQL Server driver          |
| bcryptjs           | Password hashing           |
| jsonwebtoken       | JWT auth tokens            |
| cors               | Cross-origin requests      |
| dotenv             | Environment variables      |
| express-validator  | Request validation         |
| nodemon (dev)      | Auto-restart on file change|

---

## 🐛 Troubleshooting

**"Cannot connect to SQL Server"**
→ Check DB_SERVER, DB_USER, DB_PASSWORD in `.env`
→ Ensure SQL Server is running and TCP/IP is enabled

**"CORS error" in browser**
→ Make sure backend is running on port 5000
→ Check the `origin` list in server.js

**Admin page redirects to login**
→ Login with admin@vtechzone.in / Admin@123
→ If password hash mismatch, re-run `database_setup.sql`

---

*© 2024 vTechZone – vtechzone.in*
