import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

window.firebaseAuth = auth;
window.firebaseDb = db;

window.fbCreateUser = createUserWithEmailAndPassword;
window.fbSignIn = signInWithEmailAndPassword;
window.fbSignInAnon = signInAnonymously;
window.fbSignOut = signOut;
window.fbUpdateProfile = updateProfile;

window.fbCollection = collection;
window.fbDoc = doc;
window.fbSetDoc = setDoc;
window.fbGetDoc = getDoc;
window.fbGetDocs = getDocs;
window.fbDeleteDoc = deleteDoc;
window.fbUpdateDoc = updateDoc;
window.fbWriteBatch = writeBatch;

window.firebaseReady = true;
window.dispatchEvent(new Event("firebaseReady"));
