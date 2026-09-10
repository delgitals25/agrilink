import React, { useState } from 'react';
import {
  Sprout,
  Wifi,
  WifiOff,
  Bell,
  Smartphone,
  LayoutDashboard,
  Store,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
} from 'lucide-react';
import { AgrilinkAlert, OfflineSyncItem } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  offlineQueue: OfflineSyncItem[];
  onSyncOfflineQueue: () => void;
  alerts: AgrilinkAlert[];
  onOpenDiagnosis: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  isOffline,
  onToggleOffline,
  offlineQueue,
  onSyncOfflineQueue,
  alerts,
  onOpenDiagnosis,
}) => {
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);
  const unreadAlerts = alerts.filter((a) => !a.read);

  return (
    <header className="sticky top-0 z-40 bg-stone-900 border-b border-stone-800 text-stone-100 shadow-md">
      {/* Top utility notification strip if offline */}
      {isOffline && (
        <div className="bg-amber-600 px-4 py-1.5 text-xs text-white flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>
              <strong>Mode Hors-Ligne Activé :</strong> Vous travaillez en zone à faible connectivité. Vos pesées et récoltes sont stockées localement ({offlineQueue.length} action(s) en attente).
            </span>
          </div>
          <button
            onClick={onSyncOfflineQueue}
            disabled={offlineQueue.length === 0}
            className="bg-stone-900 hover:bg-black text-amber-300 px-2.5 py-0.5 rounded text-xs font-semibold flex items-center gap-1 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Forcer Synchronisation
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-inner font-black text-lg">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-display">
                  AGRI<span className="text-emerald-400">LINK</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                  Afrique ERP
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                Gestion des stocks & Ventes coopératives
              </p>
            </div>
          </div>

          {/* Quick AI & Mobile actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Gemini Crop Diagnosis trigger */}
            <button
              onClick={onOpenDiagnosis}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all active:scale-95"
              title="Prendre une photo de culture pour analyse Gemini"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              <span className="hidden md:inline">Diagnostic IA Photo</span>
              <span className="md:hidden">IA Photo</span>
            </button>

            {/* Offline Simulation Toggle */}
            <button
              onClick={onToggleOffline}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition cursor-pointer ${
                isOffline
                  ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                  : 'bg-stone-800/80 border-stone-700 text-emerald-400 hover:border-emerald-500'
              }`}
              title="Basculer le mode hors-ligne pour tester la résilience en zone blanche"
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hors-Ligne ({offlineQueue.length})</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Connecté 4G/GSM</span>
                </>
              )}
            </button>

            {/* Alert Bell */}
            <div className="relative">
              <button
                onClick={() => setShowAlertDropdown(!showAlertDropdown)}
                className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 relative cursor-pointer"
                title="Notifications et alertes SMS"
              >
                <Bell className="w-4 h-4" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                )}
                {unreadAlerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
                )}
              </button>

              {/* Alert Dropdown */}
              {showAlertDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl z-50 overflow-hidden text-stone-200">
                  <div className="p-3 bg-stone-800 border-b border-stone-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-100">
                        Alertes en temps réel ({alerts.length})
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400">Passerelle SMS active</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-800">
                    {(alerts || []).map((alt) => (
                      <div key={alt.id} className="p-3 hover:bg-stone-800/60 transition">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              alt.priority === 'Haute'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {alt.priority}
                          </span>
                          <span className="text-[10px] text-stone-400">{alt.timestamp}</span>
                        </div>
                        <h4 className="text-xs font-bold text-stone-100 mt-1">{alt.title}</h4>
                        <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">{alt.message}</p>
                        {alt.smsDispatched && (
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-400">
                            <Send className="w-3 h-3" />
                            <span>Alerte SMS envoyée au réseau de terrain</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="p-2 bg-stone-800/80 border-t border-stone-700 text-center">
                    <button
                      onClick={() => {
                        setShowAlertDropdown(false);
                        setCurrentTab('meteo-sms');
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                    >
                      Voir le journal complet des SMS & météo →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Switch to Field Mobile Mode */}
            <button
              onClick={() => setCurrentTab('terrain')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                currentTab === 'terrain'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                  : 'bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-500/30'
              }`}
              title="Interface simplifiée grand écran tactile pour l'agriculteur au champ"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Mode Terrain</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-stone-800 no-scrollbar text-xs">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-emerald-600 text-white'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Tableau de Bord
          </button>

          <button
            onClick={() => setCurrentTab('terrain')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              currentTab === 'terrain'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Agriculteur Terrain
          </button>

          <button
            onClick={() => setCurrentTab('parcelles')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              currentTab === 'parcelles'
                ? 'bg-emerald-600 text-white'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            Producteurs & Parcelles
          </button>

          <button
            onClick={() => setCurrentTab('stocks')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              currentTab === 'stocks'
                ? 'bg-emerald-600 text-white'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Stocks & Entrepôts
          </button>

          <button
            onClick={() => setCurrentTab('couts')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              currentTab === 'couts'
                ? 'bg-emerald-600 text-white'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <span>💰</span>
            Coûts & Rentabilité IA
          </button>

          <button
            onClick={() => setCurrentTab('marketplace')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              currentTab === 'marketplace'
                ? 'bg-emerald-600 text-white'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            Marketplace B2B
          </button>

          <button
            onClick={() => setCurrentTab('commandes')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              currentTab === 'commandes'
                ? 'bg-emerald-600 text-white'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <span>📦</span>
            Commandes & Mobile Money
          </button>

          <button
            onClick={() => setCurrentTab('transport-tracabilite')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              currentTab === 'transport-tracabilite'
                ? 'bg-emerald-600 text-white'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <span>🚚</span>
            Transport & QR Traçabilité
          </button>

          <button
            onClick={() => setCurrentTab('meteo-sms')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              currentTab === 'meteo-sms'
                ? 'bg-emerald-600 text-white'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <span>🌦️</span>
            Météo & Passerelle SMS
          </button>
        </nav>
      </div>
    </header>
  );
};
