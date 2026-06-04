import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA8Hpxi4rrDvxEiT-TOEcL9CiSG0oKnQKc",
  authDomain: "gcp-quiz-bdfb7.firebaseapp.com",
  projectId: "gcp-quiz-bdfb7",
  storageBucket: "gcp-quiz-bdfb7.firebasestorage.app",
  messagingSenderId: "32158765717",
  appId: "1:32158765717:web:4e4b2be286a067e0f9c19c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
