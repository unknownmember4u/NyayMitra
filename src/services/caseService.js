import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    doc,
    serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { detectUrgency } from "../utils/aiLogic";

export const caseService = {
    // Create a new case
    createCase: async (userId, category, description, customUrgency = null) => {
        try {
            const urgency = customUrgency || detectUrgency(description);
            const caseData = {
                userId,
                category,
                description,
                urgency,
                lawyer: null,
                status: "open",
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, "cases"), caseData);
            return { id: docRef.id, ...caseData };
        } catch (error) {
            throw error;
        }
    },

    // Get cases for a user
    getUserCases: async (userId) => {
        try {
            const q = query(collection(db, "cases"), where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw error;
        }
    },

    // Get cases for a lawyer
    getLawyerCases: async (lawyerId) => {
        try {
            const q = query(collection(db, "cases"), where("lawyer", "==", lawyerId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw error;
        }
    },

    // Assign a lawyer to a case
    assignLawyer: async (caseId, lawyerId) => {
        try {
            const caseRef = doc(db, "cases", caseId);
            await updateDoc(caseRef, {
                lawyer: lawyerId,
                status: "open"
            });
        } catch (error) {
            throw error;
        }
    }
};
