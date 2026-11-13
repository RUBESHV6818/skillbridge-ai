# SkillBridge AI

SkillBridge AI is a campus placement preparation platform with student, mentor, coordinator, and administrator workflows. The active application is split across a Vite/React frontend and an Express/MongoDB API.

## Project folders

- `skillbridge-frontend/` — start the active web app here. Its entry point reuses the feature screens in `skillbridge-ai/src/`.
- `skillbridge-ai/src/` — shared React screens, routes, and UI source imported by the active frontend.
- `skillbridge-backend/` — active API, authentication, resume processing, AI integrations, and email delivery.
- `skillbridge-ai/server/` — an older, separate authentication prototype. It is not the backend used by the current frontend.

Run the frontend and backend in separate terminals. Do not start the older prototype server for the main application.

## Requirements

- Node.js 20 or newer and npm
- MongoDB running locally, or a MongoDB connection string
- A Groq or Gemini API key for AI features
- SMTP settings only if you want verification and password-reset emails delivered to real inboxes

## Local setup

### 1. Configure the backend

In PowerShell, from the repository root:

```powershell
Copy-Item skillbridge-backend/.env.example skillbridge-backend/.env
```

Edit `skillbridge-backend/.env` and set a private JWT secret of at least 32 characters, your MongoDB URI, and an AI provider key. Keep `.env` private; it is ignored by Git.

For Groq, set `AI_PROVIDER=groq` and `GROQ_API_KEY`. To use Gemini instead, set `AI_PROVIDER=gemini` and `GEMINI_API_KEY`.

To send real email, set `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, and `EMAIL_FROM`. For local development, `EMAIL_DEV_MODE=console` logs verification links in the backend terminal. `APP_BASE_URL` should match the frontend address used in the browser.

Install and start the API:

```powershell
Set-Location skillbridge-backend
npm install
npm run dev
```

The API listens on port `5001` by default when configured through the example environment file. It requires `JWT_SECRET` and, in production, an explicit `CORS_ORIGINS` list.

### 2. Start the frontend

Open a second terminal at the repository root:

```powershell
Set-Location skillbridge-frontend
npm install
npm run dev
```

Open the Vite address printed in the terminal, normally `http://localhost:5173`.
For a custom local backend address, copy `skillbridge-frontend/.env.example` to `skillbridge-frontend/.env` and set `VITE_API_URL` to the backend origin (or its `/api` URL).

## Main features

- Resume upload, text extraction, and AI resume review
- Role-specific skill-gap analysis and learning roadmaps
- Job-description matching with resume evidence
- Voice mock interviews, aptitude questions, and coding challenges
- Placement application tracking and career readiness reporting
- Mentor review and coordinator/admin workflows
- Email verification, password reset, and roadmap reminders

AI scores and feedback are practice guidance. They are not hiring decisions or proof of skill proficiency. Resume text and interview answers are sent to the configured AI provider for requested analysis.

## Local security and deployment notes

- Uploaded resumes are private and must be accessed through authenticated API routes.
- `CORS_ORIGINS` is a comma-separated list of exact frontend origins. Include the frontend's origin and port; for mobile testing over Wi-Fi, configure the computer's LAN address and use the matching frontend/API URLs.
- Use HTTPS, a hosted database with access controls, private server-side AI/SMTP credentials, and a production frontend origin before deployment.
- Production backend startup requires `MONGODB_URI`, `RESUME_STORAGE_DIR` on persistent private storage, HTTPS `APP_BASE_URL`, a configured AI provider, SMTP, and `PISTON_API_URL`. Configure `CORS_ORIGINS` with exact HTTPS frontend origins. Production frontend builds require `VITE_API_URL`; set it to the deployed API origin or its `/api` URL in the frontend host's build environment.
- Coding interview sample execution uses the configured Piston-compatible code runner; review its availability and limits before relying on it in production.
- Text extraction supports text-based PDF and DOCX files. OCR for scanned PDFs is not currently included.

## Build checks

GitHub Actions runs backend unit checks, checks backend JavaScript syntax, and builds the frontend on pushes and pull requests to `main`. Review the **Build check** result before merging or pushing a release. The automated checks do not connect to MongoDB or call the configured AI provider, so they do not replace a manual end-to-end walkthrough with local services configured.

The backend provides `GET /health/live` for process liveness and `GET /health/ready` for database readiness. Configure the host's readiness probe to use `/health/ready` so traffic is sent only after MongoDB is connected.

After starting both local services, run `npm run smoke` from `skillbridge-backend` to verify the frontend, backend, database readiness, and allowed/untrusted CORS origins. For a deployed environment, set `SMOKE_API_URL` and `SMOKE_WEB_ORIGIN` to the public API and frontend addresses before running the same command.

## Troubleshooting

- If port `5001` is already occupied, stop the other backend process or set another `PORT` and update the frontend API/proxy configuration to match.
- If login fails after changing `JWT_SECRET`, sign in again; existing session tokens were signed with the previous secret.
- If the browser blocks API requests, confirm the frontend origin is listed in backend `CORS_ORIGINS` and that the API URL points to the running backend.
- If verification links do not open, keep the frontend running and ensure `APP_BASE_URL` matches the address opened on that device.
