# SkillBridge AI — Companion Backend Server

Production-grade Node.js/Express API service connected to MongoDB with JWT authentication and Google Gemini AI integration.

---

## Tech Stack & Architecture

- **Runtime & Framework**: Node.js (ES Modules) + Express.js
- **Database & ODM**: MongoDB (Local or Atlas) + Mongoose ODM
- **Authentication**: JWT (`jsonwebtoken`) + Password Hashing (`bcryptjs`)
- **Document Processing**: Multer + `pdf-parse` (5MB limit, PDF/DOCX)
- **AI Engine**: Google Gemini AI (`@google/generative-ai`)
- **Security & Utilities**: Helmet, CORS, Express-Rate-Limit, Dotenv

---

## Directory Structure

```
server/
├── .env                  # Live environment variables (not committed)
├── .env.example          # Template environment file
├── README.md             # Server documentation
├── package.json          # Node dependencies and scripts
└── src/
    ├── config/
    │   └── db.js         # Mongoose connection with error handling
    ├── controllers/
    │   └── authController.js # Auth operations (register, login, me)
    ├── middleware/
    │   ├── auth.js       # JWT extraction & role-based access guards
    │   └── error.js      # Centralized error handler
    ├── models/
    │   └── User.js       # Mongoose user schema & password methods
    ├── routes/
    │   └── authRoutes.js # Express router for authentication
    ├── scripts/
    │   └── seed.js       # Seed script for demo student, coordinator, mentor, admin
    └── server.js         # Express app initialization & server entry point
```

---

## Quick Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default variables:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/skillbridge_ai
JWT_SECRET=skillbridge_super_secure_jwt_secret_key_2025
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_google_gemini_api_key_here
CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
NODE_ENV=development
```

### 3. Seed Demo Personas
Populate the database with pre-configured placement personas:
```bash
npm run seed
```

**Seeded Accounts (Password for all: `PlacementReady#2025`):**
1. **Student**: `aarthi.raman@cit.edu.in` (Final-year B.Tech CSE, CIT Chennai)
2. **Placement Coordinator**: `placement.cell@cit.edu.in` (Prof. K. Soundararajan)
3. **Career Mentor**: `priya.sundaram@alumni.cit.edu.in` (Priya Sundaram, Staff SDE at Freshworks)
4. **Platform Admin**: `admin@skillbridge.edu.in` (Rajeshwaran S)

### 4. Run the Server
```bash
npm start      # Standard node run
npm run dev    # Watch mode with auto-reload
```

---

## Phase 1 API Endpoints

### Health Check
- `GET /api/health`
  - Returns service status and uptime.

### Authentication (`/api/auth`)
- `POST /api/auth/register`
  - Body: `{ name, email, password, role, department, college, batchYear, targetRole }`
  - Returns: `{ token, user }`
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Returns: `{ token, user }`
- `GET /api/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ user }`
- `POST /api/auth/forgot-password`
  - Body: `{ email }`
  - Returns: `{ message }`
