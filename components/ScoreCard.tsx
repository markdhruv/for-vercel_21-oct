import React from 'react';

interface ScoreCardProps {
  title: React.ReactNode;
  score: number;
  justification?: string;
  isPrimary?: boolean;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, justification, isPrimary = false }) => {
  const getScoreColor = (value: number) => {
    if (value >= 4.0) return 'text-green-500';
    if (value >= 3.0) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (isPrimary) {
    return (
      <div className="col-span-2 md:col-span-1 bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg text-center flex flex-col justify-between">
        <div>
            <div className="text-sm font-medium text-indigo-800 dark:text-indigo-200 flex items-center justify-center">{title}</div>
            <p className={`text-4xl font-bold ${getScoreColor(score)} mt-1`}>
            {score.toFixed(2)}
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">out of 5.00</p>
        </div>
        {justification && <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-2 text-balance">{justification}</p>}
      </div>
    );
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg text-center flex flex-col justify-between">
        <div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center justify-center">{title}</div>
            <p className={`text-2xl font-bold ${getScoreColor(score)} mt-1`}>
                {score.toFixed(2)}
            </p>
        </div>
        {justification && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-balance">{justification}</p>}
    </div>
  );
};