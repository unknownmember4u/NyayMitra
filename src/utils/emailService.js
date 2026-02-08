import emailjs from "@emailjs/browser";

// EmailJS configuration from environment variables
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Sends an email notification to the lawyer based on the EmailJS template.
 * Matches variables in the user's template: 
 * {{lawyer_email}}, {{name}}, {{email}}, {{category}}, {{urgency}}, {{status}}, {{created_at}}, {{description}}
 */
export const sendAssignmentEmail = async (details) => {
    try {
        const templateParams = {
            lawyer_email: details.lawyerEmail,
            name: details.clientName,
            email: details.clientEmail,
            category: details.caseCategory,
            urgency: details.caseUrgency,
            status: details.caseStatus,
            created_at: details.createdAt,
            description: details.caseDescription
        };

        const result = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            templateParams,
            PUBLIC_KEY
        );

        console.log("✅ Assignment Email sent:", result.text);
        return result;
    } catch (error) {
        console.error("❌ EmailJS Error:", error);
        throw error;
    }
};
