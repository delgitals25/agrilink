import React, { useState } from 'react';
import {
  FileText,
  X,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Download,
  CheckCircle2,
  Building,
  Printer,
} from 'lucide-react';
import { GeminiService, ExecutiveReportResult } from '../services/geminiService';
import { Cooperative } from '../types';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cooperative: Cooperative;
  summaryStats: any;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  cooperative,
  summaryStats,
}) => {
  const [period, setPeriod] = useState('Trimestre 3 — Campagne 2026');
  const [isLoading, setIsLoading] = useState(false);
  const [reportResult, setReportResult] = useState<ExecutiveReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await GeminiService.generateExecutiveReport({
        cooperativeName: cooperative.name,
        summaryStats,
        period,
      });
      setReportResult(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Échec de la génération du rapport');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl shadow-2xl p-6 text-stone-100 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
                Générateur de Rapport Exécutif Coopératif (IA Gemini)
              </h3>
              <p className="text-xs text-stone-400">
                Synthèse pour le Conseil d'Administration, les Banques et Bailleurs de fonds
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action button */}
        {!reportResult && (
          <div className="bg-stone-850 p-6 rounded-2xl border border-stone-800 text-center space-y-4">
            <div className="max-w-md mx-auto space-y-2">
              <h4 className="text-sm font-bold text-white">
                Rapport d'activité pour {cooperative.name}
              </h4>
              <p className="text-xs text-stone-400">
                L'IA analyse les indicateurs de stocks, les encaissements Mobile Money, les coûts par
                hectare et la traçabilité pour rédiger une note de synthèse officielle.
              </p>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-lg disabled:opacity-50 transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Rédaction du rapport par Gemini 3.8 Flash...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Générer le Rapport d'Activité Officiel</span>
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Report Output */}
        {reportResult && (
          <div className="space-y-5 print:p-0 animate-in fade-in">
            {/* Header Document Style */}
            <div className="p-5 bg-white text-stone-900 rounded-2xl shadow space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-emerald-800 font-display">
                    {reportResult.title}
                  </h2>
                  <p className="text-xs text-stone-600 font-medium">
                    {cooperative.name} • {period}
                  </p>
                </div>
                <div className="text-right text-[11px] text-stone-500 font-mono">
                  AGRILINK-DOC-{new Date().getFullYear()}
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-1.5 text-xs text-stone-800 leading-relaxed">
                <strong className="text-stone-900 uppercase tracking-wider text-[11px] block">
                  1. Synthèse Exécutive
                </strong>
                <p>{reportResult.executiveSummary}</p>
              </div>

              {/* Strengths & Vigilance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-1 text-xs text-emerald-900">
                  <strong className="block font-bold uppercase text-[10px] text-emerald-800">
                    Points Forts & Performances
                  </strong>
                  <ul className="space-y-1">
                    {(reportResult.strengths || []).map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-1 text-xs text-amber-900">
                  <strong className="block font-bold uppercase text-[10px] text-amber-800">
                    Points de Vigilance Opérationnels
                  </strong>
                  <ul className="space-y-1">
                    {(reportResult.pointsOfVigilance || []).map((v, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-1.5 pt-2 text-xs text-stone-800">
                <strong className="text-stone-900 uppercase tracking-wider text-[11px] block">
                  3. Recommandations Stratégiques pour le Conseil
                </strong>
                <ul className="space-y-1 text-stone-700">
                  {(reportResult.recommendations || []).map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="font-bold text-emerald-700">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Print / Download Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleGenerateReport}
                className="text-xs text-stone-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Régénérer
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimer / PDF
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Terminé
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
