import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyC2KhQflSTgUvyG3AzWZc93dk_PTXyaSYo",
    authDomain: "nyaymitra-2.firebaseapp.com",
    projectId: "nyaymitra-2",
    storageBucket: "nyaymitra-2.firebasestorage.app",
    messagingSenderId: "650393846101",
    appId: "1:650393846101:web:ae0b69f4bd7d38b0e56fdc"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
