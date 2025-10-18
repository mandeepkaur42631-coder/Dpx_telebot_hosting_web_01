// client/src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// IMPORTANT: Neeche diye gaye config ko apne Firebase project ki keys se badal dein.
const firebaseConfig = {
  apiKey: "AIzaSyA4WIEjLVt8B57-yqSu5_o1S0FulghJx6A", // Aapka API Key
  authDomain: "h4xh-telebot-hosting.firebaseapp.com",
  projectId: "h4xh-telebot-hosting",
  storageBucket: "h4xh-telebot-hosting.appspot.com",
  messagingSenderId: "307619368347",
  appId: "1:307619368347:web:1ed06f160348c64f61e53e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
