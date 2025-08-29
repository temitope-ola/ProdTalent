// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDiUUZ8T_gTAp7LdqPNnuFl9U7Gl7Ecfik",
    authDomain: "talents-tech-senegal.firebaseapp.com",
    projectId: "talents-tech-senegal",
    storageBucket: "talents-tech-senegal.firebasestorage.app",
    messagingSenderId: "759306069327",
    appId: "1:759306069327:web:f711a2b907537e9dead13a",
    measurementId: "G-0KNNCCGGEJ"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
