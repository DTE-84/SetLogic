import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDKJSSHuB18-CiOgtuuEqiPe_OAd7Uc6gs",
  authDomain: "setlogic-b9898.firebaseapp.com",
  projectId: "setlogic-b9898",
  storageBucket: "setlogic-b9898.firebasestorage.app",
  messagingSenderId: "541939727495",
  appId: "1:541939727495:web:31696649e28ef344430c22",
  measurementId: "G-9QBFTXY62G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
