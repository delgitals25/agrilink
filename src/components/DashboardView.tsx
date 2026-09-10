import React, { useState } from 'react';
import {
  Package,
  DollarSign,
  TrendingUp,
  Sprout,
  Users,
  AlertTriangle,
  Scale,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CloudSun,
  ShieldCheck,
  ChevronRight,
  FileText,
} from 'lucide-react';
import {
  Producer,
  Cooperative,
  WarehouseStock,
  HarvestRecord,
  Order,
  CommodityPrice,
  WeatherData,
  AgrilinkAlert,
} from '../types';
import { formatFcfa, formatNumber } from '../services/storageService';

interface DashboardViewProps {
  producers: Producer[];
  cooperatives: Cooperative[];
  stocks: WarehouseStock[];
  harvests: HarvestRecord[];
  orders: Order[];
  prices: CommodityPrice[];
  weather: WeatherData;
  alerts: AgrilinkAlert[];
  onOpenDiagnosis: () => void;
  onOpenReportModal: () => void;
  onOpenForecastModal: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  producers,
  cooperatives,
  stocks,
  harvests,
  orders,
  prices,
  weather,
  alerts,
  onOpenDiagnosis,
  onOpenReportModal,
  onOpenForecastModal,
  onNavigateToTab,
}) => {
  const [trendTimeframe, setTrendTimeframe] = useState<'mensuel' | 'hebdomadaire'>('hebdomadaire');

  // Calculations
  const totalStockKg = stocks.reduce((acc, s) => acc + s.quantityKg, 0);
  const totalStockTons = totalStockKg / 1000;
  const totalStockValueFcfa = stocks.reduce((acc, s) => acc + s.quantityKg * s.unitValueFcfa, 0);

  const totalSalesRevenueFcfa = orders
    .filter((o) => o.status !== 'Demande')
    .reduce((acc, o) => acc + o.totalAmountFcfa, 0);

  const totalHa = producers.reduce((acc, p) => acc + p.surfaceTotalHa, 0);

  // Harvest Trend Mock Aggregation
  const harvestTrendWeeks = [
    { label: 'Sem 33 (Août)', cacao: 12.4, cajou: 18.2, mais: 8.5 },
    { label: 'Sem 34 (Août)', cacao: 15.1, cajou: 22.0, mais: 11.2 },
    { label: 'Sem 35 (Sept)', cacao: 24.8, cajou: 29.5, mais: 14.0 },
    { label: 'Sem 36 (En cours)', cacao: 32.5, cajou: 35.1, mais: 18.4 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Cooperative Identity & Executive AI Report Trigger */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Campagne Principale 2026 / 2027
            </span>
            <span className="text-xs text-stone-400">• Soubré — Nawa — Côte d'Ivoire</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
            Tableau de Bord Exécutif & Ventes en Temps Réel
          </h1>
          <p className="text-xs text-stone-300 max-w-2xl">
            Suivi consolidé de <strong>{producers.length} producteurs</strong>,{' '}
            <strong>{formatNumber(totalStockTons)} tonnes</strong> en magasins et rapprochement avec les
            commandes des exportateurs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenForecastModal}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 border border-stone-700 shadow cursor-pointer transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>IA Prévisions Rendements</span>
          </button>

          <button
            onClick={onOpenReportModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer transition active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Générer Rapport Coopérative</span>
          </button>
        </div>
      </div>

      {/* Primary Key Performance Indicators (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Stocks Disponibles */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4.5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Tonnage Total en Stock
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/50">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-display">
              {formatNumber(totalStockTons, 1)}{' '}
              <span className="text-sm font-semibold text-emerald-400">Tonnes</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Réparti sur 3 entrepôts agréés
            </p>
          </div>
          <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-400">Valeur marchande :</span>
            <span className="font-bold text-stone-200 font-mono">
              {formatFcfa(totalStockValueFcfa)}
            </span>
          </div>
        </div>

        {/* KPI 2: Chiffre d'Affaires Commandes */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4.5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Ventes & Engagements B2B
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center border border-amber-800/50">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-display">
              {formatFcfa(totalSalesRevenueFcfa)}
            </div>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.5% vs campagne précédente</span>
            </p>
          </div>
          <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-400">Commandes actives :</span>
            <span className="font-bold text-stone-200">{orders.length} contrats</span>
          </div>
        </div>

        {/* KPI 3: Superficie & Producteurs */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4.5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Bassin Agricole & Membres
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-950 text-teal-400 flex items-center justify-center border border-teal-800/50">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-display">
              {formatNumber(totalHa, 1)}{' '}
              <span className="text-sm font-semibold text-teal-400">Hectares</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {producers.length} producteurs inscrits
            </p>
          </div>
          <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-400">Certifié Rainforest / Bio :</span>
            <span className="font-bold text-emerald-400">82% des surfaces</span>
          </div>
        </div>

        {/* KPI 4: Qualité & Alertes */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4.5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Contrôle Qualité & Stocks
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-950 text-rose-400 flex items-center justify-center border border-rose-800/50">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-display flex items-center gap-2">
              <span>6.9%</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Humidité OK
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Moyenne hygrométrique sous le seuil max (7.5%)
            </p>
          </div>
          <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-400">Alertes actives :</span>
            <span className="font-bold text-amber-400">
              {alerts.filter((a) => !a.read).length} à traiter
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Harvest Trends Chart & Real-Time Market Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Harvest Trend Visualizer */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Tendances de Récolte Hebdomadaires (Tonnes)
              </h3>
              <p className="text-xs text-stone-400">
                Progression des volumes collectés au fil des semaines de la campagne
              </p>
            </div>

            <div className="flex items-center gap-1 bg-stone-850 p-1 rounded-xl border border-stone-800 text-xs">
              <button
                onClick={() => setTrendTimeframe('hebdomadaire')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  trendTimeframe === 'hebdomadaire'
                    ? 'bg-emerald-600 text-white'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Hebdo
              </button>
              <button
                onClick={() => setTrendTimeframe('mensuel')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  trendTimeframe === 'mensuel'
                    ? 'bg-emerald-600 text-white'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Mois
              </button>
            </div>
          </div>

          {/* Interactive Bar Comparison Visualization */}
          <div className="space-y-4 pt-2">
            {harvestTrendWeeks.map((week, idx) => (
              <div key={idx} className="space-y-1.5 bg-stone-850/50 p-3 rounded-xl border border-stone-800/80">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-200">
                  <span>{week.label}</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    Total : {(week.cacao + week.cajou + week.mais).toFixed(1)} T
                  </span>
                </div>

                {/* Progress bars for 3 crops */}
                <div className="space-y-1">
                  {/* Cacao */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-16 text-stone-400">Cacao :</span>
                    <div className="flex-1 bg-stone-900 rounded-full h-3 overflow-hidden p-0.5">
                      <div
                        className="bg-amber-700 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(week.cacao / 40) * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono text-stone-300">{week.cacao} T</span>
                  </div>

                  {/* Cajou */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-16 text-stone-400">Cajou :</span>
                    <div className="flex-1 bg-stone-900 rounded-full h-3 overflow-hidden p-0.5">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(week.cajou / 40) * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono text-stone-300">{week.cajou} T</span>
                  </div>

                  {/* Maïs */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-16 text-stone-400">Maïs :</span>
                    <div className="flex-1 bg-stone-900 rounded-full h-3 overflow-hidden p-0.5">
                      <div
                        className="bg-yellow-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(week.mais / 40) * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono text-stone-300">{week.mais} T</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-700" /> Cacao Fèves
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Cajou (Anacarde)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Maïs Blanc
              </span>
            </div>
            <button
              onClick={() => onNavigateToTab('stocks')}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              Détails des stocks →
            </button>
          </div>
        </div>

        {/* Right Col: Live Market Quotes (Prix en temps réel) */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>📈</span> Cours Officiels
              </h3>
              <p className="text-xs text-stone-400">Mise à jour en continu</p>
            </div>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-800">
              En direct
            </span>
          </div>

          <div className="divide-y divide-stone-800">
            {prices.map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between hover:bg-stone-850/40 px-2 rounded-lg transition">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-stone-200 block">{p.crop}</span>
                  <span className="text-[10px] text-stone-400">{p.referenceMarket}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-400 font-mono block">
                    {p.currentPriceFcfa} FCFA
                  </span>
                  <span
                    className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 ${
                      p.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {p.change24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {p.change24h >= 0 ? `+${p.change24h}%` : `${p.change24h}%`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Weather card inside right col */}
          <div className="bg-stone-850 p-3.5 rounded-xl border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <CloudSun className="w-4 h-4 text-amber-400" />
                Météo Agricole Soubré
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {weather.currentTempC}°C
              </span>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              {weather.agriculturalNotice}
            </p>
            <div className="text-right pt-1">
              <button
                onClick={() => onNavigateToTab('meteo-sms')}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
              >
                Voir les 7 jours & SMS d'alerte →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Stocks & Orders Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stocks by Warehouse */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              État des Magasins & Lots sous Traçabilité
            </h3>
            <button
              onClick={() => onNavigateToTab('stocks')}
              className="text-xs text-stone-400 hover:text-emerald-400 cursor-pointer"
            >
              Gérer les stocks
            </button>
          </div>

          <div className="divide-y divide-stone-800">
            {stocks.slice(0, 4).map((stk) => (
              <div key={stk.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-200">{stk.crop}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-mono">
                      {stk.batchCode}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400">{stk.warehouseName}</span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-white font-mono block">
                    {(stk.quantityKg / 1000).toFixed(1)} Tonnes
                  </span>
                  <span className="text-[10px] text-emerald-400">
                    Humidité : {stk.humidityPercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders and Deliveries */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>📦</span> Dernières Commandes & Paiements Mobile Money
            </h3>
            <button
              onClick={() => onNavigateToTab('commandes')}
              className="text-xs text-stone-400 hover:text-emerald-400 cursor-pointer"
            >
              Voir commandes
            </button>
          </div>

          <div className="divide-y divide-stone-800">
            {orders.map((ord) => (
              <div key={ord.id} className="py-2.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-200">{ord.orderNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                      {ord.paymentStatus}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400">{ord.buyerName}</span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-stone-100 font-mono block">
                    {formatFcfa(ord.totalAmountFcfa)}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Statut : <strong className="text-amber-400">{ord.status}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
