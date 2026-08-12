// ─────────────────────────────────────────────────────────────────────────
// Firebase initialisation
//
// This file runs once and creates the single Firebase app instance the whole
// project shares. Every component that needs the database imports `db` from
// here rather than calling initializeApp() again.
// ─────────────────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Config values are read from the .env file rather than hard-coded, so the
// API keys never get committed to the repository. Vite only exposes variables
// that start with VITE_, and it reads them at startup — restart the dev server
// after editing .env. See .env.example for the required variable names.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// db  — the Firestore database handle used by every read/write in the app
// auth — initialised for future use; this build has no login system
export const db = getFirestore(app);
export const auth = getAuth(app);
