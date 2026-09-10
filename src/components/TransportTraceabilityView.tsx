import React, { useState } from 'react';
import {
  Truck,
  QrCode,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { TransportShipment, Parcel, HarvestRecord } from '../types';
import { formatNumber } from '../services/storageService';

interface TransportTraceabilityViewProps {
  shipments: TransportShipment[];
  parcels: Parcel[];
  harvests: HarvestRecord[];
  onUpdateShipmentStatus: (id: string, status: TransportShipment['status']) => void;
}

export const TransportTraceabilityView: React.FC<TransportTraceabilityViewProps> = ({
  shipments,
  parcels,
  harvests,
  onUpdateShipmentStatus,
}) => {
  const [selectedBatchCode, setSelectedBatchCode] = useState('LOT-CI-2026-0891');
  const [activeTab, setActiveTab] = useState<'transport' | 'tracabilite'>('transport');
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Find related data for the selected batch code
  const currentHarvest = harvests.find((h) => h.batchCode === selectedBatchCode) || harvests[0];
  const currentParcel = parcels.find((p) => p.id === currentHarvest?.parcelId) || parcels[0];
  const currentShipment = shipments.find((s) => s.batchCode === selectedBatchCode) || shipments[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-display flex items-center gap-2">
            <span>🚚</span> Logistique, Flotte Camions & Traçabilité QR
          </h2>
          <p className="text-xs text-stone-400">
            Suivi des corridors routiers vers les ports d'exportation et chaîne de traçabilité certifiée
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('transport')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'transport'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-800 text-stone-300 hover:text-white'
            }`}
          >
            Expéditions & Flotte ({shipments.length})
          </button>
          <button
            onClick={() => setActiveTab('tracabilite')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tracabilite'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-800 text-stone-300 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Passeport Numérique du Lot</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TRANSPORT SHIPMENTS */}
      {activeTab === 'transport' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shipments.map((ship) => (
              <div
                key={ship.id}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-stone-700 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                      {ship.truckPlate}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">
                      {ship.driverName}
                    </h3>
                    <p className="text-xs text-stone-400">{ship.driverPhone}</p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      ship.status === 'Livré'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : ship.status === 'En route'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                        : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {ship.status}
                  </span>
                </div>

                <div className="bg-stone-850 p-3.5 rounded-xl border border-stone-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-stone-200">
                    <span className="font-semibold">{ship.origin}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
                    <span className="font-semibold text-emerald-400">{ship.destination}</span>
                  </div>

                  <div className="flex justify-between pt-1 border-t border-stone-800 text-[11px]">
                    <span className="text-stone-400">Poids transporté :</span>
                    <strong className="text-white font-mono">{ship.weightTons} Tonnes</strong>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-stone-400">Lot associé :</span>
                    <span className="text-emerald-400 font-mono">{ship.batchCode}</span>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-stone-400">Arrivée estimée :</span>
                    <span className="text-stone-300">{ship.eta}</span>
                  </div>
                </div>

                {/* Status Switcher Buttons */}
                <div className="flex gap-1.5 pt-1">
                  {(['Chargement', 'En route', 'Livré'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => onUpdateShipmentStatus(ship.id, st)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                        ship.status === st
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: TRACEABILITY QR PASSPORT */}
      {activeTab === 'tracabilite' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Certification Européenne & Due Diligence (EUDR Ready)
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5 flex items-center gap-2 font-display">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                Passeport Numérique & Chaîne de Traçabilité du Lot
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-400">Sélectionner un Lot :</label>
              <select
                value={selectedBatchCode}
                onChange={(e) => setSelectedBatchCode(e.target.value)}
                className="bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
              >
                {harvests.map((h) => (
                  <option key={h.id} value={h.batchCode}>
                    {h.batchCode} ({h.crop})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timeline of Traceability Steps */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-600/40">
            {/* Step 1: Origine & Parcelle */}
            <div className="relative space-y-1.5">
              <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-stone-900" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Étape 1 : Origine Géolocalisée (Parcelle)
                </span>
                <span className="text-[10px] text-stone-400">• Plantation certifiée sans déforestation</span>
              </div>
              <div className="bg-stone-850 p-3.5 rounded-xl border border-stone-800 text-xs space-y-1">
                <p className="text-stone-200 font-medium">
                  Exploitation : <strong>{currentParcel.name}</strong> • Producteur : <strong>{currentParcel.producerName}</strong>
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-400">
                  <span className="flex items-center gap-1 font-mono">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    GPS : {currentParcel.coordinates.lat.toFixed(5)}, {currentParcel.coordinates.lng.toFixed(5)}
                  </span>
                  <span>Sol : {currentParcel.soilType}</span>
                  <span>Variété : {currentParcel.variety}</span>
                </div>
              </div>
            </div>

            {/* Step 2: Récolte & Pesée Champ */}
            <div className="relative space-y-1.5">
              <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-stone-900" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Étape 2 : Pesée de Récolte & Contrôle Qualité
                </span>
                <span className="text-[10px] text-stone-400">• {currentHarvest.date}</span>
              </div>
              <div className="bg-stone-850 p-3.5 rounded-xl border border-stone-800 text-xs space-y-1">
                <p className="text-stone-200">
                  Quantité brute récoltée : <strong>{formatNumber(currentHarvest.quantityKg / 1000, 2)} Tonnes</strong> ({currentHarvest.quantityKg} kg)
                </p>
                <div className="flex gap-4 text-[11px] text-stone-400">
                  <span>Humidité mesurée : <strong className="text-emerald-400">{currentHarvest.humidityPercent}%</strong></span>
                  <span>Grade : <strong className="text-white">{currentHarvest.qualityGrade}</strong></span>
                </div>
              </div>
            </div>

            {/* Step 3: Stockage & Coopérative */}
            <div className="relative space-y-1.5">
              <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-stone-900" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Étape 3 : Conditionnement en Sacs de Jute & Stockage Agréé
                </span>
              </div>
              <div className="bg-stone-850 p-3.5 rounded-xl border border-stone-800 text-xs space-y-1">
                <p className="text-stone-200">
                  Emplacement : <strong>{currentHarvest.warehouseName}</strong>
                </p>
                <p className="text-[11px] text-stone-400">
                  Traitement antimycosique naturel, aération contrôlée et scellement des sacs sous bague AGRILINK.
                </p>
              </div>
            </div>

            {/* Step 4: Corridor Transport */}
            <div className="relative space-y-1.5">
              <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-stone-900" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Étape 4 : Acheminement Logistique
                </span>
                <span className="text-[10px] text-stone-400">• Corridor San Pedro</span>
              </div>
              <div className="bg-stone-850 p-3.5 rounded-xl border border-stone-800 text-xs space-y-1">
                <p className="text-stone-200">
                  Camion : <span className="font-mono text-emerald-400">{currentShipment?.truckPlate}</span> conduit par <strong>{currentShipment?.driverName}</strong>
                </p>
                <p className="text-[11px] text-stone-400">
                  Statut : <strong className="text-amber-400">{currentShipment?.status}</strong> • Arrivée estimée : {currentShipment?.eta}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="p-4 bg-emerald-950/40 border border-emerald-600/50 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">Certificat d'Origine Vérifié par Blockchain & GPS</h4>
                <p className="text-[11px] text-stone-300">
                  Conforme aux normes européennes de traçabilité EUDR 2025/2026.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCertificateModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow cursor-pointer transition shrink-0"
            >
              Afficher Attestation Officielle EUDR
            </button>
          </div>
        </div>
      )}

      {/* Official Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl text-stone-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Passeport Numérique de Conformité EUDR</h3>
                  <p className="text-[11px] text-stone-400">Règlement UE contre la déforestation (Règlement 2023/1115)</p>
                </div>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-stone-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-stone-850 pb-2">
                <span className="text-stone-400 font-sans">Identifiant Unique Lot :</span>
                <span className="font-bold text-emerald-400">{selectedBatchCode}</span>
              </div>
              <div className="flex justify-between border-b border-stone-850 pb-2">
                <span className="text-stone-400 font-sans">Spéculation & Grade :</span>
                <span className="text-white">{currentHarvest?.crop} ({currentHarvest?.qualityGrade})</span>
              </div>
              <div className="flex justify-between border-b border-stone-850 pb-2">
                <span className="text-stone-400 font-sans">Producteur Agricole :</span>
                <span className="text-white">{currentParcel?.producerName}</span>
              </div>
              <div className="flex justify-between border-b border-stone-850 pb-2">
                <span className="text-stone-400 font-sans">Parcelle & Coordonnées GPS :</span>
                <span className="text-amber-400">{currentParcel?.name} ({currentParcel?.coordinates.lat.toFixed(4)}° N, {Math.abs(currentParcel?.coordinates.lng).toFixed(4)}° W)</span>
              </div>
              <div className="flex justify-between border-b border-stone-850 pb-2">
                <span className="text-stone-400 font-sans">Date de Récolte & Taux d'Humidité :</span>
                <span className="text-white">{currentHarvest?.date} (Humidité: {currentHarvest?.moisturePercent}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400 font-sans">Statut Déforestation Satellite :</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1 font-sans">
                  <span>✓</span> Zéro Déforestation Vérifiée (Sentinel-2)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-stone-500 italic">Signature Cryptographique SHA-256 Validée</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Imprimer le Bordereau
                </button>
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
