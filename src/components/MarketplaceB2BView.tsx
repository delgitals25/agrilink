import React, { useState } from 'react';
import {
  Store,
  Sparkles,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  Building2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Handshake,
  Tag,
  Clock,
} from 'lucide-react';
import { MarketplaceListing, BuyerDemand, WarehouseStock } from '../types';
import { GeminiService, MatchmakingResult } from '../services/geminiService';
import { formatFcfa, formatNumber } from '../services/storageService';

interface MarketplaceB2BViewProps {
  listings: MarketplaceListing[];
  demands: BuyerDemand[];
  stocks: WarehouseStock[];
  onAddListing: (listing: Omit<MarketplaceListing, 'id'>) => void;
  onInitiateOrderFromMatch: (match: any) => void;
}

export const MarketplaceB2BView: React.FC<MarketplaceB2BViewProps> = ({
  listings,
  demands,
  stocks,
  onAddListing,
  onInitiateOrderFromMatch,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'offres' | 'demandes' | 'matchmaking'>('offres');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchmakingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New listing modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [stockId, setStockId] = useState(stocks[0]?.id || '');
  const [crop, setCrop] = useState('Cacao Fèves');
  const [quantityKg, setQuantityKg] = useState('15000');
  const [unitPriceFcfa, setUnitPriceFcfa] = useState('2100');
  const [minOrderKg, setMinOrderKg] = useState('5000');
  const [incoterm, setIncoterm] = useState<'EXW' | 'FOB' | 'DAP' | 'FCA'>('FCA');

  const filteredListings = listings.filter((l) =>
    l.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDemands = demands.filter((d) =>
    d.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.buyerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRunMatchmaking = async () => {
    setIsMatching(true);
    setError(null);

    try {
      const res = await GeminiService.runB2BMatchmaking({
        availableStocks: stocks,
        buyerDemands: demands,
      });
      setMatchResult(res);
      setActiveSubTab('matchmaking');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Échec du rapprochement offre/demande par IA');
    } finally {
      setIsMatching(false);
    }
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    const st = stocks.find((s) => s.id === stockId) || stocks[0];

    onAddListing({
      sellerId: 'coop-1',
      sellerName: 'COOPAZA Soubré',
      sellerType: 'Coopérative',
      crop,
      variety: st?.variety || 'Tout venant',
      quantityAvailableKg: Number(quantityKg) || 10000,
      unitPriceFcfaKg: Number(unitPriceFcfa) || 2000,
      minimumOrderKg: Number(minOrderKg) || 1000,
      qualityGrade: 'Grade 1 (Supérieur)',
      certifications: ['Rainforest Alliance', 'Traçabilité GPS'],
      location: 'Magasin Central Soubré',
      incoterm,
      publishedDate: new Date().toISOString().split('T')[0],
      status: 'Actif',
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-display flex items-center gap-2">
            <Store className="w-6 h-6 text-emerald-400" />
            Marketplace B2B Agricole & Rapprochement IA
          </h2>
          <p className="text-xs text-stone-400">
            Mise en relation directe entre coopératives productrices et acheteurs industriels
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunMatchmaking}
            disabled={isMatching}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition cursor-pointer"
          >
            {isMatching ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Rapprochement en cours...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>IA Rapprochement Offre / Demande</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Publier une Offre
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-stone-800 text-xs font-semibold gap-4">
        <button
          onClick={() => setActiveSubTab('offres')}
          className={`pb-3 px-1 border-b-2 transition cursor-pointer ${
            activeSubTab === 'offres'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          Offres de Vente Disponibles ({listings.length})
        </button>

        <button
          onClick={() => setActiveSubTab('demandes')}
          className={`pb-3 px-1 border-b-2 transition cursor-pointer ${
            activeSubTab === 'demandes'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          Demandes d'Achat Industriels ({demands.length})
        </button>

        <button
          onClick={() => setActiveSubTab('matchmaking')}
          className={`pb-3 px-1 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'matchmaking'
              ? 'border-amber-400 text-amber-400 font-bold'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Rapprochements Intelligents IA {matchResult ? `(${matchResult.matches.length})` : ''}
        </button>
      </div>

      {/* SUB-TAB 1: OFFRES DE VENTE */}
      {activeSubTab === 'offres' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3.5 hover:border-stone-700 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {listing.crop}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1.5">{listing.variety}</h3>
                      <p className="text-xs text-stone-400">{listing.sellerName}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-emerald-400 font-mono block">
                        {listing.unitPriceFcfaKg} FCFA
                      </span>
                      <span className="text-[10px] text-stone-400">par Kilogramme ({listing.incoterm})</span>
                    </div>
                  </div>

                  <div className="bg-stone-850 p-3 rounded-xl border border-stone-800 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Tonnage Dispo :</span>
                      <strong className="text-white font-mono">
                        {formatNumber(listing.quantityAvailableKg / 1000, 1)} Tonnes
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Commande mini :</span>
                      <span className="text-stone-300 font-mono">
                        {formatNumber(listing.minimumOrderKg / 1000, 1)} Tonnes
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Emplacement :</span>
                      <span className="text-stone-300">{listing.location}</span>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(listing.certifications || []).map((c, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700 flex items-center gap-1"
                      >
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onInitiateOrderFromMatch) {
                      onInitiateOrderFromMatch({
                        buyerName: 'Acheteur Agréé B2B',
                        crop: listing.crop,
                        quantityKg: listing.quantityKg,
                        targetPriceFcfaKg: listing.unitPriceFcfa,
                        deliveryLocation: listing.location,
                      });
                    }
                  }}
                  className="w-full py-2 bg-stone-800 hover:bg-emerald-700 text-stone-200 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Engager la transaction</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DEMANDES D'ACHAT */}
      {activeSubTab === 'demandes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDemands.map((demand) => (
            <div
              key={demand.id}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3.5 hover:border-stone-700 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                    Demande Acheteur
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1.5">{demand.crop}</h3>
                  <p className="text-xs text-stone-400">{demand.buyerName}</p>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-white font-mono block">
                    {demand.targetPriceFcfaKg} FCFA
                  </span>
                  <span className="text-[10px] text-stone-400">Prix cible / kg</span>
                </div>
              </div>

              <div className="bg-stone-850 p-3 rounded-xl border border-stone-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-400">Volume Recherché :</span>
                  <strong className="text-emerald-400 font-mono">
                    {formatNumber(demand.quantityRequiredKg / 1000, 1)} Tonnes
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Lieu de livraison :</span>
                  <span className="text-stone-300">{demand.deliveryLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Date limite :</span>
                  <span className="text-amber-400 font-medium">{demand.deadlineDate}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                  Exigences Qualité
                </span>
                <div className="flex flex-wrap gap-1">
                  {(demand.requiredCertifications || []).map((cert, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 3: MATCHMAKING RESULTS */}
      {activeSubTab === 'matchmaking' && (
        <div className="space-y-4">
          {!matchResult ? (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
              <h3 className="text-base font-bold text-white">
                Rapprochement Intelligent Offre / Demande
              </h3>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Gemini analyse les tonnes en magasin, les distances de transport, les certifications et les
                prix cibles pour vous proposer les transactions les plus rentables.
              </p>
              <button
                onClick={handleRunMatchmaking}
                disabled={isMatching}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                {isMatching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Handshake className="w-4 h-4" />}
                Lancer l'Algorithme de Rapprochement
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Insight banner */}
              <div className="p-4 bg-gradient-to-r from-emerald-950 to-stone-900 border border-emerald-800/80 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-stone-200">
                  <h4 className="font-bold text-white">Analyse Macro Marché Gemini :</h4>
                  <p className="leading-relaxed">{matchResult.marketInsight}</p>
                </div>
              </div>

              {/* Matches list */}
              <div className="space-y-3">
                {matchResult.matches.map((m, idx) => (
                  <div
                    key={idx}
                    className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 flex items-center justify-center font-black text-sm">
                          {m.compatibilityScore}%
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                            Match Parfait Recommandé
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            Offre {m.stockId} ⇄ Demande {m.buyerDemandId}
                          </h4>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-amber-400 font-mono block">
                          Négociation suggérée : {m.suggestedNegotiationPriceFcfa} FCFA / kg
                        </span>
                        <span className="text-[10px] text-stone-400">Optimisé pour marge producteur</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-stone-850 p-3.5 rounded-xl border border-stone-800">
                      <div>
                        <span className="text-stone-400 font-semibold block">Justification économique :</span>
                        <p className="text-stone-300 mt-0.5">{m.matchReason}</p>
                      </div>
                      <div>
                        <span className="text-stone-400 font-semibold block">Synergie transport & corridor :</span>
                        <p className="text-emerald-300 mt-0.5">{m.logisticsSynergy}</p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => onInitiateOrderFromMatch(m)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition active:scale-95"
                      >
                        <Handshake className="w-4 h-4" />
                        <span>Créer le Bon de Commande B2B</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Listing */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-stone-100 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" /> Publier une Offre de Vente B2B
            </h3>

            <form onSubmit={handleCreateListing} className="space-y-3">
              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">Lot en stock</label>
                <select
                  value={stockId}
                  onChange={(e) => setStockId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                >
                  {stocks.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.crop} ({s.batchCode}) — {(s.quantityKg / 1000).toFixed(1)} T
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Quantité (Kg)
                  </label>
                  <input
                    type="number"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Prix Demandé (FCFA/Kg)
                  </label>
                  <input
                    type="number"
                    value={unitPriceFcfa}
                    onChange={(e) => setUnitPriceFcfa(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Minimum Commande (Kg)
                  </label>
                  <input
                    type="number"
                    value={minOrderKg}
                    onChange={(e) => setMinOrderKg(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">Incoterm</label>
                  <select
                    value={incoterm}
                    onChange={(e) => setIncoterm(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  >
                    <option value="FCA">FCA (Franco Transporteur)</option>
                    <option value="EXW">EXW (Départ Magasin)</option>
                    <option value="FOB">FOB (Bord Navire Port)</option>
                    <option value="DAP">DAP (Rendu Lieu de Destination)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow cursor-pointer"
                >
                  Publier l'Offre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
