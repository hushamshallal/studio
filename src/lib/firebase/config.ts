// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTzFfoGL9jGJvY3otqabYwC_t3NBKSsjA",
  authDomain: "salamsite-83faf.firebaseapp.com",
  projectId: "salamsite-83faf",
  storageBucket: "salamsite-83faf.appspot.com",
  messagingSenderId: "489023279027",
  appId: "1:489023279027:web:ea71974f6e920e4bcbc5c6"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
