import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// For debugging only - remove sensitive data
const debugConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

console.log("Firebase config:", {
  ...debugConfig,
  hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and export
export const database = getDatabase(app);