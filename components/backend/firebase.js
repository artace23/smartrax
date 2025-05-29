import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword  } from "firebase/auth";
import {  getFirestore, collection, addDoc, query, where, getDocs, updateDoc, serverTimestamp, doc, onSnapshot  } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyKj8mP4nX9vR5tL3wQ6pN2xYhM9kL7nF3q",
  authDomain: "smartrax-c9d6c.firebaseapp.com",
  databaseURL: "https://smartrax-c9d6c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smartrax-c9d6c",
  storageBucket: "smartrax-c9d6c.appspot.com",
  messagingSenderId: "554950320740",
  appId: "1:554950320740:web:ada19f7016995010697571",
  measurementId: "G-7JTGP7RYGR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db =  getFirestore(app);

export { auth, db, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, signInWithEmailAndPassword, doc, onSnapshot };