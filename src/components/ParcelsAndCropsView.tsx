import React, { useState } from 'react';
import {
  Sprout,
  Users,
  MapPin,
  Plus,
  Search,
  Filter,
  Camera,
  CheckCircle2,
  Calendar,
  Layers,
  Droplet,
  Globe,
  Sparkles,
  Phone,
  Building,
} from 'lucide-react';
import { Producer, Cooperative, Parcel } from '../types';

interface ParcelsAndCropsViewProps {
  producers: Producer[];
  cooperatives: Cooperative[];
  parcels: Parcel[];
  onAddProducer: (producer: Omit<Producer, 'id'>) => void;
  onAddCooperative: (cooperative: Omit<Cooperative, 'id'>) => void;
  onAddParcel: (parcel: Omit<Parcel, 'id'>) => void;
  onOpenDiagnosisForParcel: (parcel: Parcel) => void;
}

export const ParcelsAndCropsView: React.FC<ParcelsAndCropsViewProps> = ({
  producers,
  cooperatives,
  parcels,
  onAddProducer,
  onAddCooperative,
  onAddParcel,
  onOpenDiagnosisForParcel,
}) => {
  const [activeTab, setActiveTab] = useState<'parcelles' | 'producteurs' | 'cooperatives'>('parcelles');
  const [searchQuery, setSearchQuery] = useState('');
  const [cropFilter, setCropFilter] = useState('all');

  // New Parcel Modal State
  const [showAddParcelModal, setShowAddParcelModal] = useState(false);
  const [newParcelName, setNewParcelName] = useState('');
  const [newProducerId, setNewProducerId] = useState(producers[0]?.id || '');
  const [newCrop, setNewCrop] = useState('Cacao Fèves');
  const [newVariety, setNewVariety] = useState('Mercedes Hybride');
  const [newSurfaceHa, setNewSurfaceHa] = useState('3.5');
  const [newSoilType, setNewSoilType] = useState<'Argileux' | 'Sableux' | 'Limoneux' | 'Volcanique' | 'Alluvionnaire'>('Argileux');
  const [newIrrigation, setNewIrrigation] = useState<'Pluviale' | 'Goutte-à-goutte' | 'Aspersion' | 'Gravitaire'>('Pluviale');

  // New Producer Modal State
  const [showAddProducerModal, setShowAddProducerModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPhone, setNewProdPhone] = useState('+225 07 ');
  const [newProdCoopId, setNewProdCoopId] = useState(cooperatives[0]?.id || '');
  const [newProdVillage, setNewProdVillage] = useState('');
  const [newProdSurface, setNewProdSurface] = useState('5.0');

  // New Cooperative Modal State
  const [showAddCoopModal, setShowAddCoopModal] = useState(false);
  const [newCoopName, setNewCoopName] = useState('');
  const [newCoopCode, setNewCoopCode] = useState('');
  const [newCoopCountry, setNewCoopCountry] = useState('Côte d\'Ivoire');
  const [newCoopRegion, setNewCoopRegion] = useState('Nawa (Soubré)');
  const [newCoopHeadquarters, setNewCoopHeadquarters] = useState('');
  const [newCoopPresident, setNewCoopPresident] = useState('');
  const [newCoopPhone, setNewCoopPhone] = useState('+225 07 ');
  const [newCoopMembers, setNewCoopMembers] = useState('180');
  const [newCoopParcelsHa, setNewCoopParcelsHa] = useState('520');
  const [newCoopStockTons, setNewCoopStockTons] = useState('95');
  const [newCoopMmProvider1, setNewCoopMmProvider1] = useState<'Wave' | 'Orange Money' | 'MTN MoMo' | 'Moov Money'>('Wave');
  const [newCoopMmNumber1, setNewCoopMmNumber1] = useState('+225 07 ');
  const [newCoopMmProvider2, setNewCoopMmProvider2] = useState<'Wave' | 'Orange Money' | 'MTN MoMo' | 'Moov Money'>('Orange Money');
  const [newCoopMmNumber2, setNewCoopMmNumber2] = useState('+225 05 ');

  const filteredParcels = parcels.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.producerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.crop.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCrop = cropFilter === 'all' || p.crop === cropFilter;
    return matchesQuery && matchesCrop;
  });

  const filteredCooperatives = cooperatives.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q) ||
      c.headquarters.toLowerCase().includes(q) ||
      c.presidentName.toLowerCase().includes(q)
    );
  });

  const handleCreateParcel = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = producers.find((p) => p.id === newProducerId) || producers[0];

    onAddParcel({
      producerId: prod.id,
      producerName: prod.name,
      cooperativeId: prod.cooperativeId,
      name: newParcelName || `Parcelle ${prod.name.split(' ')[0]}`,
      crop: newCrop,
      variety: newVariety,
      surfaceHa: Number(newSurfaceHa) || 1,
      soilType: newSoilType,
      irrigation: newIrrigation,
      coordinates: {
        lat: 5.78 + (Math.random() - 0.5) * 0.1,
        lng: -6.59 + (Math.random() - 0.5) * 0.1,
      },
      plantingDate: new Date().toISOString().split('T')[0],
      vegetativeStage: 'Croissance',
      healthScore: 85,
      status: 'Actif',
    });

    setShowAddParcelModal(false);
    setNewParcelName('');
  };

  const handleCreateProducer = (e: React.FormEvent) => {
    e.preventDefault();
    const coop = cooperatives.find((c) => c.id === newProdCoopId) || cooperatives[0];

    onAddProducer({
      name: newProdName,
      phone: newProdPhone,
      cooperativeId: coop?.id || 'coop-01',
      cooperativeName: coop?.name || 'Coopérative Locale',
      country: coop?.country || 'Côte d\'Ivoire',
      region: coop?.region || 'Sud-Ouest',
      village: newProdVillage || 'Secteur rural',
      surfaceTotalHa: Number(newProdSurface) || 2,
      activeParcelsCount: 1,
      certifications: ['Traçabilité AGRILINK'],
      joinedYear: new Date().getFullYear(),
    });

    setShowAddProducerModal(false);
    setNewProdName('');
  };

  const handleCreateCooperative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoopName.trim()) return;

    const generatedCode = newCoopCode.trim() || newCoopName.substring(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '');

    const mobileMoneyAccounts: { provider: 'Wave' | 'Orange Money' | 'MTN MoMo' | 'Moov Money'; number: string }[] = [];
    if (newCoopMmNumber1.trim().length > 6) {
      mobileMoneyAccounts.push({ provider: newCoopMmProvider1, number: newCoopMmNumber1.trim() });
    }
    if (newCoopMmNumber2.trim().length > 6) {
      mobileMoneyAccounts.push({ provider: newCoopMmProvider2, number: newCoopMmNumber2.trim() });
    }
    if (mobileMoneyAccounts.length === 0) {
      mobileMoneyAccounts.push({ provider: 'Wave', number: newCoopPhone });
    }

    onAddCooperative({
      name: newCoopName.trim(),
      code: generatedCode,
      country: newCoopCountry,
      region: newCoopRegion,
      headquarters: newCoopHeadquarters.trim() || `${newCoopRegion} Centre`,
      presidentName: newCoopPresident.trim() || 'Président du Conseil',
      contactPhone: newCoopPhone.trim(),
      membersCount: Number(newCoopMembers) || 1,
      totalParcelsHa: Number(newCoopParcelsHa) || 10,
      totalStockTons: Number(newCoopStockTons) || 0,
      mobileMoneyAccounts,
    });

    setShowAddCoopModal(false);
    setNewCoopName('');
    setNewCoopCode('');
    setNewCoopHeadquarters('');
    setNewCoopPresident('');
    setNewCoopPhone('+225 07 ');
    setNewCoopMembers('180');
    setNewCoopParcelsHa('520');
    setNewCoopStockTons('95');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-display">
            Gestion du Bassin Agricole & Parcelles
          </h2>
          <p className="text-xs text-stone-400">
            Cadastre rural, pédologie, coopératives agricoles et sociétaires
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'parcelles' && (
            <button
              onClick={() => setShowAddParcelModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nouvelle Parcelle
            </button>
          )}
          {activeTab === 'producteurs' && (
            <button
              onClick={() => setShowAddProducerModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nouveau Producteur
            </button>
          )}
          {activeTab === 'cooperatives' && (
            <button
              onClick={() => setShowAddCoopModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Building className="w-4 h-4" /> Nouvelle Coopérative
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex border-b border-stone-800 text-xs font-semibold gap-4">
        <button
          onClick={() => setActiveTab('parcelles')}
          className={`pb-3 px-1 border-b-2 transition cursor-pointer ${
            activeTab === 'parcelles'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          Parcelles Déclarées ({parcels.length})
        </button>
        <button
          onClick={() => setActiveTab('producteurs')}
          className={`pb-3 px-1 border-b-2 transition cursor-pointer ${
            activeTab === 'producteurs'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          Producteurs & Membres ({producers.length})
        </button>
        <button
          onClick={() => setActiveTab('cooperatives')}
          className={`pb-3 px-1 border-b-2 transition cursor-pointer ${
            activeTab === 'cooperatives'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          Coopératives Agricoles ({cooperatives.length})
        </button>
      </div>

      {/* TAB 1: PARCELS LIST */}
      {activeTab === 'parcelles' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="Rechercher une parcelle, un producteur ou une culture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Toutes les cultures</option>
                <option value="Cacao Fèves">Cacao Fèves</option>
                <option value="Café Robusta">Café Robusta</option>
                <option value="Noix de Cajou (Anacarde)">Noix de Cajou</option>
                <option value="Maïs Blanc">Maïs Blanc</option>
              </select>
            </div>
          </div>

          {/* Parcels Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParcels.map((parcel) => (
              <div
                key={parcel.id}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-4.5 shadow-sm space-y-3.5 hover:border-stone-700 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {parcel.crop}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">{parcel.name}</h3>
                    <p className="text-xs text-stone-400">{parcel.producerName}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-400 font-mono block">
                      {parcel.surfaceHa} ha
                    </span>
                    <span className="text-[10px] text-stone-500">Superficie</span>
                  </div>
                </div>

                {/* Key Technical Data */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-850 p-2.5 rounded-xl border border-stone-800">
                  <div>
                    <span className="text-stone-400 block">Sol / Pédologie :</span>
                    <strong className="text-stone-200">{parcel.soilType}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Irrigation :</span>
                    <strong className="text-stone-200">{parcel.irrigation}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Stade :</span>
                    <strong className="text-amber-400">{parcel.vegetativeStage}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Score Santé :</span>
                    <strong className="text-emerald-400">{parcel.healthScore}%</strong>
                  </div>
                </div>

                {/* GPS Coordinates and actions */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-1 text-[11px] text-stone-400 font-mono">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span>
                      {parcel.coordinates.lat.toFixed(4)}, {parcel.coordinates.lng.toFixed(4)}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenDiagnosisForParcel(parcel)}
                    className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-750 text-emerald-400 hover:text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-emerald-500/20 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Diagnostic IA</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCERS LIST */}
      {activeTab === 'producteurs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {producers.map((prod) => (
            <div
              key={prod.id}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-stone-700 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-900/60 border border-emerald-600 text-emerald-300 flex items-center justify-center font-bold text-sm">
                  {prod.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{prod.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-stone-400">
                    <Phone className="w-3 h-3 text-stone-500" />
                    <span>{prod.phone}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-800">
                  <span className="text-stone-400">Coopérative :</span>
                  <span className="text-stone-200 font-semibold">{prod.cooperativeName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800">
                  <span className="text-stone-400">Localité / Village :</span>
                  <span className="text-stone-200">
                    {prod.village} ({prod.region})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800">
                  <span className="text-stone-400">Superficie totale :</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    {prod.surfaceTotalHa} ha
                  </span>
                </div>
              </div>

              {/* Certifications badges */}
              <div className="space-y-1">
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">
                  Certifications Vérifiées
                </span>
                <div className="flex flex-wrap gap-1">
                  {(prod.certifications || []).map((c, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: COOPERATIVES LIST */}
      {activeTab === 'cooperatives' && (
        <div className="space-y-4">
          {/* Header toolbar with search & quick add button */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="Rechercher par nom, sigle, région, siège ou président..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={() => setShowAddCoopModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow transition cursor-pointer shrink-0"
            >
              <Building className="w-4 h-4" /> Enregistrer une Coopérative
            </button>
          </div>

          {/* Quick Stats overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-900/60 border border-stone-800 rounded-xl p-3">
            <div className="text-center sm:text-left sm:pl-2">
              <span className="text-[10px] text-stone-400 block font-medium">Total Coopératives</span>
              <span className="text-base font-bold text-white">{cooperatives.length}</span>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-stone-400 block font-medium">Sociétaires Cumulés</span>
              <span className="text-base font-bold text-emerald-400">
                {cooperatives.reduce((acc, c) => acc + (c.membersCount || 0), 0)}
              </span>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-stone-400 block font-medium">Superficies Rattachées</span>
              <span className="text-base font-bold text-teal-400">
                {cooperatives.reduce((acc, c) => acc + (c.totalParcelsHa || 0), 0)} ha
              </span>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-stone-400 block font-medium">Stocks en Entrepôt</span>
              <span className="text-base font-bold text-amber-400">
                {cooperatives.reduce((acc, c) => acc + (c.totalStockTons || 0), 0)} T
              </span>
            </div>
          </div>

          {filteredCooperatives.length === 0 ? (
            <div className="text-center py-12 bg-stone-900/40 border border-dashed border-stone-800 rounded-2xl p-6">
              <Building className="w-10 h-10 text-stone-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-stone-300">Aucune coopérative trouvée</p>
              <p className="text-xs text-stone-500 mt-1">
                Ajustez votre recherche ou enregistrez une nouvelle coopérative partenaire.
              </p>
              <button
                onClick={() => setShowAddCoopModal(true)}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Enregistrer une Coopérative
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCooperatives.map((coop) => (
                <div
                  key={coop.id}
                  className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-stone-700 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-stone-800 rounded text-stone-300">
                          {coop.code}
                        </span>
                        <span className="text-[10px] font-medium text-emerald-400">
                          {coop.country}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{coop.name}</h3>
                      <p className="text-xs text-stone-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-500" />
                        {coop.headquarters} ({coop.region})
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center text-emerald-400 shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-stone-850 p-3 rounded-xl border border-stone-800 text-center">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Membres</span>
                      <span className="text-sm font-bold text-white">{coop.membersCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Surfaces</span>
                      <span className="text-sm font-bold text-emerald-400">{coop.totalParcelsHa} ha</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Stocks</span>
                      <span className="text-sm font-bold text-amber-400">{coop.totalStockTons} T</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-stone-400 block">
                      Président(e) du Conseil : <strong className="text-stone-200">{coop.presidentName}</strong>
                    </span>
                    <span className="text-stone-400 block flex items-center gap-1">
                      <Phone className="w-3 h-3 text-stone-500" />
                      Contact officiel : <strong className="text-stone-200">{coop.contactPhone}</strong>
                    </span>
                  </div>

                  {/* Mobile money accounts */}
                  <div className="pt-2 border-t border-stone-800 space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                      Canaux de règlement Mobile Money
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(coop.mobileMoneyAccounts || []).map((acc, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 bg-stone-950 rounded text-emerald-300 border border-stone-800 font-mono"
                        >
                          {acc.provider}: {acc.number}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Parcel */}
      {showAddParcelModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-stone-100 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" /> Ajouter une Nouvelle Parcelle
            </h3>

            <form onSubmit={handleCreateParcel} className="space-y-3">
              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Nom de la parcelle
                </label>
                <input
                  type="text"
                  placeholder="Ex: Parcelle Est — Cacao Forastero"
                  value={newParcelName}
                  onChange={(e) => setNewParcelName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Producteur titulaire
                </label>
                <select
                  value={newProducerId}
                  onChange={(e) => setNewProducerId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                >
                  {producers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.village})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">Culture</label>
                  <select
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  >
                    <option value="Cacao Fèves">Cacao Fèves</option>
                    <option value="Café Robusta">Café Robusta</option>
                    <option value="Noix de Cajou (Anacarde)">Noix de Cajou</option>
                    <option value="Maïs Blanc">Maïs Blanc</option>
                    <option value="Manioc Cossettes">Manioc Cossettes</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Superficie (Ha)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newSurfaceHa}
                    onChange={(e) => setNewSurfaceHa(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">Type de Sol</label>
                  <select
                    value={newSoilType}
                    onChange={(e) => setNewSoilType(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  >
                    <option value="Argileux">Argileux</option>
                    <option value="Limoneux">Limoneux</option>
                    <option value="Sableux">Sableux</option>
                    <option value="Alluvionnaire">Alluvionnaire</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">Irrigation</label>
                  <select
                    value={newIrrigation}
                    onChange={(e) => setNewIrrigation(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  >
                    <option value="Pluviale">Pluviale (Pluie)</option>
                    <option value="Goutte-à-goutte">Goutte-à-goutte</option>
                    <option value="Aspersion">Aspersion</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddParcelModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow cursor-pointer"
                >
                  Enregistrer la Parcelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Producer */}
      {showAddProducerModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-stone-100 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" /> Inscrire un Nouveau Producteur
            </h3>

            <form onSubmit={handleCreateProducer} className="space-y-3">
              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Nom et Prénom complets
                </label>
                <input
                  type="text"
                  placeholder="Ex: Koffi Kouamé Jean"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Numéro de Téléphone (Mobile Money / SMS)
                  </label>
                  <input
                    type="text"
                    value={newProdPhone}
                    onChange={(e) => setNewProdPhone(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Superficie totale (Ha)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newProdSurface}
                    onChange={(e) => setNewProdSurface(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Coopérative d'attachement
                  </label>
                  <select
                    value={newProdCoopId}
                    onChange={(e) => setNewProdCoopId(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  >
                    {cooperatives.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Village / Localité
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Campement Koffikro"
                    value={newProdVillage}
                    onChange={(e) => setNewProdVillage(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddProducerModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow cursor-pointer"
                >
                  Inscrire le Membre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Cooperative */}
      {showAddCoopModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 text-stone-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-400" /> Enregistrer une Nouvelle Coopérative Agricole
              </h3>
              <button
                onClick={() => setShowAddCoopModal(false)}
                className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-stone-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCooperative} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Dénomination Sociale / Nom Officiel <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Coopérative Agricole des Producteurs de Soubré"
                    value={newCoopName}
                    onChange={(e) => setNewCoopName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Sigle / Code d'Identification
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: COOPAS"
                    value={newCoopCode}
                    onChange={(e) => setNewCoopCode(e.target.value.toUpperCase())}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Pays <span className="text-emerald-400">*</span>
                  </label>
                  <select
                    value={newCoopCountry}
                    onChange={(e) => setNewCoopCountry(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  >
                    <option value="Côte d'Ivoire">Côte d'Ivoire (RCI)</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Cameroun">Cameroun</option>
                    <option value="Guinée">Guinée</option>
                    <option value="Togo">Togo</option>
                    <option value="Bénin">Bénin</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Sénégal">Sénégal</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Région / Préfecture <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Nawa (Soubré) ou Haut-Sassandra"
                    value={newCoopRegion}
                    onChange={(e) => setNewCoopRegion(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Siège Social / Localité <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Soubré Centre, Quartier Résidentiel"
                    value={newCoopHeadquarters}
                    onChange={(e) => setNewCoopHeadquarters(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Président(e) du Conseil d'Administration / Représentant <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: M. N'Goran Kouamé"
                    value={newCoopPresident}
                    onChange={(e) => setNewCoopPresident(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Numéro de Téléphone Officiel (SMS / Appel) <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCoopPhone}
                    onChange={(e) => setNewCoopPhone(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Volume & Scale */}
              <div className="grid grid-cols-3 gap-3 bg-stone-950/70 p-3 rounded-xl border border-stone-800">
                <div>
                  <label className="text-[11px] text-stone-400 font-medium block mb-1">
                    Nombre d'adhérents (Membres)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newCoopMembers}
                    onChange={(e) => setNewCoopMembers(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-stone-400 font-medium block mb-1">
                    Superficie totale rattachée (Ha)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={newCoopParcelsHa}
                    onChange={(e) => setNewCoopParcelsHa(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-stone-400 font-medium block mb-1">
                    Stock initial en magasin (T)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newCoopStockTons}
                    onChange={(e) => setNewCoopStockTons(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Mobile Money Integration */}
              <div className="space-y-2 pt-2 border-t border-stone-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-stone-300 font-semibold">
                    Canaux de Paiement Mobile Money Officiels
                  </label>
                  <span className="text-[10px] text-stone-400">Pour les règlements instantanés B2B</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex gap-2">
                    <select
                      value={newCoopMmProvider1}
                      onChange={(e) => setNewCoopMmProvider1(e.target.value as any)}
                      className="w-1/3 bg-stone-950 border border-stone-700 rounded-xl px-2 py-2 text-xs text-white focus:border-emerald-500"
                    >
                      <option value="Wave">Wave</option>
                      <option value="Orange Money">Orange</option>
                      <option value="MTN MoMo">MTN MoMo</option>
                      <option value="Moov Money">Moov</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Numéro Mobile Money 1"
                      value={newCoopMmNumber1}
                      onChange={(e) => setNewCoopMmNumber1(e.target.value)}
                      className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={newCoopMmProvider2}
                      onChange={(e) => setNewCoopMmProvider2(e.target.value as any)}
                      className="w-1/3 bg-stone-950 border border-stone-700 rounded-xl px-2 py-2 text-xs text-white focus:border-emerald-500"
                    >
                      <option value="Orange Money">Orange</option>
                      <option value="Wave">Wave</option>
                      <option value="MTN MoMo">MTN MoMo</option>
                      <option value="Moov Money">Moov</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Numéro Mobile Money 2 (optionnel)"
                      value={newCoopMmNumber2}
                      onChange={(e) => setNewCoopMmNumber2(e.target.value)}
                      className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddCoopModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Building className="w-4 h-4" /> Enregistrer la Coopérative
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
