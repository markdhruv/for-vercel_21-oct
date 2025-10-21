import React from 'react';
import type { StrategicRecommendation } from '../types';
import { CheckCircleIcon, LightBulbIcon, XCircleIcon } from './icons';

interface AiCoachCornerProps {
  recommendation: StrategicRecommendation;
}

export const AiCoachCorner: React.FC<AiCoachCornerProps> = ({ recommendation }) => {
  return (
    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4 animate-fade-in">
      <div>
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">AI Strategic Summary</h4>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{recommendation.summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Key Strengths</h5>
          <ul className="mt-2 space-y-1.5">
            {recommendation.strengths.map((strength, i) => (
              <li key={i} className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5 mr-2" />
                <span className="text-sm text-slate-600 dark:text-slate-300">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Areas for Revision</h5>
          <ul className="mt-2 space-y-1.5">
            {recommendation.revisions.map((revision, i) => (
              <li key={i} className="flex items-start">
                <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5 mr-2" />
                <span className="text-sm text-slate-600 dark:text-slate-300">{revision}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center">
            <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2"/>
            Suggested Revision
        </h4>
         <blockquote className="mt-2 pl-4 border-l-4 border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-r-md">
            <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200 italic">
                "{recommendation.suggestion}"
            </p>
         </blockquote>
      </div>

      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
