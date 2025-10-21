import { GoogleGenAI, Type } from "@google/genai";
import { 
    CampaignAnalysisResult, 
    MarketingObjective, 
    CampaignGoalDetails, 
    audienceOptions, 
    toneOptions,
    CampaignInput
} from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. Please set it up in your Vercel project settings.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const strategicRecommendationSchema = {
  type: Type.OBJECT,
  properties: {
    verdict: { type: Type.STRING },
    summary: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    revisions: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestion: { type: Type.STRING },
  },
  required: ["verdict", "summary", "strengths", "revisions", "suggestion"],
};

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    campaignMessage: { type: Type.STRING },
    callToAction: { type: Type.STRING },
    combinedEmotionScore: { type: Type.NUMBER },
    combinedEmotionScoreJustification: { type: Type.STRING },
    clarityAndImpactScore: { type: Type.NUMBER },
    clarityAndImpactScoreJustification: { type: Type.STRING },
    trendRelevanceScore: { type: Type.NUMBER },
    trendRelevanceScoreJustification: { type: Type.STRING },
    steppsShareabilityScore: { type: Type.NUMBER },
    steppsShareabilityScoreJustification: { type: Type.STRING },
    ctaStrengthScore: { type: Type.NUMBER },
    ctaStrengthScoreJustification: { type: Type.STRING },
    subjectiveFitScore: { type: Type.NUMBER },
    subjectiveFitScoreJustification: { type: Type.STRING },
    weightedCampaignConfidenceScore: { type: Type.NUMBER },
    strategicRecommendation: strategicRecommendationSchema,
  },
  required: [
    "campaignMessage",
    "callToAction",
    "combinedEmotionScore",
    "combinedEmotionScoreJustification",
    "clarityAndImpactScore",
    "clarityAndImpactScoreJustification",
    "trendRelevanceScore",
    "trendRelevanceScoreJustification",
    "steppsShareabilityScore",
    "steppsShareabilityScoreJustification",
    "ctaStrengthScore",
    "ctaStrengthScoreJustification",
    "subjectiveFitScore",
    "subjectiveFitScoreJustification",
    "weightedCampaignConfidenceScore",
    "strategicRecommendation",
  ]
};

const getMarketingObjectiveInstructions = (objective: MarketingObjective): string => {
    switch (objective) {
        case 'awareness':
            return `The user's goal is 'Create Awareness'. The main goal is to get attention and be memorable.
            - **subjectiveFitScore**: Should be HIGHEST for messages that are simple, catchy, and have a strong emotional hook (positive like joy/surprise, or even negative if it's attention-grabbing). Prioritize high shareability and clarity.
            - A message is a POOR FIT if it is too complex, boring, or lacks a strong emotional angle.`;
        case 'consideration':
            return `The user's goal is 'Drive Consideration'. The main goal is to build trust and inform the user, helping them evaluate the product.
            - **subjectiveFitScore**: Should be HIGHEST for messages that are informative, benefit-driven, and have a neutral-to-positive, trustworthy tone. Clarity and credibility are key.
            - A message is a POOR FIT if it's overly emotional, vague, or sounds like high-pressure sales hype.`;
        case 'sales':
            return `The user's goal is 'Drive Sales (Conversion)'. The main goal is to get the user to take a specific action NOW.
            - **subjectiveFitScore**: Should be HIGHEST for messages with a very clear, strong Call-to-Action (CTA) that create urgency or scarcity (e.g., using fear of missing out). A slightly anxious or exciting tone is GOOD. The ctaStrengthScore is critical for this objective.
            - A message is a POOR FIT if the CTA is weak/unclear, or if the tone is too passive and doesn't motivate action.`;
        case 'loyalty':
            return `The user's goal is 'Build Loyalty (Retention)'. The main goal is to make existing customers feel valued.
            - **subjectiveFitScore**: Should be HIGHEST for messages with a warm, appreciative, and positive tone. Language of exclusivity ("for our members"), community, and gratitude should be rewarded.
            - A message is a POOR FIT if it feels impersonal, generic, or is too focused on selling instead of thanking or rewarding.`;
        default:
            return `No specific objective provided. Use a general-purpose analysis, balancing all factors equally.`;
    }
}

const getOptionalDetailsInstructions = (details: CampaignGoalDetails): string => {
    let instructions = "";
    
    const getAudienceText = (details: CampaignGoalDetails): string | undefined | null => {
        if (!details.targetAudience || details.targetAudience === 'none') return null;
        if (details.targetAudience === 'custom') return details.customTargetAudience;
        return audienceOptions.find(opt => opt.value === details.targetAudience)?.label;
    }
    
    const getBrandToneText = (details: CampaignGoalDetails): string | undefined | null => {
        if (!details.brandTone || details.brandTone === 'none') return null;
        if (details.brandTone === 'custom') return details.customBrandTone;
        return toneOptions.find(opt => opt.value === details.brandTone)?.label;
    }

    const audienceText = getAudienceText(details);
    if (audienceText) {
        instructions += `- **Target Audience:** "${audienceText}". The message should resonate with this specific group.\n`;
    }

    const brandToneText = getBrandToneText(details);
    if (brandToneText) {
        instructions += `- **Brand Tone/Voice:** "${brandToneText}". The message's tone must be consistent with this brand voice.\n`;
    }

    if (details.keyMessage) {
        instructions += `- **Key Message/USP:** "${details.keyMessage}". The message should clearly communicate or reinforce this core idea.\n`;
    }

    if (instructions) {
        return `
    **Optional Campaign Details for Deeper Analysis:**
    You MUST evaluate the campaign's fit against these specific details. The subjectiveFitScore should be heavily penalized if the message clashes with this context.
${instructions}
        `;
    }
    return "";
}


