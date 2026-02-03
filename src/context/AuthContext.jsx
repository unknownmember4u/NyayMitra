import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = authService.subscribe(async (user) => {
            try {
                if (user) {
                    // Fetch role and data
                    let userData = null;
                    let role = null;

                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        userData = userDoc.data();
                        role = "user";
                    } else {
                        const lawyerDoc = await getDoc(doc(db, "lawyers", user.uid));
                        if (lawyerDoc.exists()) {
                            userData = lawyerDoc.data();
                            role = "lawyer";
                        }
                    }

                    setCurrentUser({ ...user, role, ...userData });
                } else {
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setCurrentUser(user ? { ...user, role: 'unknown' } : null);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
