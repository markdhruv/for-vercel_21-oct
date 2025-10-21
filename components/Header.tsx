
import React from 'react';
import { ChartBarIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-800/50 shadow-sm sticky top-0 z-10 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center">
        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
          <ChartBarIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="ml-4">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            Campaign Confidence Analyzer
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Leverage AI to predict your marketing success
          </p>
        </div>
      </div>
    </header>
  );
};
