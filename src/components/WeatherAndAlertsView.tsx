import React, { useState } from 'react';
import {
  CloudRain,
  Sun,
  CloudLightning,
  Send,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Smartphone,
  Calendar,
  Clock,
  Wind,
  Droplets,
  Thermometer,
} from 'lucide-react';
import { WeatherData, AgrilinkAlert, SmsOutboxItem } from '../types';

interface WeatherAndAlertsViewProps {
  weather: WeatherData;
  alerts: AgrilinkAlert[];
  smsOutbox: SmsOutboxItem[];
  onSendSms: (recipientPhone: string, message: string, category: SmsOutboxItem['category']) => void;
  onDismissAlert: (id: string) => void;
}

const SMS_TEMPLATES = [
  {
    title: 'Alerte Pluie & Séchage Cacao',
    category: 'Météo' as const,
    text: 'AGRILINK METEO: Fortes pluies orageuses prévues cet après-midi (30mm). Bâchez immédiatement vos claies de séchage de fèves.',
  },
  {
    title: 'Avis de Paiement Mobile Money',
    category: 'Paiement' as const,
    text: 'AGRILINK PAIEMENT: Votre coopérative vous a versé 350 000 FCFA par Wave pour la livraison du lot LOT-2026. Ref: WV-94821.',
  },
  {
    title: 'Alerte Ravageur / Surveillance',
    category: 'Diagnostic' as const,
    text: 'AGRILINK AGRO: Risque de pourriture brune accru suite à l\'humidité. Inspectez le bas des troncs de cacaoyers et éliminez les cabosses noires.',
  },
  {
    title: 'Nouveau Prix Campagne Officiel',
    category: 'Prix' as const,
    text: 'AGRILINK INFO: Le prix bord-champ officiel du Cacao est fixé à 1 950 FCFA/kg pour la campagne principale. Ne vendez pas en-dessous.',
  },
];

