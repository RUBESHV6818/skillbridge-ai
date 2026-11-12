# SkillBridge backend: AI resume analysis

The Skill Gap Analyzer uses the Google Gemini API to compare the full extracted resume text with the student's saved target role. Results include role-specific skill categories, evidence quotes checked against the extracted text, and suggested next steps. Analysis is cached by resume text and target role; use **Reanalyze with AI** to request a fresh result.

## Configure Gemini

1. Create an API key in [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Add these variables to `skillbridge-backend/.env`:

   ```env
   GEMINI_API_KEY=your_real_key
   GEMINI_MODEL=gemini-3.8-flash
   ```

3. Restart the backend. The analyzer returns a clear configuration error until a valid key is present; it does not fall back to the old fixed skills score.

Resume text is sent to Google Gemini when a new analysis is requested. Keep the API key in the backend environment file; never put it in frontend code or commit it.

## Email delivery

SkillBridge sends account-verification and password-reset messages through SMTP using Nodemailer. Add the following to `skillbridge-backend/.env` (keep this private):

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_REQUIRE_TLS=true
EMAIL_USER=your-sender@gmail.com
EMAIL_PASS=your-provider-app-password
EMAIL_FROM="SkillBridge AI <your-sender@gmail.com>"
APP_BASE_URL=http://localhost:5173
EMAIL_DEV_MODE=console
```

Use SMTP credentials from your mail provider. For Gmail, use an App Password with an account that has two-step verification enabled; remove its display spaces and do not put your normal account password here. `EMAIL_FROM` must be an address your provider permits you to send from. Set `APP_BASE_URL` to the web address users can open; production must use HTTPS.

Restart the backend after changing `.env`. At startup it verifies the SMTP connection, and an administrator can see its state under **Admin → Platform Settings**. In non-production only, leaving all SMTP credentials blank uses console delivery and prints the one-time link in the backend terminal. Production never falls back to console links. Verification links expire after 24 hours; password-reset links expire after one hour and are single-use.

## Weekly roadmap reminders

Students can opt in under **Profile → Notification Preferences**. The backend checks each Monday at 9:00 AM in `ROADMAP_REMINDER_TIMEZONE` (defaults to `Asia/Kolkata`) and emails verified, active students who opted in and still have unfinished roadmap tasks. A student receives at most one reminder per week. The message includes completion progress and up to three next tasks. Set `ROADMAP_REMINDER_TIMEZONE` to an IANA time-zone name to change the schedule. SMTP must be configured for inbox delivery; local console mode prints the message to the backend terminal.
