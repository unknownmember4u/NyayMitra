import emailjs from "@emailjs/browser";

// 🔴 CONFIGURATION - Fill these from your EmailJS Dashboard
const SERVICE_ID = "nyaymitra";
const TEMPLATE_ID = "template_mdi908s";
const PUBLIC_KEY = "XZUJGbzfRTOOf4WiB";

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
