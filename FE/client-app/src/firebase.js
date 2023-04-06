// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";
import { collection, addDoc, serverTimestamp } from "firebase/firestore/lite";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore/lite";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABjwoMfARnkRQfNlKzTajbYzrtAA31nFI",
  authDomain: "hau-docs-auth.firebaseapp.com",
  projectId: "hau-docs-auth",
  storageBucket: "hau-docs-auth.appspot.com",
  messagingSenderId: "637327069553",
  appId: "1:637327069553:web:a8fdc9cfe5826b3885a6d0",
  measurementId: "G-VTTRY7Z5DE",
  databaseURL:
    "https://hau-docs-auth-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);

export const registerWithEmailAndPassword = async (
  name,
  lastname,
  email,
  password,
  role
) => {
  try {
    const res = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
      name,
      lastname
    );
    const user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      createdAt: serverTimestamp(),
      name,
      lastname,
      authProvider: "local",
      email,
      role: role || "applicant",
      uid: user.uid,
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};
