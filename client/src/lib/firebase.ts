import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Debug logging for environment variables
console.log("Environment Variables Check:");
console.log({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "MISSING",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "MISSING",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "MISSING",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "MISSING",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "MISSING",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "MISSING",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "MISSING",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "MISSING"
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.databaseURL) {
  console.error("Missing required Firebase configuration:", {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    hasDatabaseURL: !!firebaseConfig.databaseURL
  });
  throw new Error(
    'Missing required Firebase configuration. Please check your .env file and ensure all required Firebase configuration values are set.'
  );
}

let database;

// Initialize Firebase
try {
  const app = initializeApp(firebaseConfig);
  
  // Initialize Realtime Database
  database = getDatabase(app);
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Export the initialized database
export { database };