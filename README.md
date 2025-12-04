# HR Portal Full Stack Setup

This project converts the static HR portal into a full-stack web app with authentication, employee CRUD, and attendance tracking.

## Prerequisites
- Node.js 18+
- MongoDB running locally or in the cloud

## Setup
1. Copy `.env.example` to `.env` and fill in values:
   - `MONGO_URI` connection string
   - `JWT_SECRET`, `SESSION_SECRET`
   - OAuth credentials for Google and Microsoft with callback URLs:
     - Google: `<SERVER_BASE_URL>/api/auth/google/callback`
     - Microsoft: `<SERVER_BASE_URL>/api/auth/microsoft/callback`
   - `CLIENT_ORIGIN` should match where `hrtesting4.html` is served (e.g., `http://localhost:3000`).

2. Install dependencies:
   ```bash
   npm install express mongoose cors passport passport-local passport-google-oauth20 passport-microsoft bcrypt jsonwebtoken express-session connect-mongo dotenv
   ```

3. Seed demo data (optional):
   ```bash
   node server/seed.js
   ```

4. Run the API server:
   ```bash
   node server/index.js
   ```
   The API will be available at `http://localhost:4000` by default.

5. Serve the frontend (for local testing):
   ```bash
   npx http-server . -p 3000
   ```
   Then open `http://localhost:3000/index.html` in your browser. The frontend expects the API to be reachable at `http://localhost:4000`; if the backend is not running, login and other requests will fail with `Failed to fetch` or `ERR_CONNECTION_REFUSED` errors.

## Frontend notes
- The frontend keeps the existing `hrtesting4.html` styling but now calls the API using `fetch`.
- Tokens returned from `/api/auth/login` or OAuth callbacks should be stored in `localStorage` as `token`.
- All protected requests include `Authorization: Bearer <token>`.

## Auth endpoints
- `POST /api/auth/signup` — `{ email, password, name }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/auth/google` — OAuth redirect
- `GET /api/auth/microsoft` — OAuth redirect

## Employee endpoints
- `GET /api/employees` — list
- `POST /api/employees` — create
- `PUT /api/employees/:id` — update
- `DELETE /api/employees/:id` — delete

## Attendance endpoints
- `GET /api/attendance?date=YYYY-MM-DD`
- `POST /api/attendance/clock-in` — `{ employeeId }`
- `POST /api/attendance/clock-out` — `{ employeeId }`
- `POST /api/attendance` — create arbitrary record

## Development tips
- Use HTTPS in production and rotate JWT secrets regularly.
- Validate user input on both client and server.
- Rate limit authentication endpoints in production deployments.
- If you hit `Cannot read properties of null (reading 'addEventListener')`, ensure you are loading the bundled `index.html` (not a partial copy) so all expected DOM elements exist when scripts initialize.
