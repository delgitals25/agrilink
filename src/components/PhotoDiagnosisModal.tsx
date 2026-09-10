import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Send,
  X,
  RefreshCw,
  Info,
  ShieldAlert,
  Calendar,
  FileText,
} from 'lucide-react';
import { Parcel } from '../types';
import { GeminiService, CropDiagnosisResult } from '../services/geminiService';

interface PhotoDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcels: Parcel[];
  initialParcel?: Parcel | null;
  onSmsDispatched: (recipient: string, message: string, crop: string) => void;
}

// Curated realistic sample images for quick evaluation
const SAMPLE_CROP_IMAGES = [
  {
    name: 'Cacaoyer (Jaunissement foliaire)',
    crop: 'Cacao Fèves',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    notes: 'Léger jaunissement sur les feuilles du haut, quelques taches brunes isolées.',
  },
  {
    name: 'Caféier Robusta (Maturation fruits)',
    crop: 'Café Robusta',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    notes: 'Grappes denses de cerises, certaines feuilles présentent des décolorations.',
  },
  {
    name: 'Manioc (Feuilles et tiges)',
    crop: 'Manioc Cossettes',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=600&q=80',
    notes: 'Croissance végétative normale, contrôle de présence d\'acariens.',
  },
  {
    name: 'Maïs (Stade floraison)',
    crop: 'Maïs Blanc',
    imageUrl: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=600&q=80',
    notes: 'Développement vigoureux, vérification de la pyrale et de la chenille légionnaire.',
  },
];

