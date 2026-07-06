import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD1rxvncWoRVUZ-HyR7KFADqDiwxPMsLn8",
  authDomain: "pawscura-dbd13.firebaseapp.com",
  projectId: "pawscura-dbd13",
  storageBucket: "pawscura-dbd13.firebasestorage.app",
  messagingSenderId: "528980114902",
  appId: "1:528980114902:web:d43ae7115220f005c5b877",
  measurementId: "G-L85D17LS3C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
