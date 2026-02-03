/**
 * AI Logic for Urgency Detection
 * Sets urgency based on keywords in the case description.
 */
export const detectUrgency = (description) => {
    const highUrgencyKeywords = ["arrest", "violence", "fir", "threat", "emergency", "jail", "police", "attack"];
    const desc = description.toLowerCase();

    const isHighUrgency = highUrgencyKeywords.some(keyword => desc.includes(keyword));

    return isHighUrgency ? "high" : "medium";
};

/**
 * Lawyer Recommendation Engine
 * Match lawyers based on category and rank them by a score.
 * score = (winCases / totalCases) * 50 + rating * 10 + experienceYears * 2
 */
export const getRecommendedLawyers = (lawyers, category, location = null) => {
    // 1. Filter by specialization
    let matchingLawyers = lawyers.filter(lawyer =>
        lawyer.specialization.includes(category.toLowerCase())
    );

    // 2. Rank using the formula
    const scoredLawyers = matchingLawyers.map(lawyer => {
        const winRate = lawyer.totalCases > 0 ? (lawyer.winCases / lawyer.totalCases) : 0;
        let score = (winRate * 50) + (lawyer.rating * 10) + (lawyer.experienceYears * 2);

        // Location priority: Add bonus if location matches
        let isLocal = false;
        if (location && location !== "None" && lawyer.city.toLowerCase() === location.toLowerCase()) {
            score += 30; // Significant bonus for being in the same city
            isLocal = true;
        }

        // Explanation for the UI
        let reason = "";
        if (isLocal) reason = `Expert in ${location} for ${category} matters`;
        else if (winRate > 0.8) reason = "Highly successful track record";
        else if (lawyer.experienceYears > 15) reason = "Extensive industry experience";
        else if (lawyer.rating > 4.5) reason = "Top rated by clients";
        else reason = "Consistent performance in this field";

        return { ...lawyer, score, reason };
    });

    // Sort by score descending and return top 3
    return scoredLawyers.sort((a, b) => b.score - a.score).slice(0, 3);
};
