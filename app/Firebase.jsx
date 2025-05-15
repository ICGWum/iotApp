// Firebase.jsx

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import Firebase Authentication
import { getFirestore, deleteDoc, doc } from "firebase/firestore"; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyBcXSf-sWWV5apE4p4nTX8Kk-1P6GHkDH8",
  authDomain: "iotapp-18a62.firebaseapp.com",
  projectId: "iotapp-18a62",
  storageBucket: "iotapp-18a62.firebasestorage.app",
  messagingSenderId: "233179299412",
  appId: "1:233179299412:web:cb9522f9459689bddb37c1",
  measurementId: "G-3627MBT7G9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Simple function to delete a document
const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting document:`, error);
    return { success: false, error };
  }
};

export { auth, db, deleteDocument };
export default app;
