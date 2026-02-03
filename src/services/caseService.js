import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    doc,
    getDoc,
    serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { detectUrgency } from "../utils/aiLogic";

export const caseService = {
    // Get case by ID
    getCaseById: async (caseId) => {
        try {
            const docRef = doc(db, "cases", caseId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            throw error;
        }
    },

    // Update case progress
    updateCaseProgress: async (caseId, currentStageIndex) => {
        try {
            const caseRef = doc(db, "cases", caseId);
            await updateDoc(caseRef, { currentStageIndex });
        } catch (error) {
            throw error;
        }
    },

    // Create a new case
    createCase: async (userId, category, description, customUrgency = null, documents = [], location = null) => {
        try {
            const urgency = customUrgency || detectUrgency(description);
            const caseData = {
                userId,
                category,
                description,
                urgency,
                documents, // Added document support
                currentStageIndex: 0, // Default to first stage
                location, // Added location support
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
                status: "active" // Changed from open to active when assigned
            });
        } catch (error) {
            throw error;
        }
    },

    // Update case status (close, won, lost)
    updateCaseStatus: async (caseId, status) => {
        try {
            const caseRef = doc(db, "cases", caseId);
            await updateDoc(caseRef, { status });
        } catch (error) {
            throw error;
        }
    },

    // Update lawyer stats on win
    updateLawyerStats: async (lawyerId, won = true) => {
        try {
            const lawyerRef = doc(db, "lawyers", lawyerId);
            const lawyerDoc = await getDoc(lawyerRef);
            if (lawyerDoc.exists()) {
                const data = lawyerDoc.data();
                await updateDoc(lawyerRef, {
                    totalCases: (data.totalCases || 0) + 1,
                    winCases: won ? (data.winCases || 0) + 1 : (data.winCases || 0)
                });
            }
        } catch (error) {
            throw error;
        }
    },

    // Submit rating for a case and update lawyer trust score based on all their cases
    rateCase: async (caseId, lawyerId, rating) => {
        try {
            // 1. Update the specific Case with client's rating
            const caseRef = doc(db, "cases", caseId);
            await updateDoc(caseRef, { rating });

            // 2. Fetch all rated cases for this lawyer to calculate actual average
            const q = query(
                collection(db, "cases"),
                where("lawyer", "==", lawyerId)
            );
            const querySnapshot = await getDocs(q);

            let totalRating = 0;
            let ratedCasesCount = 0;

            querySnapshot.forEach((doc) => {
                const caseData = doc.data();
                if (caseData.rating) {
                    totalRating += caseData.rating;
                    ratedCasesCount++;
                }
            });

            // 3. Update Lawyer's trustScore with the new collective mean
            if (ratedCasesCount > 0) {
                const lawyerRef = doc(db, "lawyers", lawyerId);
                const averageScore = totalRating / ratedCasesCount;

                await updateDoc(lawyerRef, {
                    trustScore: parseFloat(averageScore.toFixed(2))
                });
            }
        } catch (error) {
            throw error;
        }
    }
};