export const PhotoDiagnosisModal: React.FC<PhotoDiagnosisModalProps> = ({
  isOpen,
  onClose,
  parcels,
  initialParcel,
  onSmsDispatched,
}) => {
  const [selectedParcelId, setSelectedParcelId] = useState(initialParcel?.id || parcels[0]?.id || '');
  const [cropType, setCropType] = useState(initialParcel?.crop || 'Cacao Fèves');
  const [recipientPhone, setRecipientPhone] = useState('+225 07 11 22 33 44');
  const [userNotes, setUserNotes] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<CropDiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [smsSentSuccess, setSmsSentSuccess] = useState(false);

  React.useEffect(() => {
    if (initialParcel) {
      setSelectedParcelId(initialParcel.id);
      setCropType(initialParcel.crop);
    }
  }, [initialParcel]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentParcel = parcels.find((p) => p.id === selectedParcelId) || parcels[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImageBase64(base64);
      setPreviewUrl(base64);
      setDiagnosisResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof SAMPLE_CROP_IMAGES[0]) => {
    setCropType(sample.crop);
    setUserNotes(sample.notes);
    setPreviewUrl(sample.imageUrl);
    // Convert url or use fallback base64
    setImageBase64(null); // Server handles simulated or prompt
    setDiagnosisResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setSmsSentSuccess(false);

    try {
      const result = await GeminiService.diagnoseCropPhoto({
        imageBase64: imageBase64 || '',
        mimeType: 'image/jpeg',
        cropType: cropType || currentParcel?.crop || 'Cacao Fèves',
        parcelName: currentParcel?.name || 'Parcelle de terrain',
        userNotes: userNotes,
      });
      setDiagnosisResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Impossible de joindre le modèle d\'analyse IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSms = () => {
    if (!diagnosisResult) return;
    const phone = recipientPhone.trim() || '+225 07 11 22 33 44';
    const msg = diagnosisResult.suggestedSmsSummary || `AGRILINK Diagnostic: Statut ${diagnosisResult.healthStatus} sur votre parcelle. Vérifier 4 étapes dans l'app.`;
    onSmsDispatched(phone, msg, cropType);
    setSmsSentSuccess(true);
    setTimeout(() => setSmsSentSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden text-stone-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Diagnostic Foliaire & Suivi Agronomique IA
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Gemini 3.8 Flash
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Structure l'observation de terrain & propose les prochaines étapes de suivi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 divide-y divide-stone-800/80">
          {/* Step 1: Image source selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                1. Photo de la culture (Feuille, Tige, Fruit, Ravageur)
              </label>
              <span className="text-[11px] text-stone-400">Caméra mobile ou Galerie</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo Upload / Capture Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-700 hover:border-emerald-500 bg-stone-950/60 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[160px] group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="relative w-full h-36 rounded-lg overflow-hidden border border-stone-700">
                    <img
                      src={previewUrl}
                      alt="Crop preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-semibold text-white transition">
                      Changer la photo
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-stone-200">
                      Prendre une photo ou importer
                    </span>
                    <span className="text-[11px] text-stone-400 mt-0.5">
                      JPG, PNG jusqu'à 20 Mo
                    </span>
                  </>
                )}
              </div>

              {/* Sample presets */}
              <div className="flex flex-col justify-between space-y-2">
                <span className="text-xs font-semibold text-stone-400">
                  Ou tester avec un exemple de culture :
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_CROP_IMAGES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className="text-left p-2 rounded-lg bg-stone-800/70 hover:bg-stone-800 border border-stone-700 text-xs transition cursor-pointer flex flex-col justify-between"
                    >
                      <span className="font-bold text-stone-200 truncate">{sample.name}</span>
                      <span className="text-[10px] text-emerald-400">{sample.crop}</span>
                    </button>
                  ))}
                </div>

                {/* Form fields */}
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="text-[11px] text-stone-400 font-medium">Parcelle concernée :</label>
                    <select
                      value={selectedParcelId}
                      onChange={(e) => setSelectedParcelId(e.target.value)}
                      className="w-full mt-1 bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
                    >
                      {parcels.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.crop} — {p.surfaceHa} ha)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-400 font-medium">Observations de terrain :</label>
                    <input
                      type="text"
                      value={userNotes}
                      onChange={(e) => setUserNotes(e.target.value)}
                      placeholder="Ex: Taches jaunes apparues après 3 jours de pluie..."
                      className="w-full mt-1 bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Launch analyze button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer transition active:scale-95"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyse agronomique Gemini en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Lancer l'Analyse d'Observation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div className="pt-4">
              <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Erreur d'analyse :</span> {error}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Diagnosis Result Output */}
          {diagnosisResult && (
            <div className="pt-4 space-y-4 animate-in fade-in duration-300">
              {/* Badges bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-950/80 rounded-xl border border-stone-800">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Culture & Stade</span>
                    <span className="text-xs font-bold text-white">
                      {diagnosisResult.cropIdentified} • {diagnosisResult.phenologicalStage}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                      diagnosisResult.healthStatus === 'Sain'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : diagnosisResult.healthStatus === 'Surveillance'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Statut : {diagnosisResult.healthStatus}</span>
                  </div>

                  <span className="text-xs font-semibold px-2 py-1 bg-stone-800 rounded text-stone-300">
                    Urgence : <strong>{diagnosisResult.urgencyLevel}</strong>
                  </span>
                </div>
              </div>

              {/* Grid: Visual observations & potential stresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-stone-800/50 border border-stone-700/80 rounded-xl p-3.5 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Observations Visuelles Structurées
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-200">
                    {(diagnosisResult.visualObservations || []).map((obs, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-stone-800/50 border border-stone-700/80 rounded-xl p-3.5 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Facteurs de Stress Identifiés
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-200">
                    {(diagnosisResult.potentialStressFactors || []).map((stress, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{stress}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended follow-up steps */}
              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Prochaines Étapes de Suivi Recommandées
                </h4>
                <div className="space-y-2">
                  {(diagnosisResult.recommendedFollowUpSteps || []).map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-stone-900/80 p-2.5 rounded-lg border border-emerald-900/50 flex items-start gap-2.5 text-xs text-stone-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-800 text-emerald-200 text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-[11px] text-stone-400 flex items-center gap-2.5">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="italic">{diagnosisResult.disclaimer}</p>
              </div>

              {/* SMS Dispatch to Remote Farmer */}
              <div className="p-4 bg-stone-850 rounded-xl border border-stone-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      Notifier le producteur par SMS (GSM / Téléphone basique)
                    </span>
                    <p className="text-[11px] text-stone-400 max-w-md">
                      "{diagnosisResult.suggestedSmsSummary}"
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendSms}
                    disabled={smsSentSuccess}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                      smsSentSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                    }`}
                  >
                    {smsSentSuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        SMS Envoyé avec succès !
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Envoyer SMS de Terrain
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-stone-800">
                  <span className="text-xs text-stone-400 whitespace-nowrap">N° Téléphone destinataire :</span>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+225 07..."
                    className="flex-1 max-w-xs bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-850 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
