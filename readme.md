
# 📅 Library Room Reservation API

A RESTful API system that allows users to reserve library rooms, manage bookings, and handle authentication with refresh/access token flow. The system includes features like conflict detection, role-based access (admin/employee/user), email notifications, and secure JWT-based authentication.

---

## 🚀 Features

- ✅ User registration and login (JWT with refresh token)
- ✅ View, update, delete user profile
- ✅ Room reservation with conflict checking
- ✅ View user's own reservations
- ✅ Get reservation details by ID
- ✅ Update and delete reservations
- ✅ Filter reservations by date or room (with pagination)
- ✅ Email notifications for reservation create/cancel
- ✅ Access & Refresh token system (secure JWT auth)
- ✅ Logout endpoint (removes refresh token)
- ✅ Zod-based validation for all requests
- ✅ Middleware for token auth & role-based access

---

## 🧱 Built With

- **Node.js + Express.js**
- **PostgreSQL + Knex.js**
- **JWT + Refresh Tokens**
- **Argon2** for password hashing
- **Nodemailer** for email delivery
- **Zod** for request validation
- **dotenv** for environment configs
- **Multer** (for future image uploads)
- **MVC folder structure**: Models, Controllers, Routes, Middleware

---

## 📂 Project Setup

### 1. Clone the repo

```bash
git clone https://github.com/esmanurgokkaya/randevusist-Api.git
cd reservation-Api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file and fill in:

```env
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=
PORT=
JWT_SECRET=supersecretkey
JWT_REFRESH_SECRET=anothersecret
JWT_EXPIRES_IN=15m
MAIL_USER=your@gmail.com
MAIL_PASS=yourapppassword


```

### 4. Setup the database

#### a) Create MySQL database:

```sql
CREATE DATABASE randevusist;
```

#### b) Run migrations:

```bash
npx knex migrate:latest
```

#### c) Insert seed data:

```bash
npx knex seed:run
```

### 5. Start the server

```bash
nodemon index.js  
```

---

## 🔐 Demo Test Users

| Username | Email               | Password | Role    |
|----------|---------------------|----------|---------|
| admin    | admin@example.com   | 123456   | admin   |
| esra     | esra@example.com    | 123456   | user    |

---

## 📌 Key API Endpoints

| Method | Endpoint                       | Açıklama / Description                                      |
|--------|--------------------------------|-------------------------------------------------------------|
| POST   | `/auth/register`               | ✅ Yeni kullanıcı kaydı — Register new user                 |
| POST   | `/auth/login`                  | ✅ Giriş yap (JWT + Refresh Token al) — Login with JWT      |
| POST   | `/auth/refresh-token`          | 🔄 Yeni access token al — Refresh access token              |
| POST   | `/auth/logout`                 | 🔓 Oturumu kapat (refresh token silinir) — Logout           |
| GET    | `/users/me`                    | 👤 Kullanıcı profili — Get authenticated user profile       |
| PUT    | `/users/me`                    | 👤 Profili güncelle — Update own profile                    |
| DELETE | `/users/me`                    | 👤 Profili sil — Delete own account                         |
| POST   | `/reservations`                | 📅 Yeni rezervasyon oluştur — Create a reservation          |
| GET    | `/reservations/me`             | 📋 Kendi rezervasyonlarını listele — List your reservations |
| GET    | `/reservations/:id`            | 🔍 Belirli rezervasyonu getir — Get reservation by ID       |
| PUT    | `/reservations/:id`            | 🛠️ Rezervasyonu güncelle — Update reservation               |
| DELETE | `/reservations/:id`            | ❌ Rezervasyonu sil — Delete reservation                    |
| GET    | `/reservations`                | 🔎 Rezervasyonları filtrele/paginasyon — Search reservations|

---

## 🔁 Auth Flow Diagram

```text
[Login] → accessToken + refreshToken
[Access token expired] → POST /auth/refresh → new accessToken
[Logout] → refreshToken removed from DB
```

> ⚠️ Access tokens expire in 15 minutes, refresh tokens in 7 days.

---

## 🧩 Upcoming Features (Roadmap)

### 🔔 In-App Notification System
- Notify users when added to room
- Notify on create/cancel updates
- Mark notifications as read

### 🔑 Role-based Admin Panel
- Roles: `admin`, `employee`, `user`
- Admin: can add/manage rooms
- Employee: approve/decline bookings

### 📊 Statistics Dashboard (for Admin)
- Most booked rooms
- Daily/weekly analytics charts

### 📷 Image Upload Management
- Upload user profile photo
- Upload room cover image

### 🔐 Advanced Token Security
- Refresh token stored securely in DB
- Revoke refresh tokens on logout
- Strict token lifetime checks

---

## 💬 Contribution

PRs, issues, and suggestions are welcome. This is an open-source project.

---

## 👤 Developer

**Esma**    
🔗 GitHub: [github.com/esmanurgokkaya](https://github.com/esmanurgokkaya)
