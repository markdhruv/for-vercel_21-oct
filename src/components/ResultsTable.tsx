import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import type { CampaignAnalysisResult } from '../types';
import { ScoreCard } from './ScoreCard';
import { AiCoachCorner } from './AiCoachCorner';
import { DownloadIcon, InfoIcon, ChevronRightIcon } from './icons';

interface ResultsTableProps {
  results: CampaignAnalysisResult[];
}

const scoreExplanations: Record<string, string> = {
    'Confidence Score': "The overall AI-powered prediction of this campaign's success, calculated as a weighted average of all other scores. The justification below explains the 'Strategic Fit' score, which is the largest component of this overall score.",
    'Emotion': "The raw emotional tone of the message. A high score is very positive (e.g., joy), while a low score is negative (e.g., fear, anger).",
    'Clarity & Impact': "Measures how powerfully and clearly the message is written. High scores go to concise, impactful messages with strong, active language.",
    'Relevance': "How well the message aligns with the trending keywords you provided. High scores mean the keywords are integrated naturally and effectively.",
    'Shareability': "The message's potential to be shared on social media. It considers emotional hooks, practical value, and engaging elements.",
    'CTA Strength': "The effectiveness of the Call-to-Action. High scores mean the CTA is clear, urgent, and persuasive.",
};

const ScoreInfo: React.FC<{ title: string }> = ({ title }) => (
    <div className="relative group flex items-center">
        <span>{title}</span>
        <InfoIcon className="h-4 w-4 ml-1.5 text-slate-400 dark:text-slate-500" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-slate-800 dark:bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
            {scoreExplanations[title] || 'No description available.'}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-800 dark:border-t-slate-900"></div>
        </div>
    </div>
);


const RecommendationBadge: React.FC<{ verdict: string }> = ({ verdict }) => {
  const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-block";
  let colorClasses = "";
  if (verdict.startsWith('✅')) {
    colorClasses = "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
  } else if (verdict.startsWith('⚠️')) {
    colorClasses = "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/50 dark:text-yellow-300";
  } else {
    colorClasses = "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
  }
  return <span className={`${baseClasses} ${colorClasses}`}>{verdict}</span>;
};

