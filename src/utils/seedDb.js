import { db } from "../services/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

const sampleLawyers = [
    {
        lawyer_id: "lawyer_001",
        name: "Adv. Rajesh Kumar",
        phone: "9876543210",
        email: "rajesh@legal.in",
        city: "Mumbai",
        specialization: ["criminal", "civil"],
        experienceYears: 15,
        totalCases: 120,
        winCases: 95,
        rating: 4.8,
        isVerified: true,
        createdAt: serverTimestamp()
    },
    {
        lawyer_id: "lawyer_002",
        name: "Adv. Meera Sharma",
        phone: "9876543211",
        email: "meera@legal.in",
        city: "Delhi",
        specialization: ["family", "civil"],
        experienceYears: 8,
        totalCases: 45,
        winCases: 38,
        rating: 4.5,
        isVerified: true,
        createdAt: serverTimestamp()
    },
    {
        lawyer_id: "lawyer_003",
        name: "Adv. Amit Verma",
        phone: "9876543212",
        email: "amit@legal.in",
        city: "Bangalore",
        specialization: ["consumer", "civil"],
        experienceYears: 12,
        totalCases: 80,
        winCases: 60,
        rating: 4.2,
        isVerified: true,
        createdAt: serverTimestamp()
    }
];

export const seedDatabase = async () => {
    try {
        for (const lawyer of sampleLawyers) {
            await setDoc(doc(db, "lawyers", lawyer.lawyer_id), lawyer);
            console.log(`Seeded lawyer: ${lawyer.name}`);
        }
        alert("Database seeded with sample lawyers!");
    } catch (error) {
        console.error("Error seeding database:", error);
        alert("Failed to seed database.");
    }
};