export const WeatherAndAlertsView: React.FC<WeatherAndAlertsViewProps> = ({
  weather,
  alerts,
  smsOutbox,
  onSendSms,
  onDismissAlert,
}) => {
  const [recipientPhone, setRecipientPhone] = useState('+225 07 48 92 10 33');
  const [smsMessage, setSmsMessage] = useState(SMS_TEMPLATES[0].text);
  const [selectedCategory, setSelectedCategory] = useState<SmsOutboxItem['category']>('Météo');
  const [sentNotice, setSentNotice] = useState(false);

  const handleSendCustomSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsMessage || !recipientPhone) return;

    onSendSms(recipientPhone, smsMessage, selectedCategory);
    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 4000);
  };

  const handleApplyTemplate = (tmpl: typeof SMS_TEMPLATES[0]) => {
    setSmsMessage(tmpl.text);
    setSelectedCategory(tmpl.category);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-display flex items-center gap-2">
            <span>🌦️</span> Météo Agricole & Passerelle SMS Téléphonique
          </h2>
          <p className="text-xs text-stone-400">
            Conseils climatiques contextuels et diffusion d'alertes par SMS vers les zones sans connexion internet
          </p>
        </div>

        <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-xl text-xs">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-stone-300 font-medium">Relais GSM Rural Connecté</span>
        </div>
      </div>

      {/* Main Weather Card & 7-Day Forecast */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400">
              <CloudRain className="w-9 h-9" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Station Agricole • {weather.region}
              </span>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-3xl font-black text-white font-display">
                  {weather.currentTempC}°C
                </span>
                <span className="text-sm font-semibold text-stone-300">
                  {weather.condition}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs w-full md:w-auto">
            <div className="p-2.5 bg-stone-850 rounded-xl border border-stone-800">
              <span className="text-stone-400 block flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-sky-400" /> Pluie 24h
              </span>
              <strong className="text-white text-sm font-mono">{weather.rainfallMm24h} mm</strong>
            </div>

            <div className="p-2.5 bg-stone-850 rounded-xl border border-stone-800">
              <span className="text-stone-400 block flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-stone-400" /> Humidité Air
              </span>
              <strong className="text-white text-sm font-mono">{weather.humidityPercent}%</strong>
            </div>

            <div className="p-2.5 bg-stone-850 rounded-xl border border-stone-800 col-span-2 sm:col-span-1">
              <span className="text-stone-400 block">Séchage en plein air</span>
              <strong className="text-amber-400 text-xs">Déconseillé après 14h</strong>
            </div>
          </div>
        </div>

        {/* Agricultural Notice Box */}
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-stone-200 flex items-start gap-3">
          <Sun className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block">Avis Agronomique Automatisé :</strong>
            <p className="mt-0.5 leading-relaxed text-stone-300">{weather.agriculturalNotice}</p>
          </div>
        </div>

        {/* 7-Day Forecast Row */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-3">
            Prévisions Météorologiques Décadaires (7 Jours)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {(weather?.forecast7Days ||
              weather?.dailyForecast?.map((df) => ({
                day: df.day,
                tempMax: df.maxTemp,
                tempMin: df.minTemp,
                rainProbability: df.rainProb,
                condition: df.condition,
              })) ||
              []
            ).map((fc, idx) => (
              <div
                key={idx}
                className="bg-stone-850 p-3 rounded-xl border border-stone-800 text-center space-y-1.5"
              >
                <span className="text-xs font-bold text-stone-300 block">{fc.day}</span>
                <span className="text-lg block">
                  {fc.condition.includes('Pluie') || fc.condition.includes('Orage')
                    ? '🌧️'
                    : fc.condition.includes('Ensoleillé')
                    ? '☀️'
                    : '⛅'}
                </span>
                <div className="text-xs font-mono font-bold text-white">
                  {fc.tempMax}° / <span className="text-stone-400">{fc.tempMin}°</span>
                </div>
                <span className="text-[10px] text-sky-400 font-semibold block">
                  {fc.rainProbability}% pluie
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: SMS Gateway Dispatcher & Alerts Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: SMS Dispatcher */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              Diffuser une Alerte SMS aux Agriculteurs
            </h3>
            <span className="text-[10px] text-stone-400">Réseau Orange / MTN / Moov</span>
          </div>

          {/* Quick template chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-stone-400 font-semibold block">
              Modèles rapides pré-configurés :
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SMS_TEMPLATES.map((tmpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="text-left p-2 rounded-lg bg-stone-850 hover:bg-stone-800 border border-stone-800 text-xs transition cursor-pointer"
                >
                  <span className="font-bold text-stone-200 block truncate">{tmpl.title}</span>
                  <span className="text-[10px] text-emerald-400">{tmpl.category}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendCustomSms} className="space-y-3 pt-2">
            <div>
              <label className="text-xs text-stone-300 font-semibold block mb-1">
                Numéro Mobile Destinataire
              </label>
              <input
                type="text"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-stone-300 font-semibold">Message SMS (160 car.)</label>
                <span className={`text-[10px] font-mono ${smsMessage.length > 160 ? 'text-amber-400' : 'text-stone-400'}`}>
                  {smsMessage.length} / 160
                </span>
              </div>
              <textarea
                rows={3}
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-200 placeholder-stone-500 focus:border-emerald-500"
                required
              />
            </div>

            {sentNotice && (
              <div className="p-2.5 bg-emerald-950 border border-emerald-600 rounded-xl flex items-center gap-2 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Message SMS transmis au relais GSM avec succès !</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow cursor-pointer transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Expédier le SMS vers le Réseau de Terrain</span>
            </button>
          </form>
        </div>

        {/* Right: SMS Outbox & System Alerts Journal */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            Journal des Notifications SMS Expédiées ({smsOutbox.length})
          </h3>

          <div className="divide-y divide-stone-800 max-h-80 overflow-y-auto">
            {smsOutbox.map((sms) => (
              <div key={sms.id} className="py-2.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-300">{sms.recipientPhone}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-emerald-400">
                      {sms.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {sms.status} • {sms.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed italic">
                  "{sms.message}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