export const analyzeCampaignsWithGemini = async (
  campaigns: CampaignInput[],
  keywords: string[],
  objective: MarketingObjective,
  details: CampaignGoalDetails
): Promise<CampaignAnalysisResult[]> => {

  const objectiveInstructions = getMarketingObjectiveInstructions(objective);
  const optionalDetailsInstructions = getOptionalDetailsInstructions(details);

  const prompt = `
    You are an expert marketing campaign analyst. Your task is to evaluate one or more campaign messages based on a rigorous set of criteria and the user's specified context. For each campaign object provided, you will return a corresponding analysis object. Return the analysis in a structured JSON format.

    **Critical Context: Marketing Objective**
    ${objectiveInstructions}
    ${optionalDetailsInstructions}
    
    **Input Data:**

    1.  **Campaigns to Analyze:** This is an array of objects. Each object contains a 'campaignMessage' and its corresponding 'callToAction'. You must analyze them as a pair.
        \`\`\`json
        ${JSON.stringify(campaigns)}
        \`\`\`

    2.  **Trending Keywords:** These keywords provide context for the 'trendRelevanceScore'.
        \`\`\`json
        ${JSON.stringify(keywords)}
        \`\`\`

    **Analysis Criteria (Score from 1 to 5):**
    For each of the 6 scores below, you MUST also provide a brief, one-sentence justification for the score you assigned in the corresponding '...Justification' field.

    1.  **combinedEmotionScore (1-5):** Analyze the raw emotional tone of the 'campaignMessage'. 1 is extremely negative, 3 is neutral, 5 is extremely positive.
    2.  **clarityAndImpactScore (1-5):** Evaluate the 'campaignMessage' quality. 1 is unclear and weak (passive voice, long sentences, jargon). 5 is crystal-clear and powerful (active voice, strong verbs, concise).
    3.  **trendRelevanceScore (1-5):** Assess relevance of the 'campaignMessage' to the provided "Trending Keywords". 1 is no relevance, 5 is highly relevant and well-integrated.
    4.  **steppsShareabilityScore (1-5):** Evaluate the 'campaignMessage' using Jonah Berger's STEPPS framework for virality. A message does not need to hit all six, but strong performance in 2-3 areas is excellent.
        *   **Social Currency:** Does sharing this make the user look smart, cool, or in-the-know?
        *   **Triggers:** Does it relate to common thoughts or events that will make people think of it?
        *   **Emotion:** Does it evoke a high-arousal emotion (e.g., awe, excitement, humor, anger) rather than a low-arousal one (e.g., sadness, contentment)?
        *   **Public:** Is the idea observable and easy for others to see? (This is harder for text, but consider if it encourages public action).
        *   **Practical Value:** Is it genuinely useful, offering helpful advice or information that people would want to share to help others?
        *   **Stories:** Does it wrap the idea in a compelling narrative or story?
        A score of 5 means it strongly incorporates several STEPPS principles. A score of 1 means it has no discernible viral triggers.
    5.  **ctaStrengthScore (1-5):** Analyze the specific 'callToAction' provided within each campaign object. 1 is weak, vague, or missing. 5 is clear, urgent, and persuasive.
    6.  **subjectiveFitScore (1-5):** This is the most important score. Based on the **Marketing Objective** and any provided **Optional Campaign Details**, how well does the message and its CTA fit the strategic goal? 1 is a complete mismatch, 5 is a perfect fit.

    **Final Calculations & Strategic Recommendation:**

    Using the scores from the analysis, perform the following two steps for EACH campaign:

    1.  **Calculate weightedCampaignConfidenceScore:** Calculate a weighted average using these weights:
        *   subjectiveFitScore: 0.25
        *   clarityAndImpactScore: 0.20
        *   combinedEmotionScore: 0.20
        *   ctaStrengthScore: 0.15
        *   trendRelevanceScore: 0.10
        *   steppsShareabilityScore: 0.10
        Round the final score to two decimal places.

    2.  **Generate a strategicRecommendation object:** This object should act as an expert marketing coach. It MUST contain the following fields:
        *   **verdict (string):** Based on the "weightedCampaignConfidenceScore", provide ONE of the following strings:
            *   "✅ Strong potential to succeed" (if score >= 4.0)
            *   "⚠️ Good, but revise key elements" (if score >= 3.0 and < 4.0)
            *   "❌ Needs rework before launch" (if score < 3.0)
        *   **summary (string):** Write a 1-2 sentence strategic summary. Explain the core reason for the score in the context of the user's marketing objective. Connect the dots between the scores.
        *   **strengths (array of strings):** Identify the top 1 or 2 strongest elements of the campaign message. Phrase them as positive takeaways.
        *   **revisions (array of strings):** Identify the top 1 or 2 most critical weaknesses that need revision. Be specific and actionable.
        *   **suggestion (string):** Based on your analysis, provide one revised version of the campaign message that directly addresses the weaknesses you identified.

    **Output Format:**

    Return a JSON object containing a single key "results" which is an array of JSON objects, one for each campaign object provided. Strictly adhere to the provided JSON schema for each object in the array. Ensure the 'campaignMessage' and 'callToAction' fields in the output match the input.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            results: {
              type: Type.ARRAY,
              items: analysisSchema,
            },
          },
        },
      },
    });
    
    const responseText = response.text.trim();
    const parsedJson = JSON.parse(responseText);
    
    if (parsedJson && parsedJson.results) {
        return parsedJson.results;
    } else {
        throw new Error("Invalid response structure from Gemini API.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to analyze campaigns. Please check your prompt and API key.");
  }
};