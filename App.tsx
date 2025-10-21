import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultsTable } from './components/ResultsTable';
import { analyzeCampaignsWithGemini } from './services/geminiService';
import type { CampaignAnalysisResult, MarketingObjective, CampaignGoalDetails, CampaignInput } from './types';
import { SparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [analysisResults, setAnalysisResults] = useState<CampaignAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = useCallback(async (
    campaignInputs: CampaignInput[], 
    keywords: string[], 
    objective: MarketingObjective,
    details: CampaignGoalDetails
  ) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResults([]);

    try {
      if (campaignInputs.length === 0) {
        throw new Error("Please provide at least one campaign message and its call-to-action.");
      }
      if (keywords.length === 0) {
        throw new Error("Please provide keywords for trend analysis.");
      }
      
      const results = await analyzeCampaignsWithGemini(campaignInputs, keywords, objective, details);
      setAnalysisResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setAnalysisResults([]);
    setIsLoading(false);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <InputForm onAnalyze={handleAnalysis} onReset={handleReset} isLoading={isLoading} />
        
        {error && (
          <div className="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {isLoading && (
          <div className="mt-8 flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <SparklesIcon className="h-12 w-12 text-indigo-500 animate-pulse" />
            <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">AI is analyzing your campaigns...</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">This may take a moment. We're evaluating every angle based on your business objective.</p>
          </div>
        )}

        {analysisResults.length > 0 && !isLoading && (
          <div className="mt-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">Analysis Results</h2>
            <ResultsTable results={analysisResults} />
          </div>
        )}
      </main>
      <footer className="text-center p-4 mt-8 text-xs text-slate-400 dark:text-slate-500">
        <p>Powered by Gemini API | Designed for Modern Marketers</p>
      </footer>
    </div>
  );
};

export default App;