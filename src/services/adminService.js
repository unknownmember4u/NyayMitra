import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export const adminService = {
    getAllUsers: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw error;
        }
    },
    getAllLawyers: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "lawyers"));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw error;
        }
    }
};
