import React, { useState, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
    MarketingObjective, 
    CampaignGoalDetails,
    PresetAudience,
    PresetBrandTone,
    audienceOptions,
    toneOptions,
    CampaignInput
} from '../types';
import { UploadIcon, TrashIcon, SparklesIcon, ChevronDownIcon, DownloadIcon } from './icons';

interface InputFormProps {
  onAnalyze: (campaigns: CampaignInput[], keywords: string[], objective: MarketingObjective, details: CampaignGoalDetails) => void;
  onReset: () => void;
  isLoading: boolean;
}

const TemplateLink: React.FC<{ onDownload: () => void, label: string }> = ({ onDownload, label }) => (
    <button
        type="button"
        onClick={onDownload}
        className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center mx-auto"
    >
        <DownloadIcon className="h-3 w-3 mr-1" />
        {label}
    </button>
);

const FileInput: React.FC<{ id: string; label: string; file: File | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onClear: () => void; accept: string; onDownloadTemplate: () => void }> = ({ id, label, file, onChange, onClear, accept, onDownloadTemplate }) => (
    <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center group hover:border-indigo-500 transition-colors h-full flex flex-col justify-center">
        <label htmlFor={id} className="cursor-pointer flex flex-col items-center">
            <UploadIcon className="h-8 w-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            <span className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">(.xlsx)</p>
        </label>
        <input id={id} type="file" className="sr-only" onChange={onChange} accept={accept} />
        <TemplateLink onDownload={onDownloadTemplate} label="Download Template" />
        {file && (
            <div className="absolute inset-0 bg-white/90 dark:bg-slate-800/90 flex items-center justify-center p-2 rounded-lg">
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 truncate">{file.name}</p>
                <button onClick={onClear} className="ml-2 text-red-500 hover:text-red-700 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500">
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>
        )}
    </div>
);

