import { createContext, useContext, useEffect, useState, userRef } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebase';

const UserContext = createContext();
export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState({});

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
  };

  useEffect(()=> {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    });
    return () => {
      unsubscribe();
    }
  }, []);

  const createUser = (email, password, passwordconfirm) => {
    return createUserWithEmailAndPassword(auth, email, password, passwordconfirm);
  };

   const signIn = (email, password) =>  {
    return signInWithEmailAndPassword(auth, email, password)
   }

  const logout = () => {
      return signOut(auth)
  }
  const forgotPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(currentUser);
      setUser(currentUser);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ forgotPassword, createUser, user, logout, signIn, googleSignIn }}>
      {children}
    </UserContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(UserContext);
};