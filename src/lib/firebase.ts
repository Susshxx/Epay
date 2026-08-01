import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
// const firebaseConfig = {
//   apiKey: "AIzaSyBqY7ldPjNAl8uVWkwqrtg-oyp8h-WC8Z4",
//   authDomain: "sayyes-121.firebaseapp.com",
//   projectId: "sayyes-121",
//   storageBucket: "sayyes-121.firebasestorage.app",
//   messagingSenderId: "743481099334",
//   appId: "1:743481099334:web:84bd092dd62e7bb6db3647",
//   measurementId: "G-4XG0WY2ERK"
// };

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey);

let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    // Initialize once — calling initializeApp() a second time with the same
    // config throws "Firebase App named '[DEFAULT]' already exists".
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.warn('Firebase failed to initialize; falling back to local demo mode.', error);
    db = null;
  }
}

export { db };