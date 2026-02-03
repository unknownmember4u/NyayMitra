import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export const authService = {
    // Login
    login: async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Determine role by checking both collections
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) return { ...user, role: "user", data: userDoc.data() };

            const lawyerDoc = await getDoc(doc(db, "lawyers", user.uid));
            if (lawyerDoc.exists()) return { ...user, role: "lawyer", data: lawyerDoc.data() };

            throw new Error("User role not found in database");
        } catch (error) {
            throw error;
        }
    },

    // Register User
    registerUser: async (email, password, userData) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const fullUserData = {
                user_id: user.uid,
                ...userData,
                isVerified: true,
                aadhaar: {
                    verified: true,
                    verifiedAt: serverTimestamp()
                },
                createdAt: serverTimestamp()
            };

            await setDoc(doc(db, "users", user.uid), fullUserData);
            return { ...user, role: "user", data: fullUserData };
        } catch (error) {
            throw error;
        }
    },

    // Register Lawyer
    registerLawyer: async (email, password, lawyerData) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const fullLawyerData = {
                lawyer_id: user.uid,
                ...lawyerData,
                isVerified: true,
                createdAt: serverTimestamp()
            };

            await setDoc(doc(db, "lawyers", user.uid), fullLawyerData);
            return { ...user, role: "lawyer", data: fullLawyerData };
        } catch (error) {
            throw error;
        }
    },

    // Logout
    logout: () => signOut(auth),

    // Subscription for auth state
    subscribe: (callback) => onAuthStateChanged(auth, callback)
};
