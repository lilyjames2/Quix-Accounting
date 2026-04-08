import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, getDoc, getDocs, Timestamp, serverTimestamp } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDoc,
  getDocs,
  Timestamp,
  serverTimestamp
};
export type { User };
