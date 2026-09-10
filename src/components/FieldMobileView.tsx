import React, { useState } from 'react';
import {
  Smartphone,
  Scale,
  Camera,
  DollarSign,
  TrendingUp,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  QrCode,
  Sparkles,
  MapPin,
  Calendar,
  CloudRain,
  Clock,
  Send,
} from 'lucide-react';
import { Parcel, HarvestRecord, CommodityPrice, WeatherData, OfflineSyncItem, ExpenseRecord } from '../types';
import { formatFcfa } from '../services/storageService';

interface FieldMobileViewProps {
  parcels: Parcel[];
  prices: CommodityPrice[];
  weather: WeatherData;
  isOffline: boolean;
  offlineQueue: OfflineSyncItem[];
  onToggleOffline: () => void;
  onSyncOffline: () => void;
  onOpenDiagnosis: () => void;
  onAddHarvest: (harvest: Omit<HarvestRecord, 'id' | 'batchCode'>) => void;
  onAddExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
}

export const FieldMobileView: React.FC<FieldMobileViewProps> = ({
  parcels,
  prices,
  weather,
  isOffline,
  offlineQueue,
  onToggleOffline,
  onSyncOffline,
  onOpenDiagnosis,
  onAddHarvest,
  onAddExpense,
}) => {
  const [activeSubMode, setActiveSubMode] = useState<'home' | 'recolte' | 'depense' | 'cours'>('home');
  const [selectedParcelId, setSelectedParcelId] = useState(parcels[0]?.id || '');
  const [quantityKg, setQuantityKg] = useState('500');
  const [bagsCount, setBagsCount] = useState('8');
  const [humidity, setHumidity] = useState('7.0');
  const [qualityGrade, setQualityGrade] = useState<'Grade 1 (Supérieur)' | 'Grade 2 (Standard)' | 'Rebut/Sous-grade'>('Grade 1 (Supérieur)');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Expense form state
  const [expenseAmount, setExpenseAmount] = useState('25000');
  const [expenseCategory, setExpenseCategory] = useState('Main d\'œuvre');
  const [expenseDesc, setExpenseDesc] = useState('Paie journalière sarclage');
  const [paidVia, setPaidVia] = useState<'Wave' | 'Orange Money' | 'MTN MoMo' | 'Cash'>('Wave');

  const activeParcel = parcels.find((p) => p.id === selectedParcelId) || parcels[0];

  const handleSubmitHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeParcel) return;

    onAddHarvest({
      parcelId: activeParcel.id,
      parcelName: activeParcel.name,
      producerName: activeParcel.producerName,
      crop: activeParcel.crop,
      variety: activeParcel.variety,
      date: new Date().toISOString().split('T')[0],
      quantityKg: Number(quantityKg) || 100,
      qualityGrade,
      humidityPercent: Number(humidity) || 7.0,
      warehouseId: 'wh-1',
      warehouseName: 'Magasin Central COOPAZA Soubré',
      unitCostFcfaKg: 320,
    });

    setSuccessNotice(
      `Pesée de ${quantityKg} kg enregistrée ! ${
        isOffline ? '(Sauvegardée hors-ligne dans la file locale)' : '(Synchronisée en direct)'
      }`
    );
    setActiveSubMode('home');
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeParcel) return;

    onAddExpense({
      parcelId: activeParcel.id,
      parcelName: activeParcel.name,
      category: expenseCategory as any,
      amountFcfa: Number(expenseAmount) || 10000,
      description: expenseDesc,
      date: new Date().toISOString().split('T')[0],
      paidVia,
      paymentMethod: paidVia as any,
    });

    setSuccessNotice(`Dépense de ${formatFcfa(Number(expenseAmount))} consignée avec succès.`);
    setActiveSubMode('home');
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Handheld Device Header Simulator */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 shadow-xl text-white">
        {/* Status Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-xs text-stone-400">
          <div className="flex items-center gap-1.5 font-bold text-stone-200">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Mode Terrain Simplifié</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleOffline}
              className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 border transition cursor-pointer ${
                isOffline
                  ? 'bg-amber-950 text-amber-300 border-amber-600'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-700'
              }`}
            >
              {isOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              {isOffline ? 'Hors-Ligne' : '4G En Ligne'}
            </button>
            <span>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Sync queue banner if offline items */}
        {offlineQueue.length > 0 && (
          <div className="mt-3 p-2.5 bg-amber-900/40 border border-amber-600/50 rounded-xl flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <span>{offlineQueue.length} action(s) en attente de réseau</span>
            </div>
            <button
              onClick={onSyncOffline}
              className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Sync
            </button>
          </div>
        )}

        {/* Success toast */}
        {successNotice && (
          <div className="mt-3 p-3 bg-emerald-900/80 border border-emerald-500 rounded-xl flex items-center gap-2 text-xs text-emerald-100 animate-in slide-in-from-top">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Sub-modes content */}
        {activeSubMode === 'home' && (
          <div className="mt-4 space-y-4">
            {/* Quick Context Card */}
            <div className="bg-stone-850 p-3.5 rounded-2xl border border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-400 block font-medium">Exploitation active</span>
                <h3 className="text-sm font-bold text-white">{activeParcel?.name}</h3>
                <span className="text-xs text-emerald-400 font-semibold">
                  {activeParcel?.crop} • {activeParcel?.surfaceHa} ha ({activeParcel?.vegetativeStage})
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-900/50 border border-emerald-700/50 flex items-center justify-center text-emerald-300 font-black">
                {activeParcel?.healthScore}%
              </div>
            </div>

            {/* Weather flash */}
            <div className="bg-stone-850 p-3 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-sky-400" />
                <span className="text-stone-300">{weather.condition} ({weather.currentTempC}°C)</span>
              </div>
              <span className="text-[11px] text-amber-400 font-medium">
                Pluie 24h : {weather.rainfallMm24h} mm
              </span>
            </div>

            {/* Big Action Buttons (Optimized for field touches with thumbs) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setActiveSubMode('recolte')}
                className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white flex flex-col items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer min-h-[110px]"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-700 flex items-center justify-center">
                  <Scale className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-wide text-center">
                  Pesée Récolte
                </span>
              </button>

              <button
                onClick={onOpenDiagnosis}
                className="p-4 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 text-white flex flex-col items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer min-h-[110px]"
              >
                <div className="w-12 h-12 rounded-full bg-teal-800 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-amber-300" />
                </div>
                <span className="text-xs font-black uppercase tracking-wide text-center flex items-center gap-1">
                  Photo IA Gemini
                </span>
              </button>

              <button
                onClick={() => setActiveSubMode('depense')}
                className="p-4 rounded-2xl bg-stone-800 hover:bg-stone-750 text-stone-100 flex flex-col items-center justify-center gap-2 border border-stone-700 transition active:scale-95 cursor-pointer min-h-[110px]"
              >
                <div className="w-12 h-12 rounded-full bg-stone-700 flex items-center justify-center text-amber-400">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wide text-center">
                  Noter Dépense
                </span>
              </button>

              <button
                onClick={() => setActiveSubMode('cours')}
                className="p-4 rounded-2xl bg-stone-800 hover:bg-stone-750 text-stone-100 flex flex-col items-center justify-center gap-2 border border-stone-700 transition active:scale-95 cursor-pointer min-h-[110px]"
              >
                <div className="w-12 h-12 rounded-full bg-stone-700 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wide text-center">
                  Cours du Jour
                </span>
              </button>
            </div>

            {/* Quick Live Market Bar */}
            <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                Prix d'Achat Officiels (Campagne 2026)
              </span>
              <div className="space-y-1.5">
                {prices.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <span className="text-stone-300 font-medium">{p.crop}</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {p.currentPriceFcfa} FCFA / {p.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-MODE: Harvest Entry */}
        {activeSubMode === 'recolte' && (
          <form onSubmit={handleSubmitHarvest} className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Scale className="w-4 h-4" /> Enregistrer une Pesée au Champ
              </h3>
              <button
                type="button"
                onClick={() => setActiveSubMode('home')}
                className="text-xs text-stone-400 hover:text-white"
              >
                Annuler
              </button>
            </div>

            <div>
              <label className="text-xs text-stone-300 font-semibold block mb-1">Parcelle récoltée</label>
              <select
                value={selectedParcelId}
                onChange={(e) => setSelectedParcelId(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
              >
                {parcels.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.crop} ({p.surfaceHa} ha)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">Poids Total (Kg)</label>
                <input
                  type="number"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-lg font-bold font-mono text-emerald-400 text-center focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">Nombre de Sacs</label>
                <input
                  type="number"
                  value={bagsCount}
                  onChange={(e) => setBagsCount(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-lg font-bold font-mono text-white text-center focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">Humidité (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={humidity}
                  onChange={(e) => setHumidity(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-sm font-mono text-white text-center focus:border-emerald-500"
                  placeholder="Ex: 7.0%"
                />
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">Grade Qualité</label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
                >
                  <option value="Grade 1 (Supérieur)">Grade 1 (Export)</option>
                  <option value="Grade 2 (Standard)">Grade 2 (Standard)</option>
                  <option value="Rebut/Sous-grade">Rebut</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-[11px] text-stone-400 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Un QR Code de traçabilité unique sera automatiquement généré pour ce lot.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg transition active:scale-98 cursor-pointer"
            >
              Valider la Pesée
            </button>
          </form>
        )}

        {/* SUB-MODE: Cost Entry */}
        {activeSubMode === 'depense' && (
          <form onSubmit={handleSubmitExpense} className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Consigner une Dépense
              </h3>
              <button
                type="button"
                onClick={() => setActiveSubMode('home')}
                className="text-xs text-stone-400 hover:text-white"
              >
                Annuler
              </button>
            </div>

            <div>
              <label className="text-xs text-stone-300 font-semibold block mb-1">Montant (FCFA)</label>
              <input
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-xl font-bold font-mono text-amber-400 text-center focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-stone-300 font-semibold block mb-1">Catégorie</label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-xs text-white focus:border-amber-500"
              >
                <option value="Main d'œuvre">Main d'œuvre (Journaliers / Récolte)</option>
                <option value="Engrais & Amendements">Engrais & Compost</option>
                <option value="Produits Phytosanitaires">Phytosanitaire & Traitement</option>
                <option value="Carburant & Mécanisation">Carburant / Location matériel</option>
                <option value="Transport">Transport vers magasin</option>
                <option value="Conditionnement">Sacs de jute & ficelles</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-stone-300 font-semibold block mb-1">Motif / Détails</label>
              <input
                type="text"
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                placeholder="Ex: 5 ouvriers pour désherbage"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-xs text-white focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-stone-300 font-semibold block mb-1">Mode de règlement</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Wave', 'Orange Money', 'MTN MoMo', 'Cash'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaidVia(m)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      paidVia === m
                        ? 'bg-amber-500 text-stone-950 border-amber-400'
                        : 'bg-stone-950 text-stone-300 border-stone-800'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg transition active:scale-98 cursor-pointer"
            >
              Enregistrer la Dépense
            </button>
          </form>
        )}

        {/* SUB-MODE: Market Prices */}
        {activeSubMode === 'cours' && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Cours Officiels du Marché
              </h3>
              <button
                type="button"
                onClick={() => setActiveSubMode('home')}
                className="text-xs text-stone-400 hover:text-white"
              >
                Retour
              </button>
            </div>

            <div className="divide-y divide-stone-800">
              {prices.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">{p.crop}</span>
                    <span className="text-[10px] text-stone-400">{p.referenceMarket}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400 font-mono block">
                      {p.currentPriceFcfa} FCFA / {p.unit}
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${
                        p.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {p.change24h >= 0 ? `+${p.change24h}%` : `${p.change24h}%`} en 24h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
