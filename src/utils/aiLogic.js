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
        const trustVal = lawyer.trustScore !== undefined ? lawyer.trustScore : lawyer.rating;

        // Trust Score and Win Rate are the most important factors
        let score = (winRate * 40) + (trustVal * 40) + (lawyer.experienceYears * 2);

        // Location priority: Add bonus if location matches
        let isLocal = false;
        if (location && location !== "None" && lawyer.city.toLowerCase() === location.toLowerCase()) {
            score += 20; // Bonus for proximity
            isLocal = true;
        }

        // Explanation for the UI
        let reason = "";
        if (isLocal) reason = `Expert in ${location} for ${category} matters`;
        else if (trustVal > 4.5) reason = "Exceptionally high client trust";
        else if (winRate > 0.8) reason = "Highly successful track record";
        else if (lawyer.experienceYears > 15) reason = "Extensive industry experience";
        else reason = "Consistent performance in this field";

        return { ...lawyer, score: parseFloat(score.toFixed(1)), reason };
    });

    // Sort by score descending and return top 3
    return scoredLawyers.sort((a, b) => b.score - a.score).slice(0, 3);
};
