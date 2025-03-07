
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://your-firebase-app.firebaseio.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.FIREBASE_APP_ID || ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export const storage = {
  // Example database operations
  async insertUser(user: any) {
    try {
      await set(ref(database, `users/${user.id}`), user);
      return true;
    } catch (error) {
      console.error("Error inserting user:", error);
      return false;
    }
  },

  async getUserByUsername(username: string) {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `users`));
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        return Object.values(users).find((user: any) => user.username === username);
      }
      
      return null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }
};
