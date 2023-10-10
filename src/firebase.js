import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLlInOys8fPvn9K5nMFblGTQkNta2W5FU",
  authDomain: "sandbox-d641a.firebaseapp.com",
  projectId: "sandbox-d641a",
  storageBucket: "sandbox-d641a.appspot.com",
  messagingSenderId: "166589839237",
  appId: "1:166589839237:web:d2170443b44aa1e569f6ec"
};

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  export const storage = getStorage(app);
  export const db = getFirestore(app);

