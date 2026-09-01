// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "cortexai-676f1.firebaseapp.com",
    projectId: "cortexai-676f1",
    storageBucket: "cortexai-676f1.firebasestorage.app",
    messagingSenderId: "926009169826",
    appId: "1:926009169826:web:fbc522b4b48544e3dc04fb"
};

// Initialize Firebase
console.log(import.meta.env.VITE_FIREBASE_API_KEY);
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()


