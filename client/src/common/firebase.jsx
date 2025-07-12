
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { signInWithPopup } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyAKa8TURUgtIm4jnpDIK3eLwvXCUiMSaLI",
    authDomain: "campusprep-27051.firebaseapp.com",
    projectId: "campusprep-27051",
    storageBucket: "campusprep-27051.firebasestorage.app",
    messagingSenderId: "447214739617",
    appId: "1:447214739617:web:807cd028f82896059390e0",
    measurementId: "G-LNNFSLJM5R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

//google auth

const provider = new GoogleAuthProvider()

const auth = getAuth();
export const authWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const signedInUser = result.user;
        const idToken = await signedInUser.getIdToken();  // <-- This is the token your backend needs

        return {
            idToken,
            user: signedInUser  // optional if you want to use it
        };
    } catch (err) {
        console.error("Google Auth Error:", err);
        throw err;  // so that calling function can handle errors properly
    }
};
