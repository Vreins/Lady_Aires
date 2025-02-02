// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnYk03r98NwHBtuRXmPqrNwZJU8gNBfZI",
  authDomain: "vreins-42453.firebaseapp.com",
  projectId: "vreins-42453",
  storageBucket: "vreins-42453.firebasestorage.app",
  messagingSenderId: "566783472525",
  appId: "1:566783472525:web:74d97adea3b3a9263b83c4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth, createUserWithEmailAndPassword, sendEmailVerification };