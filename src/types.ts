export type MarketingObjective = 'awareness' | 'consideration' | 'sales' | 'loyalty';

// Preset Audience
export const audienceOptions = [
    { value: 'none', label: 'None / Not Specified' },
    { value: 'general', label: 'General Consumers (B2C)' },
    { value: 'genz', label: 'Gen Z / Young Adults' },
    { value: 'millennials', label: 'Millennials' },
    { value: 'parents', label: 'Parents / Families' },
    { value: 'b2b', label: 'B2B Professionals / Decision Makers' },
    { value: 'smb', label: 'Small Business Owners' },
    { value: 'custom', label: 'Custom...' },
] as const;
export type PresetAudience = typeof audienceOptions[number]['value'];

// Preset Brand Tone
export const toneOptions = [
    { value: 'none', label: 'None / Not Specified' },
    { value: 'professional', label: 'Professional / Authoritative' },
    { value: 'friendly', label: 'Friendly / Conversational' },
    { value: 'humorous', label: 'Humorous / Witty' },
    { value: 'empathetic', label: 'Empathetic / Caring' },
    { value: 'inspirational', label: 'Inspirational / Aspirational' },
    { value: 'urgent', label: 'Direct / Urgent' },
    { value: 'custom', label: 'Custom...' },
] as const;
export type PresetBrandTone = typeof toneOptions[number]['value'];

export interface CampaignInput {
  campaignMessage: string;
  callToAction: string;
}

export interface CampaignGoalDetails {
  targetAudience?: PresetAudience;
  customTargetAudience?: string;
  brandTone?: PresetBrandTone;
  customBrandTone?: string;
  keyMessage?: string;
}

export interface StrategicRecommendation {
  verdict: string;
  summary: string;
  strengths: string[];
  revisions: string[];
  suggestion: string;
}

export interface CampaignAnalysisResult {
  campaignMessage: string;
  callToAction: string;
  combinedEmotionScore: number;
  combinedEmotionScoreJustification: string;
  clarityAndImpactScore: number;
  clarityAndImpactScoreJustification: string;
  trendRelevanceScore: number;
  trendRelevanceScoreJustification: string;
  steppsShareabilityScore: number;
  steppsShareabilityScoreJustification: string;
  ctaStrengthScore: number;
  ctaStrengthScoreJustification: string;
  subjectiveFitScore: number;
  subjectiveFitScoreJustification: string;
  weightedCampaignConfidenceScore: number;
  strategicRecommendation: StrategicRecommendation;
}