export const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    const toggleExpand = (index: number) => {
        setExpanded(prev => ({...prev, [index]: !prev[index]}));
    }

    const handleDownload = () => {
        const wb = XLSX.utils.book_new();
        let ws_data: any[][] = [];
        const merges: any[] = [];
        let currentRow = 0;

        results.forEach((result, index) => {
             if (index > 0) {
                ws_data.push([]); 
                ws_data.push([]);
                currentRow += 2;
            }

            // --- CAMPAIGN IDENTIFICATION ---
            ws_data.push(['Campaign Message:', result.campaignMessage]);
            ws_data[currentRow][0] = { v: 'Campaign Message:', s: { font: { bold: true } } };
            merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 7 } });
            currentRow++;

            ws_data.push(['Call to Action:', result.callToAction]);
            ws_data[currentRow][0] = { v: 'Call to Action:', s: { font: { bold: true } } };
            merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 7 } });
            currentRow++;
            
            ws_data.push([]); // Spacer
            currentRow++;

            // --- SCORES TABLE ---
            const scoresHeader = ['', 'Confidence Score', 'Strategic Fit', 'Emotion', 'Clarity', 'CTA Strength', 'Relevance', 'Shareability'];
            ws_data.push(scoresHeader.map(h => ({ v: h, s: { font: { bold: true }, alignment: { horizontal: 'center' } } })));
            currentRow++;
            
            ws_data.push([
                {v: 'Score', s: {font: {bold: true}}},
                {v: result.weightedCampaignConfidenceScore.toFixed(2), s: {alignment: {horizontal: 'center'}}},
                {v: result.subjectiveFitScore.toFixed(2), s: {alignment: {horizontal: 'center'}}},
                {v: result.combinedEmotionScore.toFixed(2), s: {alignment: {horizontal: 'center'}}},
                {v: result.clarityAndImpactScore.toFixed(2), s: {alignment: {horizontal: 'center'}}},
                {v: result.ctaStrengthScore.toFixed(2), s: {alignment: {horizontal: 'center'}}},
                {v: result.trendRelevanceScore.toFixed(2), s: {alignment: {horizontal: 'center'}}},
                {v: result.steppsShareabilityScore.toFixed(2), s: {alignment: {horizontal: 'center'}}},
            ]);
            currentRow++;

            ws_data.push([
                {v: 'Justification', s: {font: {bold: true}}},
                {v: result.subjectiveFitScoreJustification, s: {alignment: {wrapText: true, vertical: 'top'}}},
                {v: result.subjectiveFitScoreJustification, s: {alignment: {wrapText: true, vertical: 'top'}}},
                {v: result.combinedEmotionScoreJustification, s: {alignment: {wrapText: true, vertical: 'top'}}},
                {v: result.clarityAndImpactScoreJustification, s: {alignment: {wrapText: true, vertical: 'top'}}},
                {v: result.ctaStrengthScoreJustification, s: {alignment: {wrapText: true, vertical: 'top'}}},
                {v: result.trendRelevanceScoreJustification, s: {alignment: {wrapText: true, vertical: 'top'}}},
                {v: result.steppsShareabilityScoreJustification, s: {alignment: {wrapText: true, vertical: 'top'}}},
            ]);
            currentRow++;
            
            ws_data.push([]); // Spacer
            currentRow++;

            // --- STRATEGIC SUMMARY ---
            ws_data.push([{v: 'AI Strategic Summary', s: {font: {bold: true}}}]);
            merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 7 } });
            currentRow++;

            ws_data.push([{v: result.strategicRecommendation.summary, s: {alignment: {wrapText: true}}}]);
            merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 7 } });
            currentRow++;

            ws_data.push([]); // Spacer
            currentRow++;

            // --- ACTIONABLE COACHING ---
            ws_data.push([
                {v: 'Key Strengths', s: {font: {bold: true}}}, 
                null, null, null, 
                {v: 'Areas for Revision', s: {font: {bold: true}}}
            ]);
            merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 3 } });
            merges.push({ s: { r: currentRow, c: 4 }, e: { r: currentRow, c: 7 } });
            currentRow++;
            
            const strengthsText = result.strategicRecommendation.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n');
            const revisionsText = result.strategicRecommendation.revisions.map((r, i) => `${i + 1}. ${r}`).join('\n');
            ws_data.push([
                {v: strengthsText, s: {alignment: {wrapText: true, vertical: 'top'}}}, 
                null, null, null, 
                {v: revisionsText, s: {alignment: {wrapText: true, vertical: 'top'}}}
            ]);
            merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 3 } });
            merges.push({ s: { r: currentRow, c: 4 }, e: { r: currentRow, c: 7 } });
            currentRow++;
            
            ws_data.push([]); // Spacer
            currentRow++;

            // --- SUGGESTED REVISION ---
            ws_data.push([{v: 'AI Suggested Revision', s: {font: {bold: true}}}]);
            merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 7 } });
            currentRow++;

            ws_data.push([{v: `"${result.strategicRecommendation.suggestion}"`, s: {alignment: {wrapText: true, italic: true}}}]);
            merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 7 } });
            currentRow++;
        });

        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        ws['!merges'] = merges;
        
        const colWidths = [ { wch: 20 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 } ];
        ws['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(wb, ws, 'Analysis Report');
        XLSX.writeFile(wb, 'Campaign_Confidence_Report.xlsx');
    };


  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Detailed Breakdown</h3>
        <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
            <DownloadIcon className="-ml-1 mr-2 h-5 w-5" />
            Download Report (.xlsx)
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {results.map((result, index) => (
            <div key={index} className="py-6">
              <div className="mb-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Campaign Message</p>
                  <blockquote className="font-medium text-slate-800 dark:text-slate-100 border-l-4 border-slate-200 dark:border-slate-600 pl-4 py-1">"{result.campaignMessage}"</blockquote>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Call to Action</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">"{result.callToAction}"</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <ScoreCard title={<ScoreInfo title="Confidence Score" />} score={result.weightedCampaignConfidenceScore} justification={result.subjectiveFitScoreJustification} isPrimary />
                <ScoreCard title={<ScoreInfo title="Emotion" />} score={result.combinedEmotionScore} justification={result.combinedEmotionScoreJustification} />
                <ScoreCard title={<ScoreInfo title="Clarity & Impact" />} score={result.clarityAndImpactScore} justification={result.clarityAndImpactScoreJustification} />
                <ScoreCard title={<ScoreInfo title="CTA Strength" />} score={result.ctaStrengthScore} justification={result.ctaStrengthScoreJustification} />
                <ScoreCard title={<ScoreInfo title="Relevance" />} score={result.trendRelevanceScore} justification={result.trendRelevanceScoreJustification} />
                <ScoreCard title={<ScoreInfo title="Shareability" />} score={result.steppsShareabilityScore} justification={result.steppsShareabilityScoreJustification} />
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">AI Recommendation:</p>
                        <div className="mt-1">
                            <RecommendationBadge verdict={result.strategicRecommendation.verdict} />
                        </div>
                    </div>
                    <button onClick={() => toggleExpand(index)} className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200">
                       {expanded[index] ? 'Hide' : 'Show'} AI Strategy
                       <ChevronRightIcon className={`w-5 h-5 ml-1 transition-transform ${expanded[index] ? 'rotate-90' : ''}`} />
                    </button>
                </div>
                {expanded[index] && (
                    <AiCoachCorner recommendation={result.strategicRecommendation} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
