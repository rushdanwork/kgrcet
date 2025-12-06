# HR Portal (Firebase Auth)

## Prerequisites
- Node.js 18+
- MongoDB instance (local or remote)
- Firebase project with Email/Password, Google, and Microsoft providers enabled
- Service account JSON for Firebase Admin (download from Firebase console)

## Setup
1. Copy `.env.example` to `.env` and populate values:
   - `MONGO_URI` for your MongoDB connection
   - `PORT` for the API server (default 4000)
   - `CLIENT_ORIGIN` allowed by CORS
   - Firebase service account via either `FIREBASE_SERVICE_ACCOUNT` (JSON string) or `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.
2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```
3. Seed sample employees (optional):
   ```bash
   npm run seed
   ```
4. Start the API:
   ```bash
   npm start
   ```

## Firebase Client Configuration
The frontend initializes Firebase using the following configuration (update to match your project):
```js
const firebaseConfig = {
  apiKey: "AIzaSyDLNTcJIs5MzTwbF1r-81fmEHh_xpP4-cc",
  authDomain: "kgrcethr.firebaseapp.com",
  projectId: "kgrcethr",
  storageBucket: "kgrcethr.firebasestorage.app",
  messagingSenderId: "106366662532",
  appId: "1:106366662532:web:ea5517e944b359801d0fd1",
  measurementId: "G-5DQH9LLZTQ"
};
```

Enable Google and Microsoft providers in Firebase Authentication. The frontend uses popup flows and sends the Firebase ID token to `/api/auth/firebase-login` to create or sync a local user document.

## API Routes
- `POST /api/auth/firebase-login` — verify an ID token and create/sync a user document
- `GET /api/auth/me` — return the current user based on the `Authorization: Bearer <idToken>` header
- Employee CRUD under `/api/employees` (protected)
- Attendance endpoints under `/api/attendance` (protected)

## Development Notes
- Tokens are Firebase ID tokens stored in `localStorage` by the frontend.
- Protected routes require the `Authorization` header.
- Attendance and employee data persist in MongoDB.
