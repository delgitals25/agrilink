import React, { useState } from 'react';
import {
  Sparkles,
  X,
  TrendingUp,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowUpRight,
} from 'lucide-react';
import { GeminiService, ForecastResult } from '../services/geminiService';
import { Parcel } from '../types';
import { formatFcfa } from '../services/storageService';

interface AiForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcels: Parcel[];
}

export const AiForecastModal: React.FC<AiForecastModalProps> = ({
  isOpen,
  onClose,
  parcels,
}) => {
  const [cropName, setCropName] = useState('Cacao Fèves');
  const [areaHectares, setAreaHectares] = useState('12.5');
  const [region, setRegion] = useState('Soubré (Nawa, Côte d\'Ivoire)');
  const [season, setSeason] = useState('Grande Campagne Principale (Oct - Mars)');
  const [historicYield, setHistoricYield] = useState('0.85');
  const [isLoading, setIsLoading] = useState(false);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await GeminiService.getForecast({
        cropName,
        parcelAreaHectares: Number(areaHectares) || 10,
        region,
        season,
        historicYieldTonnesPerHa: Number(historicYield) || 0.8,
        averageRainfall: '1400mm annuel avec petite saison sèche',
      });
      setForecastResult(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Impossible de calculer les prévisions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 text-stone-100 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
                Moteur de Prévisions de Récolte & Cours (IA Gemini)
              </h3>
              <p className="text-xs text-stone-400">
                Projection des volumes attendus et anticipations des prix de vente bord-champ
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

        {/* Input Parameters Form */}
        <form onSubmit={handleRunForecast} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-300 font-semibold block mb-1">Culture Cible</label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
              >
                <option value="Cacao Fèves">Cacao Fèves</option>
                <option value="Café Robusta">Café Robusta</option>
                <option value="Noix de Cajou (Anacarde)">Noix de Cajou (Anacarde)</option>
                <option value="Maïs Blanc">Maïs Blanc</option>
                <option value="Manioc Cossettes">Manioc Cossettes</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-stone-300 font-semibold block mb-1">
                Superficie Cumulée (Hectares)
              </label>
              <input
                type="number"
                step="0.5"
                value={areaHectares}
                onChange={(e) => setAreaHectares(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-300 font-semibold block mb-1">Bassin Régional</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-stone-300 font-semibold block mb-1">
                Rendement Historique (T/ha)
              </label>
              <input
                type="number"
                step="0.05"
                value={historicYield}
                onChange={(e) => setHistoricYield(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Calcul prédictif Gemini en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Générer la Projection Prédictive</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Prediction Results */}
        {forecastResult && (
          <div className="space-y-4 pt-4 border-t border-stone-800 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                  Rendement Total Estimé
                </span>
                <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                  {forecastResult.predictedYieldTonnesTotal}
                </div>
                <span className="text-[10px] text-stone-400 block mt-1">
                  Confiance : {forecastResult.confidenceInterval}
                </span>
              </div>

              <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                  Fenêtre Optimale de Récolte
                </span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {forecastResult.optimalHarvestWindow}
                </div>
                <span className="text-[10px] text-emerald-400 block mt-1">
                  Pic de teneur aromatique
                </span>
              </div>

              <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                  Prix Marché Projeté
                </span>
                <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                  {formatFcfa(forecastResult.marketPriceProjectionFcfa)} / kg
                </div>
                <span className="text-[10px] text-stone-400 block mt-1">
                  Tendance : {forecastResult.marketPriceTrend}
                </span>
              </div>
            </div>

            {/* Drivers & Actionable advice */}
            <div className="bg-stone-850 p-4 rounded-xl border border-stone-800 space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
                Facteurs Clés d'Influence Détectés :
              </h4>
              <ul className="space-y-1 text-stone-300">
                {(forecastResult.keyDrivers || []).map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/60 rounded-xl text-xs text-stone-200 space-y-1">
              <strong className="text-emerald-300 block">Conseil Stratégique de Commercialisation :</strong>
              <p className="leading-relaxed text-stone-300">{forecastResult.actionableAdvice}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