export const InputForm: React.FC<InputFormProps> = ({ onAnalyze, onReset, isLoading }) => {
  const [campaignMessage, setCampaignMessage] = useState<string>('');
  const [callToAction, setCallToAction] = useState<string>('');
  const [keywordFile, setKeywordFile] = useState<File | null>(null);
  const [campaignFile, setCampaignFile] = useState<File | null>(null);
  const [marketingObjective, setMarketingObjective] = useState<MarketingObjective>('awareness');
  const [goalDetails, setGoalDetails] = useState<CampaignGoalDetails>({
    targetAudience: 'none',
    brandTone: 'none'
  });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const keywordFileRef = useRef<HTMLInputElement>(null);
  const campaignFileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleReset = useCallback(() => {
    setCampaignMessage('');
    setCallToAction('');
    setKeywordFile(null);
    setCampaignFile(null);
    setMarketingObjective('awareness');
    setGoalDetails({ targetAudience: 'none', brandTone: 'none' });
    setIsDetailsOpen(false);
    if(keywordFileRef.current) keywordFileRef.current.value = '';
    if(campaignFileRef.current) campaignFileRef.current.value = '';
    onReset();
  }, [onReset]);

  const readFileAsJson = <T,>(file: File): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json as T[]);
        } catch (err) {
          reject(new Error(`Failed to parse file ${file.name}: ${err}`));
        }
      };
      reader.onerror = (err) => reject(new Error(`Failed to read file ${file.name}`));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    let campaignInputs: CampaignInput[] = [];
    let keywords: string[] = [];

    try {
        if (campaignFile) {
            const campaignData = await readFileAsJson<{ 'Campaign Message': string; 'Call to Action': string }>(campaignFile);
            campaignInputs = campaignData
              .map(row => ({
                campaignMessage: row['Campaign Message'],
                callToAction: row['Call to Action']
              }))
              .filter(c => c.campaignMessage && c.callToAction);
        } else if (campaignMessage.trim() && callToAction.trim()) {
            campaignInputs = [{ campaignMessage, callToAction }];
        }

        if (keywordFile) {
            const keywordData = await readFileAsJson<{ 'Keyword': string }>(keywordFile);
            keywords = keywordData.map(row => row['Keyword']).filter(Boolean);
        }
        
        onAnalyze(campaignInputs, keywords, marketingObjective, goalDetails);

    } catch(err) {
        console.error(err);
        alert(err instanceof Error ? err.message : "An error occurred during file processing.");
    }

  }, [campaignMessage, callToAction, keywordFile, campaignFile, onAnalyze, marketingObjective, goalDetails]);

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    switch (name) {
      case 'targetAudience':
        setGoalDetails(prev => ({
          ...prev,
          targetAudience: value as PresetAudience,
          customTargetAudience: value !== 'custom' ? '' : prev.customTargetAudience,
        }));
        break;
      case 'brandTone':
        setGoalDetails(prev => ({
          ...prev,
          brandTone: value as PresetBrandTone,
          customBrandTone: value !== 'custom' ? '' : prev.customBrandTone,
        }));
        break;
      case 'customTargetAudience':
      case 'customBrandTone':
      case 'keyMessage':
        setGoalDetails(prev => ({ ...prev, [name]: value }));
        break;
    }
  };

  const downloadTemplate = (headers: string[], fileName: string) => {
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label htmlFor="marketing-objective" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Marketing Objective
            </label>
            <select
              id="marketing-objective"
              value={marketingObjective}
              onChange={(e) => setMarketingObjective(e.target.value as MarketingObjective)}
              disabled={isLoading}
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-700 disabled:opacity-50"
            >
              <option value="awareness">Create Awareness</option>
              <option value="consideration">Drive Consideration</option>
              <option value="sales">Drive Sales (Conversion)</option>
              <option value="loyalty">Build Loyalty (Retention)</option>
            </select>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={() => setIsDetailsOpen(!isDetailsOpen)} className="w-full flex justify-between items-center py-4 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
              <span>Add Optional Details for Deeper Analysis</span>
              <ChevronDownIcon className={`h-5 w-5 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDetailsOpen && (
              <div className="pb-4 space-y-4">
                <div>
                  <label htmlFor="targetAudience" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Target Audience</label>
                  <select name="targetAudience" id="targetAudience" value={goalDetails.targetAudience} onChange={handleDetailChange} disabled={isLoading} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-slate-50 dark:bg-slate-700 disabled:opacity-50">
                    {audienceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  {goalDetails.targetAudience === 'custom' && (
                    <input type="text" name="customTargetAudience" value={goalDetails.customTargetAudience || ''} onChange={handleDetailChange} disabled={isLoading} placeholder="Describe your custom audience..." className="mt-2 w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-slate-50 dark:bg-slate-700 disabled:opacity-50" />
                  )}
                </div>
                <div>
                  <label htmlFor="brandTone" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Brand Tone / Voice</label>
                  <select name="brandTone" id="brandTone" value={goalDetails.brandTone} onChange={handleDetailChange} disabled={isLoading} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-slate-50 dark:bg-slate-700 disabled:opacity-50">
                    {toneOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  {goalDetails.brandTone === 'custom' && (
                    <input type="text" name="customBrandTone" value={goalDetails.customBrandTone || ''} onChange={handleDetailChange} disabled={isLoading} placeholder="Describe your custom brand tone..." className="mt-2 w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-slate-50 dark:bg-slate-700 disabled:opacity-50" />
                  )}
                </div>
                <div>
                  <label htmlFor="keyMessage" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Key Message / Unique Selling Proposition (USP)</label>
                  <textarea name="keyMessage" id="keyMessage" rows={2} value={goalDetails.keyMessage || ''} onChange={handleDetailChange} disabled={isLoading} placeholder="e.g., The only tool that saves you 10 hours a week." className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-slate-50 dark:bg-slate-700 disabled:opacity-50"></textarea>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="campaign-message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Campaign Message
              </label>
              <textarea
                id="campaign-message"
                rows={3}
                value={campaignMessage}
                onChange={(e) => setCampaignMessage(e.target.value)}
                disabled={!!campaignFile || isLoading}
                placeholder="Enter one campaign message, or upload a file below."
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="call-to-action" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Call to Action (CTA)
              </label>
              <input
                type="text"
                id="call-to-action"
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                disabled={!!campaignFile || isLoading}
                placeholder="e.g., 'Shop Now', 'Learn More', 'Sign Up Free'"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
             <p className="pt-2 text-center text-sm text-slate-500">OR</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileInput id="upload-keywords" label="Upload Keywords" file={keywordFile} onChange={handleFileChange(setKeywordFile)} onClear={() => setKeywordFile(null)} accept=".xlsx" onDownloadTemplate={() => downloadTemplate(['Keyword'], 'Keywords_Template.xlsx')} />
              <FileInput id="upload-campaigns" label="Upload Campaigns & CTAs" file={campaignFile} onChange={handleFileChange(setCampaignFile)} onClear={() => setCampaignFile(null)} accept=".xlsx" onDownloadTemplate={() => downloadTemplate(['Campaign Message', 'Call to Action'], 'Campaigns_Template.xlsx')} />
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-4">
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 border border-slate-300 dark:border-slate-500 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-wait"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8
 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <SparklesIcon className="-ml-1 mr-2 h-5 w-5" />
                Run Analysis
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};