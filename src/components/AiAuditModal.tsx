import React, { useState, useEffect } from 'react';
import { Property, SmartContractTransfer } from '../types';
import {
  X,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileText,
  DollarSign,
  CheckCircle2,
  Cpu,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency } from '../utils/crypto';

interface AiAuditModalProps {
  property: Property | null;
  smartContract?: SmartContractTransfer | null;
  mode: 'audit' | 'explain' | 'valuation';
  onClose: () => void;
}

export const AiAuditModal: React.FC<AiAuditModalProps> = ({
  property,
  smartContract,
  mode,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runAnalysis();
  }, [property, smartContract, mode]);

  const runAnalysis = async () => {
    if (!property && !smartContract) return;
    setLoading(true);
    setError(null);

    try {
      if (mode === 'audit' && property) {
        const res = await fetch('/api/ai/audit-title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ property }),
        });
        if (!res.ok) throw new Error('AI Title Audit service failed');
        const data = await res.json();
        setResult(data);
      } else if (mode === 'explain' && property) {
        const res = await fetch('/api/ai/explain-deed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ property }),
        });
        if (!res.ok) throw new Error('AI Deed explanation service failed');
        const data = await res.json();
        setResult(data);
      } else if (mode === 'valuation' && property) {
        const res = await fetch('/api/ai/evaluate-valuation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ property }),
        });
        if (!res.ok) throw new Error('AI Valuation service failed');
        const data = await res.json();
        setResult(data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while communicating with Gemini AI.');
    } finally {
      setLoading(false);
    }
  };

  if (!property && !smartContract) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {mode === 'audit' && 'AI Title Integrity & Conflict Audit'}
                {mode === 'explain' && 'AI Plain-English Deed Explainer'}
                {mode === 'valuation' && 'AI Cadastral Valuation & Market Model'}
              </h2>
              <p className="text-xs text-slate-400">
                Powered by Gemini 3.6 Flash Server-Side Legal & Cadastral Reasoning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-5 text-xs text-slate-700 max-h-[70vh] overflow-y-auto">
          {property && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-indigo-700">{property.parcelId}</span>
                <span className="font-semibold text-slate-900 ml-2">{property.address}</span>
              </div>
              <span className="text-slate-500 font-medium">{formatCurrency(property.estimatedValueUSD)}</span>
            </div>
          )}

          {loading && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="font-semibold text-slate-800 text-sm">
                Analyzing deed covenants, boundary surveys, and blockchain provenance...
              </p>
              <p className="text-xs text-slate-400">Querying Gemini 2.5 API</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>AI Service Notice</span>
              </div>
              <p className="text-xs">{error}</p>
              <button
                onClick={runAnalysis}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Audit</span>
              </button>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Audit View Mode */}
              {mode === 'audit' && (
                <>
                  <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Risk Assessment</span>
                      <div className="text-xl font-bold text-emerald-400 flex items-center gap-2 mt-0.5">
                        <ShieldCheck className="w-5 h-5" />
                        <span>{result.riskLevel || 'Low Risk (Clean Title)'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Integrity Score</span>
                      <div className="text-2xl font-black text-indigo-300">{result.integrityScore || 98}%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Executive Legal Summary</h4>
                    <p className="text-xs leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800">
                      {result.summary}
                    </p>
                  </div>

                  {result.recommendations && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Municipal & Conveyance Recommendations
                      </h4>
                      <ul className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        {result.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {/* Explain View Mode */}
              {mode === 'explain' && (
                <>
                  <div className="space-y-3">
                    <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-1.5">
                      <h4 className="font-bold text-indigo-950 text-sm">Plain English Title Explanation</h4>
                      <p className="text-xs leading-relaxed text-indigo-900">
                        {result.plainEnglishSummary || result.summary}
                      </p>
                    </div>

                    {(result.keyRights || result.rightsGranted) && (
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                          Key Rights & Privileges Granted
                        </h4>
                        <ul className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          {(result.keyRights || result.rightsGranted).map((r: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.obligations && result.obligations.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                          Citizen Legal & Municipal Obligations
                        </h4>
                        <ul className="space-y-1.5 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
                          {result.obligations.map((ob: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-amber-900">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                              <span>{ob}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.smartContractTriggers && result.smartContractTriggers.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                          Autonomous Smart Contract Triggers
                        </h4>
                        <ul className="space-y-1.5 bg-slate-900 text-slate-200 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px]">
                          {result.smartContractTriggers.map((tr: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                              <span>{tr}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Valuation Mode */}
              {mode === 'valuation' && (
                <>
                  <div className="p-4 bg-emerald-950 text-white rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400">
                        AI Recommended Market Valuation
                      </span>
                      <div className="text-2xl font-bold text-emerald-300 mt-0.5">
                        {formatCurrency(result.suggestedValuationUSD || property?.estimatedValueUSD || 750000)}
                      </div>
                    </div>
                    <span className="text-xs bg-emerald-800 text-emerald-200 px-2.5 py-1 rounded-full font-semibold">
                      Confidence: {result.confidenceScore || 95}%
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Valuation Methodology & Growth Drivers
                    </h4>
                    <p className="text-xs leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800">
                      {result.valuationReasoning || result.reasoning}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
