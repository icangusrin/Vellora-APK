import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCw1spdwAbwR8BV7DV-jBJn4EAUTAavUV0",
  authDomain: "marketplace-498021.firebaseapp.com",
  projectId: "marketplace-498021",
  storageBucket: "marketplace-498021.firebasestorage.app",
  messagingSenderId: "803661480295",
  appId: "1:803661480295:android:7703353acf651f7be8afc2"
};

export const firebaseApp = initializeApp(firebaseConfig);