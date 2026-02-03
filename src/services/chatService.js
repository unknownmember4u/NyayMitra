import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    getDocs
} from "firebase/firestore";
import { db } from "./firebase";

export const chatService = {
    // Start or get existing chat between user and lawyer for a specific case
    getChatId: async (userId, lawyerId, caseId) => {
        const chatsRef = collection(db, "chats");
        const q = query(
            chatsRef,
            where("caseId", "==", caseId),
            where("participants", "array-contains", userId)
        );

        const snapshot = await getDocs(q);
        const existingChat = snapshot.docs.find(doc => doc.data().participants.includes(lawyerId));

        if (existingChat) {
            return existingChat.id;
        } else {
            const newChat = await addDoc(chatsRef, {
                caseId,
                participants: [userId, lawyerId],
                createdAt: serverTimestamp(),
                lastMessage: "",
                lastMessageAt: serverTimestamp()
            });
            return newChat.id;
        }
    },

    // Send a message
    sendMessage: async (chatId, senderId, text) => {
        await addDoc(collection(db, "chats", chatId, "messages"), {
            senderId,
            text,
            createdAt: serverTimestamp()
        });
    },

    // Subscribe to messages
    subscribeToMessages: (chatId, callback) => {
        const q = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("createdAt", "asc")
        );
        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(messages);
        });
    }
};
