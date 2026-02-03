import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export const lawyerService = {
    // Get all lawyers
    getAllLawyers: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "lawyers"));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw error;
        }
    },

    // Get lawyer by ID
    getLawyerById: async (lawyerId) => {
        try {
            const docRef = doc(db, "lawyers", lawyerId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            throw error;
        }
    }
};
