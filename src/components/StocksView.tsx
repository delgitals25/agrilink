import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  QrCode,
  Send,
  Droplets,
  Calendar,
  CheckCircle2,
  Building,
  Plus,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Printer,
  FileText,
  Trash2,
  Edit3,
  Thermometer,
  Wind,
  ShieldCheck,
  Truck,
  TrendingDown,
  Info,
  ChevronRight,
  Layers,
  Activity,
  Maximize2,
  X,
  Share2,
} from 'lucide-react';
import { WarehouseStock, Cooperative, Parcel } from '../types';
import { formatFcfa, formatNumber } from '../services/storageService';

interface StockMovement {
  id: string;
  date: string;
  time: string;
  type: 'Entrée (Récolte/Achat)' | 'Sortie (Expédition B2B)' | 'Transfert Magasin' | 'Ajustement Inventaire';
  batchCode: string;
  crop: string;
  quantityKg: number;
  warehouseName: string;
  operator: string;
  destinationOrOrigin: string;
  referenceDoc: string;
}

const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    date: '2026-09-09',
    time: '14:30',
    type: 'Entrée (Récolte/Achat)',
    batchCode: 'LOT-CC-2026-0901',
    crop: 'Cacao Fèves',
    quantityKg: 3450,
    warehouseName: 'Magasin Central COOPAZA Soubré',
    operator: 'Kouamé Jean (Magasinier en Chef)',
    destinationOrOrigin: 'Parcelle Nawa A — Kouadio Mathieu',
    referenceDoc: 'BR-2026-09-082',
  },
  {
    id: 'mov-2',
    date: '2026-09-08',
    time: '10:15',
    type: 'Sortie (Expédition B2B)',
    batchCode: 'LOT-CC-2026-0901',
    crop: 'Cacao Fèves',
    quantityKg: 10000,
    warehouseName: 'Magasin Central COOPAZA Soubré',
    operator: 'Yao N’Guessan',
    destinationOrOrigin: 'Cargill West Africa (Port San Pedro)',
    referenceDoc: 'BL-CARGILL-0904',
  },
  {
    id: 'mov-3',
    date: '2026-09-07',
    time: '16:00',
    type: 'Entrée (Récolte/Achat)',
    batchCode: 'LOT-CJ-2026-0818',
    crop: 'Noix de Cajou (Anacarde)',
    quantityKg: 12000,
    warehouseName: 'Entrepôt Transit Toumodi',
    operator: 'Bamba Souleymane',
    destinationOrOrigin: 'Coopérative Bélier Toumodi',
    referenceDoc: 'BR-2026-08-119',
  },
  {
    id: 'mov-4',
    date: '2026-09-05',
    time: '09:00',
    type: 'Transfert Magasin',
    batchCode: 'LOT-MB-2026-0828',
    crop: 'Maïs Blanc',
    quantityKg: 5000,
    warehouseName: 'Silo Régional Ziguinchor',
    operator: 'Ousmane Sarr',
    destinationOrOrigin: 'Dépôt Secondaire Oussouye',
    referenceDoc: 'TR-ZIG-003',
  },
];

interface WarehouseSensorInfo {
  id: string;
  name: string;
  location: string;
  capacityTons: number;
  currentStockTons: number;
  temperatureC: number;
  humidityAirPercent: number;
  ventilationStatus: 'Active' | 'En veille' | 'Recommandée urgente';
  pestControlDate: string;
  responsibleName: string;
  phone: string;
  status: 'Optimal' | 'Avertissement' | 'Alerte Hygro';
}

const WAREHOUSES_DATA: WarehouseSensorInfo[] = [
  {
    id: 'wh-1',
    name: 'Magasin Central COOPAZA Soubré',
    location: 'Soubré (Région de la Nawa)',
    capacityTons: 120,
    currentStockTons: 52.7,
    temperatureC: 25.4,
    humidityAirPercent: 68,
    ventilationStatus: 'Active',
    pestControlDate: '2026-08-15',
    responsibleName: 'Kouamé Jean (Chef Dépôt)',
    phone: '+225 07 48 22 11 00',
    status: 'Optimal',
  },
  {
    id: 'wh-2',
    name: 'Entrepôt Transit Toumodi',
    location: 'Toumodi (Région du Bélier)',
    capacityTons: 150,
    currentStockTons: 56.2,
    temperatureC: 28.1,
    humidityAirPercent: 74,
    ventilationStatus: 'Recommandée urgente',
    pestControlDate: '2026-07-20',
    responsibleName: 'Bamba Souleymane',
    phone: '+225 05 33 44 55 66',
    status: 'Alerte Hygro',
  },
  {
    id: 'wh-3',
    name: 'Silo Régional Ziguinchor',
    location: 'Ziguinchor (Casamance)',
    capacityTons: 80,
    currentStockTons: 18.4,
    temperatureC: 26.8,
    humidityAirPercent: 65,
    ventilationStatus: 'En veille',
    pestControlDate: '2026-08-01',
    responsibleName: 'Ousmane Sarr',
    phone: '+221 77 123 45 67',
    status: 'Optimal',
  },
  {
    id: 'wh-4',
    name: 'Terminal d\'Exportation San Pedro',
    location: 'Zone Portuaire San Pedro',
    capacityTons: 300,
    currentStockTons: 145.0,
    temperatureC: 27.2,
    humidityAirPercent: 71,
    ventilationStatus: 'Active',
    pestControlDate: '2026-08-28',
    responsibleName: 'Konan Yao Albert',
    phone: '+225 01 99 88 77 66',
    status: 'Optimal',
  },
];

interface StocksViewProps {
  stocks: WarehouseStock[];
  onUpdateStock: (updated: WarehouseStock) => void;
  onAddStock?: (newStock: WarehouseStock) => void;
  onDeleteStock?: (stockId: string) => void;
  onSendSmsAlert: (phone: string, text: string) => void;
  cooperatives?: Cooperative[];
  parcels?: Parcel[];
}

export const StocksView: React.FC<StocksViewProps> = ({
  stocks,
  onUpdateStock,
  onAddStock,
  onDeleteStock,
  onSendSmsAlert,
  cooperatives = [],
  parcels = [],
}) => {
  // Navigation tabs inside Stocks
  const [activeTab, setActiveTab] = useState<'lots' | 'iot' | 'movements'>('lots');

  // Filters and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('Tous');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'Normal' | 'Critique' | 'Hygro' | 'Reserve'>('Tous');

  // Interactive Modals State
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<WarehouseStock | null>(null);
  const [selectedStockForQr, setSelectedStockForQr] = useState<WarehouseStock | null>(null);

  // Notification state
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [alertSentForId, setAlertSentForId] = useState<string | null>(null);

  // Local Movements List
  const [movements, setMovements] = useState<StockMovement[]>(INITIAL_MOVEMENTS);

  // Form State: Add New Stock Entry
  const [newWarehouseName, setNewWarehouseName] = useState('Magasin Central COOPAZA Soubré');
  const [newCrop, setNewCrop] = useState('Cacao Fèves');
  const [newVariety, setNewVariety] = useState('Mercedes / Forastero séché');
  const [newQuantityTons, setNewQuantityTons] = useState('5.0');
  const [newHumidityPercent, setNewHumidityPercent] = useState('7.2');
  const [newQualityGrade, setNewQualityGrade] = useState<'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 1 (Supérieur)' | 'Grade 2 (Standard)'>('Grade 1 (Supérieur)');
  const [newAlertThresholdKg, setNewAlertThresholdKg] = useState('5000');
  const [newUnitValueFcfa, setNewUnitValueFcfa] = useState('2150');
  const [newOriginProducer, setNewOriginProducer] = useState('Kouadio Brou Mathieu — Nawa');

  // Form State: Dispatch / Outflow
  const [dispatchQuantityKg, setDispatchQuantityKg] = useState('2000');
  const [dispatchType, setDispatchType] = useState<'Sortie (Expédition B2B)' | 'Transfert Magasin' | 'Ajustement Inventaire'>('Sortie (Expédition B2B)');
  const [dispatchDestination, setDispatchDestination] = useState('Barry Callebaut CI — Zone Portuaire Vridi');
  const [dispatchDriver, setDispatchDriver] = useState('Koffi Roger (Camion 2432-JJ-01)');
  const [dispatchRef, setDispatchRef] = useState(`BL-${Math.floor(1000 + Math.random() * 9000)}`);

  // Form State: Quality Inspection & Hygro Adjustment
  const [adjustedHumidity, setAdjustedHumidity] = useState('7.0');
  const [adjustedGrade, setAdjustedGrade] = useState<'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 1 (Supérieur)' | 'Grade 2 (Standard)'>('Grade 1 (Supérieur)');
  const [adjustedQtyKg, setAdjustedQtyKg] = useState('0');
  const [inspectionNotes, setInspectionNotes] = useState('Grains bien fermentés, couleur brune homogène, taux de brisures < 2%.');

  // Calculations
  const totalStockKg = stocks.reduce((sum, s) => sum + (s.quantityKg || 0), 0);
  const totalReservedKg = stocks.reduce((sum, s) => sum + (s.reservedKg || 0), 0);
  const totalAvailableKg = Math.max(0, totalStockKg - totalReservedKg);
  const totalValuationFcfa = stocks.reduce((sum, s) => sum + (s.quantityKg || 0) * (s.unitValueFcfa || 0), 0);
  const criticalStockCount = stocks.filter((s) => s.quantityKg <= s.alertThresholdKg).length;
  const highHumidityCount = stocks.filter((s) => s.humidityPercent > 8.0).length;

  // Filtered Stocks
  const filteredStocks = stocks.filter((s) => {
    const matchesSearch =
      s.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.warehouseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.batchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.variety.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesWarehouse = warehouseFilter === 'Tous' || s.warehouseName === warehouseFilter;

    let matchesStatus = true;
    if (statusFilter === 'Critique') matchesStatus = s.quantityKg <= s.alertThresholdKg;
    if (statusFilter === 'Hygro') matchesStatus = s.humidityPercent > 8.0;
    if (statusFilter === 'Reserve') matchesStatus = (s.reservedKg || 0) > 0;
    if (statusFilter === 'Normal') matchesStatus = s.quantityKg > s.alertThresholdKg && s.humidityPercent <= 8.0;

    return matchesSearch && matchesWarehouse && matchesStatus;
  });

  // Warehouses list
  const uniqueWarehouses = Array.from(new Set(stocks.map((s) => s.warehouseName)));

  // Trigger SMS Alert
  const handleTriggerSmsAlert = (stock: WarehouseStock) => {
    const isCritical = stock.quantityKg <= stock.alertThresholdKg;
    const isHygroHigh = stock.humidityPercent > 8.0;
    const phone = '+225 07 48 22 11 00'; // Responsable Magasinier

    let text = '';
    if (isCritical) {
      text = `AGRILINK ALERTE STOCK: ${stock.crop} (${stock.batchCode}) à ${stock.warehouseName} est tombé à ${(stock.quantityKg / 1000).toFixed(1)}T (Seuil alerte: ${(stock.alertThresholdKg / 1000).toFixed(1)}T). Approvisionnement urgent.`;
    } else if (isHygroHigh) {
      text = `AGRILINK ALERTE HYGROMÉTRIE: Lot ${stock.batchCode} (${stock.crop}) mesuré à ${stock.humidityPercent}% d'humidité à ${stock.warehouseName}. Activer aération et ventilation immédiate.`;
    } else {
      text = `AGRILINK Stock Info: ${stock.crop} (${stock.batchCode}) - Stock disponible: ${(stock.quantityKg / 1000).toFixed(1)}T, Humidité ${stock.humidityPercent}%. État sanitaire optimal.`;
    }

    onSendSmsAlert(phone, text);
    setAlertSentForId(stock.id);
    setNotificationMsg(`Alerte SMS transmise au magasinier en chef (${phone}).`);
    setTimeout(() => {
      setAlertSentForId(null);
      setNotificationMsg(null);
    }, 4500);
  };

  // Submit New Stock Entry
  const handleCreateStockEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const tons = Number(newQuantityTons) || 1;
    const quantityKg = tons * 1000;
    const humidity = Number(newHumidityPercent) || 7.0;
    const unitVal = Number(newUnitValueFcfa) || 2000;
    const threshold = Number(newAlertThresholdKg) || 5000;

    const cropCode = newCrop.includes('Cacao') ? 'CC' : newCrop.includes('Café') ? 'CF' : newCrop.includes('Cajou') ? 'CJ' : 'AG';
    const batchCode = `LOT-${cropCode}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrCode = `AGRILINK-QR-${cropCode}-${Date.now().toString().slice(-4)}`;

    const newStock: WarehouseStock = {
      id: `stk-${Date.now()}`,
      warehouseId: `wh-${Date.now()}`,
      warehouseName: newWarehouseName,
      crop: newCrop,
      variety: newVariety,
      batchCode,
      quantityKg,
      reservedKg: 0,
      alertThresholdKg: threshold,
      humidityPercent: humidity,
      unitValueFcfa: unitVal,
      lastInspectionDate: new Date().toISOString().split('T')[0],
      qualityGrade: newQualityGrade,
      qrCode,
    };

    if (onAddStock) {
      onAddStock(newStock);
    } else {
      onUpdateStock(newStock);
    }

    // Add movement entry
    const newMov: StockMovement = {
      id: `mov-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      type: 'Entrée (Récolte/Achat)',
      batchCode,
      crop: newCrop,
      quantityKg,
      warehouseName: newWarehouseName,
      operator: 'Magasinier Principal',
      destinationOrOrigin: newOriginProducer,
      referenceDoc: `BR-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
    };
    setMovements([newMov, ...movements]);

    setShowAddEntryModal(false);
    setNotificationMsg(`Nouvelle réception de ${tons} Tonnes de ${newCrop} (Lot ${batchCode}) enregistrée avec succès.`);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  // Open Dispatch Modal
  const handleOpenDispatchModal = (stock: WarehouseStock) => {
    setSelectedStock(stock);
    setDispatchQuantityKg(Math.min(stock.quantityKg, 5000).toString());
    setShowDispatchModal(true);
  };

  // Submit Dispatch / Outflow
  const handleProcessDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;

    const qtyToDeduct = Number(dispatchQuantityKg) || 0;
    if (qtyToDeduct <= 0) return;

    if (qtyToDeduct > selectedStock.quantityKg) {
      alert('La quantité à déstocker ne peut pas dépasser le stock physique disponible.');
      return;
    }

    const nextQty = selectedStock.quantityKg - qtyToDeduct;
    const nextReserved = Math.max(0, (selectedStock.reservedKg || 0) - (dispatchType === 'Sortie (Expédition B2B)' ? qtyToDeduct : 0));

    const updated: WarehouseStock = {
      ...selectedStock,
      quantityKg: nextQty,
      reservedKg: nextReserved,
      lastInspectionDate: new Date().toISOString().split('T')[0],
    };

    onUpdateStock(updated);

    // Record movement
    const newMov: StockMovement = {
      id: `mov-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      type: dispatchType,
      batchCode: selectedStock.batchCode,
      crop: selectedStock.crop,
      quantityKg: qtyToDeduct,
      warehouseName: selectedStock.warehouseName,
      operator: 'Chef d\'Expédition Magasin',
      destinationOrOrigin: `${dispatchDestination} (${dispatchDriver})`,
      referenceDoc: dispatchRef,
    };
    setMovements([newMov, ...movements]);

    setShowDispatchModal(false);
    setNotificationMsg(
      `Déstockage de ${(qtyToDeduct / 1000).toFixed(1)}T du lot ${selectedStock.batchCode} validé. Bon d'expédition généré.`
    );
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  // Open Quality Control Modal
  const handleOpenQualityModal = (stock: WarehouseStock) => {
    setSelectedStock(stock);
    setAdjustedHumidity(stock.humidityPercent.toString());
    setAdjustedGrade(stock.qualityGrade);
    setAdjustedQtyKg(stock.quantityKg.toString());
    setShowQualityModal(true);
  };

  // Save Quality Control
  const handleSaveQualityControl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;

    const newHygro = Number(adjustedHumidity) || selectedStock.humidityPercent;
    const newQty = Number(adjustedQtyKg) || selectedStock.quantityKg;

    const updated: WarehouseStock = {
      ...selectedStock,
      humidityPercent: newHygro,
      qualityGrade: adjustedGrade,
      quantityKg: newQty,
      lastInspectionDate: new Date().toISOString().split('T')[0],
    };

    onUpdateStock(updated);

    // Record audit movement
    if (newQty !== selectedStock.quantityKg) {
      const diff = newQty - selectedStock.quantityKg;
      const newMov: StockMovement = {
        id: `mov-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        type: 'Ajustement Inventaire',
        batchCode: selectedStock.batchCode,
        crop: selectedStock.crop,
        quantityKg: Math.abs(diff),
        warehouseName: selectedStock.warehouseName,
        operator: 'Inspecteur Qualité & Pesage',
        destinationOrOrigin: `Pesée contradictoire (${diff > 0 ? '+' : ''}${diff} kg)`,
        referenceDoc: `AUDIT-${new Date().toISOString().split('T')[0]}`,
      };
      setMovements([newMov, ...movements]);
    }

    setShowQualityModal(false);
    setNotificationMsg(
      `Contrôle qualité enregistré pour le lot ${selectedStock.batchCode}. Humidité: ${newHygro}%, Grade: ${adjustedGrade}.`
    );
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  // Handle Delete Stock
  const handleDeleteStockItem = (stockId: string, batchCode: string) => {
    if (!confirm(`Confirmez-vous la suppression du lot ${batchCode} du registre d'entrepôt ?`)) return;
    if (onDeleteStock) {
      onDeleteStock(stockId);
      setNotificationMsg(`Le lot ${batchCode} a été retiré de l'inventaire.`);
      setTimeout(() => setNotificationMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Global KPIs & Main Actions */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800 shadow-inner">
                <Package className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-white font-display">
                  Suivi des Stocks & Entrepôts en Temps Réel
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Gestion des magasins, hygrométrie IoT, seuils critiques, traçabilité par lot et registres d'entrées-sorties
                </p>
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddEntryModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nouvelle Entrée Récolte</span>
            </button>

            <button
              onClick={() => {
                if (stocks.length > 0) {
                  handleOpenDispatchModal(stocks[0]);
                }
              }}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
              <span>Déstocker / Expédier</span>
            </button>
          </div>
        </div>

        {/* Global KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-800">
          <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl">
            <span className="text-[10px] text-stone-400 uppercase font-semibold block">Total Stock Physique</span>
            <div className="flex items-baseline gap-1 mt-1">
              <strong className="text-lg font-bold text-white font-mono">
                {formatNumber(totalStockKg / 1000, 1)}
              </strong>
              <span className="text-xs text-stone-400 font-medium">Tonnes</span>
            </div>
            <span className="text-[10px] text-stone-500 font-mono">({(totalStockKg).toLocaleString()} kg)</span>
          </div>

          <div className="p-3 bg-stone-950 border border-emerald-900/40 rounded-xl">
            <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Disponible Net</span>
            <div className="flex items-baseline gap-1 mt-1">
              <strong className="text-lg font-bold text-emerald-400 font-mono">
                {formatNumber(totalAvailableKg / 1000, 1)}
              </strong>
              <span className="text-xs text-emerald-500 font-medium">Tonnes</span>
            </div>
            <span className="text-[10px] text-amber-400 font-mono">
              {(totalReservedKg / 1000).toFixed(1)}T réservées commandes
            </span>
          </div>

          <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl">
            <span className="text-[10px] text-stone-400 uppercase font-semibold block">Valeur Marchande Magasins</span>
            <div className="flex items-baseline gap-1 mt-1">
              <strong className="text-base font-bold text-stone-200 font-mono">
                {formatFcfa(totalValuationFcfa)}
              </strong>
            </div>
            <span className="text-[10px] text-stone-500">Valorisation au cours officiel</span>
          </div>

          <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Alertes Actives</span>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    criticalStockCount > 0
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {criticalStockCount} seuil bas
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    highHumidityCount > 0
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {highHumidityCount} hygro &gt; 8%
                </span>
              </div>
            </div>
            <div className="p-2 bg-stone-900 rounded-lg border border-stone-800 text-emerald-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Success / Action Notification */}
      {notificationMsg && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-100 shadow-md animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{notificationMsg}</span>
          </div>
          <button
            onClick={() => setNotificationMsg(null)}
            className="text-stone-400 hover:text-white text-xs px-2 py-0.5 rounded bg-stone-800 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Secondary Navigation Tabs: Lots, IoT Sensors, Movements */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-stone-900 p-1 rounded-xl border border-stone-800">
          <button
            onClick={() => setActiveTab('lots')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'lots'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventaire des Lots ({filteredStocks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('iot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'iot'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-sky-400" />
            <span>Supervision Entrepôts & Capteurs IoT</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>

          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'movements'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Registre des Mouvements ({movements.length})</span>
          </button>
        </div>

        {/* Global Print / Report Button */}
        <button
          onClick={() => {
            if (stocks.length > 0) {
              setSelectedStockForQr(stocks[0]);
            }
          }}
          className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-stone-400" />
          <span>Étiquette Sacs & Traçabilité</span>
        </button>
      </div>

      {/* VIEW 1: INVENTAIRE DES LOTS */}
      {activeTab === 'lots' && (
        <div className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-stone-900 border border-stone-800 p-3.5 rounded-2xl">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-500" />
                <input
                  type="text"
                  placeholder="Rechercher par culture, variété, code de lot..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:border-emerald-500"
                />
              </div>

              {/* Warehouse selector */}
              <select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-300 focus:border-emerald-500"
              >
                <option value="Tous">Tous les entrepôts</option>
                {uniqueWarehouses.map((wh) => (
                  <option key={wh} value={wh}>
                    {wh}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Status Badges Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
              {(['Tous', 'Normal', 'Critique', 'Hygro', 'Reserve'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
                  }`}
                >
                  {filter === 'Tous' && 'Tous les lots'}
                  {filter === 'Normal' && 'Normaux'}
                  {filter === 'Critique' && '⚠️ Seuil Bas'}
                  {filter === 'Hygro' && '💧 Hygro > 8%'}
                  {filter === 'Reserve' && '📦 Réservés'}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStocks.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-stone-900 border border-stone-800 rounded-2xl text-xs text-stone-400 space-y-2">
                <Package className="w-10 h-10 text-stone-600 mx-auto" />
                <p className="font-semibold text-stone-300">Aucun lot de stock ne correspond à vos filtres.</p>
                <p className="text-[11px] text-stone-500">Essayez de modifier votre recherche ou réinitialisez les filtres.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setWarehouseFilter('Tous');
                    setStatusFilter('Tous');
                  }}
                  className="mt-2 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              filteredStocks.map((stock) => {
                const isCritical = stock.quantityKg <= stock.alertThresholdKg;
                const isHygroHigh = stock.humidityPercent > 8.0;
                const availableNet = Math.max(0, stock.quantityKg - (stock.reservedKg || 0));

                return (
                  <div
                    key={stock.id}
                    className={`bg-stone-900 border rounded-2xl p-5 shadow-sm space-y-4 transition flex flex-col justify-between ${
                      isCritical
                        ? 'border-amber-500/70 bg-gradient-to-b from-amber-950/20 to-stone-900'
                        : isHygroHigh
                        ? 'border-sky-500/50 bg-gradient-to-b from-sky-950/20 to-stone-900'
                        : 'border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {/* Header */}
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white font-display">{stock.crop}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-emerald-400 font-mono font-bold">
                              {stock.batchCode}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-400 block mt-0.5">{stock.variety}</span>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {isCritical && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Seuil Critique
                            </span>
                          )}
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                            {stock.qualityGrade}
                          </span>
                        </div>
                      </div>

                      {/* Warehouse Name */}
                      <div className="flex items-center gap-1.5 text-xs text-stone-300 pt-1">
                        <Building className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="line-clamp-1">{stock.warehouseName}</span>
                      </div>
                    </div>

                    {/* Gauges and Tonnage Info */}
                    <div className="space-y-2 bg-stone-850 p-3.5 rounded-xl border border-stone-800">
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-400">Stock Physique Total :</span>
                        <strong className="text-white font-mono">
                          {formatNumber(stock.quantityKg / 1000, 1)} T ({stock.quantityKg.toLocaleString()} kg)
                        </strong>
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-emerald-400 font-medium">Disponible Net :</span>
                        <strong className="text-emerald-400 font-mono">
                          {formatNumber(availableNet / 1000, 1)} T
                        </strong>
                      </div>

                      {stock.reservedKg > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-amber-400">Réservé Commandes :</span>
                          <span className="font-semibold text-amber-400 font-mono">
                            {formatNumber(stock.reservedKg / 1000, 1)} T
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-[11px] text-stone-400 pt-0.5">
                        <span>Seuil d'alerte :</span>
                        <span className="font-mono">{(stock.alertThresholdKg / 1000).toFixed(1)} T</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-stone-950 rounded-full h-2 overflow-hidden p-0.5 border border-stone-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCritical ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(10, (stock.quantityKg / (stock.alertThresholdKg * 3)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Humidity, Quality & Financial Value */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div
                        onClick={() => handleOpenQualityModal(stock)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition ${
                          isHygroHigh
                            ? 'bg-amber-950/40 border-amber-800/80 hover:bg-amber-950/60'
                            : 'bg-stone-850 border-stone-800 hover:border-stone-700'
                        }`}
                        title="Cliquer pour ajuster le contrôle qualité"
                      >
                        <span className="text-[10px] text-stone-400 block flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-sky-400" /> Humidité
                          </span>
                          <Edit3 className="w-2.5 h-2.5 text-stone-500" />
                        </span>
                        <span
                          className={`font-bold font-mono text-sm block mt-0.5 ${
                            isHygroHigh ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {stock.humidityPercent}%
                        </span>
                        <span className="text-[9px] text-stone-500">
                          {isHygroHigh ? 'Ventiler d\'urgence' : 'Conforme export'}
                        </span>
                      </div>

                      <div className="p-2.5 bg-stone-850 rounded-xl border border-stone-800">
                        <span className="text-[10px] text-stone-400 block">Valeur Magasin</span>
                        <span className="font-bold text-stone-200 font-mono text-sm block mt-0.5 line-clamp-1">
                          {formatFcfa(stock.quantityKg * stock.unitValueFcfa)}
                        </span>
                        <span className="text-[9px] text-stone-500 font-mono">{stock.unitValueFcfa} FCFA/kg</span>
                      </div>
                    </div>

                    {/* Inspection Date & Stock Actions Bar */}
                    <div className="space-y-2 pt-2 border-t border-stone-800 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-stone-400">
                        <span>Dernier contrôle :</span>
                        <span className="text-stone-300 font-mono">{stock.lastInspectionDate}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => setSelectedStockForQr(stock)}
                          className="py-1.5 px-2 bg-stone-850 hover:bg-stone-800 text-stone-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 border border-stone-800 transition cursor-pointer"
                          title="Fiche traçabilité et étiquette sac"
                        >
                          <QrCode className="w-3 h-3 text-emerald-400" />
                          <span>QR Lot</span>
                        </button>

                        <button
                          onClick={() => handleOpenDispatchModal(stock)}
                          className="py-1.5 px-2 bg-stone-800 hover:bg-stone-750 text-amber-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 border border-amber-900/30 transition cursor-pointer"
                          title="Déstocker ou transférer vers un autre magasin"
                        >
                          <ArrowUpRight className="w-3 h-3 text-amber-400" />
                          <span>Déstocker</span>
                        </button>

                        <button
                          onClick={() => handleTriggerSmsAlert(stock)}
                          disabled={alertSentForId === stock.id}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                            alertSentForId === stock.id
                              ? 'bg-emerald-600 text-white'
                              : isCritical || isHygroHigh
                              ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold'
                              : 'bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-800'
                          }`}
                          title="Transmettre une alerte SMS au magasinier"
                        >
                          {alertSentForId === stock.id ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Send className="w-3 h-3 text-emerald-400" />
                          )}
                          <span>SMS</span>
                        </button>
                      </div>

                      {/* Small action footer for delete */}
                      <div className="flex items-center justify-between pt-1 text-[10px] text-stone-500">
                        <button
                          onClick={() => handleOpenQualityModal(stock)}
                          className="hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> Ajuster inventaire
                        </button>
                        {onDeleteStock && (
                          <button
                            onClick={() => handleDeleteStockItem(stock.id, stock.batchCode)}
                            className="hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: SUPERVISION DES ENTREPÔTS & CAPTEURS IOT */}
      {activeTab === 'iot' && (
        <div className="space-y-4">
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-sky-950 text-sky-400 rounded-xl border border-sky-800">
                <Thermometer className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-white text-sm">Réseau de Capteurs d'Ambiance Connectés (IoT)</h3>
                <p className="text-stone-400 text-xs">
                  Sondes sans fil longue portée (LoRaWAN/GSM) mesurant la température du grain et l'humidité relative de l'air
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg text-[11px] font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> 4 Sondes Actives
              </span>
            </div>
          </div>

          {/* Warehouses Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WAREHOUSES_DATA.map((wh) => {
              const fillRate = Math.round((wh.currentStockTons / wh.capacityTons) * 100);
              const isAlertHygro = wh.humidityAirPercent > 72;

              return (
                <div
                  key={wh.id}
                  className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-white font-display flex items-center gap-2">
                        <Building className="w-4 h-4 text-emerald-400" />
                        {wh.name}
                      </h4>
                      <p className="text-xs text-stone-400 mt-0.5">{wh.location}</p>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        wh.status === 'Optimal'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                      }`}
                    >
                      {wh.status}
                    </span>
                  </div>

                  {/* Warehouse Capacity Gauge */}
                  <div className="bg-stone-850 p-3.5 rounded-xl border border-stone-800 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-400">Capacité de Stockage Utilisée :</span>
                      <strong className="text-white font-mono">
                        {wh.currentStockTons} T / {wh.capacityTons} T ({fillRate}%)
                      </strong>
                    </div>

                    <div className="w-full bg-stone-950 rounded-full h-2.5 overflow-hidden p-0.5 border border-stone-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          fillRate > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${fillRate}%` }}
                      />
                    </div>
                  </div>

                  {/* IoT Sensors Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-3 bg-stone-850 rounded-xl border border-stone-800 text-center">
                      <span className="text-[10px] text-stone-400 block flex items-center justify-center gap-1">
                        <Thermometer className="w-3 h-3 text-rose-400" /> Température
                      </span>
                      <strong className="text-base font-bold text-white font-mono block mt-1">
                        {wh.temperatureC}°C
                      </strong>
                      <span className="text-[9px] text-emerald-400">Stable</span>
                    </div>

                    <div
                      className={`p-3 rounded-xl border text-center ${
                        isAlertHygro
                          ? 'bg-amber-950/40 border-amber-800'
                          : 'bg-stone-850 border-stone-800'
                      }`}
                    >
                      <span className="text-[10px] text-stone-400 block flex items-center justify-center gap-1">
                        <Droplets className="w-3 h-3 text-sky-400" /> Humidité Air
                      </span>
                      <strong
                        className={`text-base font-bold font-mono block mt-1 ${
                          isAlertHygro ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {wh.humidityAirPercent}%
                      </strong>
                      <span className="text-[9px] text-stone-400">
                        {isAlertHygro ? 'Élevée' : 'Normale'}
                      </span>
                    </div>

                    <div className="p-3 bg-stone-850 rounded-xl border border-stone-800 text-center">
                      <span className="text-[10px] text-stone-400 block flex items-center justify-center gap-1">
                        <Wind className="w-3 h-3 text-amber-400" /> Ventilation
                      </span>
                      <strong className="text-xs font-bold text-stone-200 block mt-1.5 truncate">
                        {wh.ventilationStatus}
                      </strong>
                    </div>
                  </div>

                  {/* Sanitization & Contact Info */}
                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Désinsectisation : {wh.pestControlDate}</span>
                    </div>

                    <button
                      onClick={() => {
                        const msg = `AGRILINK: Contrôle magasin ${wh.name} - Temp: ${wh.temperatureC}°C, Hygro: ${wh.humidityAirPercent}%. Statut: ${wh.status}.`;
                        onSendSmsAlert(wh.phone, msg);
                        setNotificationMsg(`Rapport de télémesure envoyé au responsable ${wh.responsibleName}.`);
                        setTimeout(() => setNotificationMsg(null), 4000);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> Contacter Magasinier
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: REGISTRE DES MOUVEMENTS (ENTRÉES / SORTIES / TRANSFERTS) */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" /> Registre Chronologique des Entrées-Sorties
              </h3>
              <p className="text-stone-400 text-xs">
                Traçabilité intégrale de chaque pesée à l'arrivée, déstockage d'exportation et bordereau de transfert
              </p>
            </div>

            <button
              onClick={() => setShowAddEntryModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Enregistrer un mouvement
            </button>
          </div>

          {/* Movements Table */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden divide-y divide-stone-800 text-xs">
            {movements.map((mov) => {
              const isEntry = mov.type.includes('Entrée');
              const isExit = mov.type.includes('Sortie');

              return (
                <div
                  key={mov.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-850/50 transition"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                        isEntry
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : isExit
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-stone-800 text-stone-300'
                      }`}
                    >
                      {isEntry ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-white font-semibold">{mov.type}</strong>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-950 text-emerald-400 font-mono font-bold">
                          {mov.batchCode}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                          {mov.crop}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1">
                        Origine / Destination : <strong className="text-stone-300">{mov.destinationOrOrigin}</strong>
                      </p>
                      <p className="text-[10px] text-stone-500">
                        {mov.warehouseName} • Opérateur : {mov.operator}
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:self-center shrink-0">
                    <span
                      className={`text-sm font-bold font-mono block ${
                        isEntry ? 'text-emerald-400' : isExit ? 'text-amber-400' : 'text-white'
                      }`}
                    >
                      {isEntry ? '+' : '-'}{formatNumber(mov.quantityKg / 1000, 2)} T ({(mov.quantityKg).toLocaleString()} kg)
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      {mov.date} à {mov.time} • Réf: {mov.referenceDoc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: NOUVELLE ENTRÉE EN STOCK (RÉCEPTION RÉCOLTE / ACHAT) */}
      {showAddEntryModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-stone-100 space-y-4 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Réception Récolte & Nouvelle Entrée en Stock
              </h3>
              <button
                onClick={() => setShowAddEntryModal(false)}
                className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-stone-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStockEntry} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Magasin de Stockage <span className="text-emerald-400">*</span>
                  </label>
                  <select
                    value={newWarehouseName}
                    onChange={(e) => setNewWarehouseName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  >
                    <option value="Magasin Central COOPAZA Soubré">Magasin Central COOPAZA Soubré</option>
                    <option value="Entrepôt Transit Toumodi">Entrepôt Transit Toumodi</option>
                    <option value="Silo Régional Ziguinchor">Silo Régional Ziguinchor</option>
                    <option value="Terminal d'Exportation San Pedro">Terminal d'Exportation San Pedro</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Culture & Spéculation <span className="text-emerald-400">*</span>
                  </label>
                  <select
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  >
                    <option value="Cacao Fèves">Cacao Fèves (Grade 1)</option>
                    <option value="Café Robusta">Café Robusta Décortiqué</option>
                    <option value="Noix de Cajou (Anacarde)">Noix de Cajou (Anacarde KOR 48+)</option>
                    <option value="Maïs Blanc">Maïs Blanc Grains Séchés</option>
                    <option value="Soja Grain">Soja Grain Protéagineux</option>
                    <option value="Riz Paddy Local">Riz Paddy Local</option>
                    <option value="Manioc Cossettes">Manioc Cossettes Blanches</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Variété / Traitement
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mercedes Hybride séché au soleil"
                  value={newVariety}
                  onChange={(e) => setNewVariety(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-950 p-3.5 rounded-xl border border-stone-800">
                <div>
                  <label className="text-[11px] text-stone-400 font-medium block mb-1">
                    Quantité en Tonnes (T) <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newQuantityTons}
                    onChange={(e) => setNewQuantityTons(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-emerald-500"
                    required
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block font-mono">
                    = {((Number(newQuantityTons) || 0) * 1000).toLocaleString()} kg
                  </span>
                </div>

                <div>
                  <label className="text-[11px] text-stone-400 font-medium block mb-1">
                    Taux d'Humidité (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="4.0"
                    max="20.0"
                    value={newHumidityPercent}
                    onChange={(e) => setNewHumidityPercent(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-emerald-500"
                    required
                  />
                  <span className="text-[10px] text-emerald-400 mt-0.5 block">
                    Norme : &lt; 7.5%
                  </span>
                </div>

                <div>
                  <label className="text-[11px] text-stone-400 font-medium block mb-1">
                    Grade Qualité
                  </label>
                  <select
                    value={newQualityGrade}
                    onChange={(e) => setNewQualityGrade(e.target.value as any)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-500"
                  >
                    <option value="Grade 1 (Supérieur)">Grade 1 (Supérieur)</option>
                    <option value="Grade 2 (Standard)">Grade 2 (Standard)</option>
                    <option value="Grade 3">Grade 3 (Rebut/Local)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Origine (Producteur / Parcelle / Village)
                  </label>
                  <input
                    type="text"
                    value={newOriginProducer}
                    onChange={(e) => setNewOriginProducer(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Seuil d'Alerte Minimum (kg)
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={newAlertThresholdKg}
                    onChange={(e) => setNewAlertThresholdKg(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddEntryModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider l'Entrée en Stock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DÉSTOCKAGE / EXPÉDITION / TRANSFERT */}
      {showDispatchModal && selectedStock && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-stone-100 space-y-4 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-amber-400" />
                Déstockage & Expédition Logistique
              </h3>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-stone-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-400">Lot source sélectionné :</span>
                <strong className="text-emerald-400 font-mono">{selectedStock.batchCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Produit :</span>
                <span className="text-white font-semibold">
                  {selectedStock.crop} ({selectedStock.variety})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Magasin :</span>
                <span className="text-stone-300">{selectedStock.warehouseName}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-stone-800 text-white font-bold">
                <span>Stock physique actuel :</span>
                <span className="font-mono text-emerald-400">
                  {formatNumber(selectedStock.quantityKg / 1000, 1)} Tonnes ({(selectedStock.quantityKg).toLocaleString()} kg)
                </span>
              </div>
            </div>

            <form onSubmit={handleProcessDispatch} className="space-y-3.5">
              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Type d'Opération de Déstockage
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Sortie (Expédition B2B)', 'Transfert Magasin', 'Ajustement Inventaire'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDispatchType(t)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                        dispatchType === t
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                          : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      {t.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Quantité à déstocker (kg) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="50"
                    max={selectedStock.quantityKg}
                    value={dispatchQuantityKg}
                    onChange={(e) => setDispatchQuantityKg(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-base font-bold font-mono text-amber-400 focus:border-amber-500"
                    required
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block font-mono">
                    = {((Number(dispatchQuantityKg) || 0) / 1000).toFixed(1)} Tonnes
                  </span>
                </div>

                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Réf. Bon de Livraison / Expédition
                  </label>
                  <input
                    type="text"
                    value={dispatchRef}
                    onChange={(e) => setDispatchRef(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Destinataire / Acheteur / Magasin Cible <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={dispatchDestination}
                  onChange={(e) => setDispatchDestination(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Chauffeur & Immatriculation Camion
                </label>
                <input
                  type="text"
                  value={dispatchDriver}
                  onChange={(e) => setDispatchDriver(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-stone-950 shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Confirmer le Déstockage</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CONTRÔLE QUALITÉ & AJUSTEMENT D'INVENTAIRE */}
      {showQualityModal && selectedStock && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-stone-100 space-y-4 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Droplets className="w-5 h-5 text-sky-400" />
                Contrôle Qualité & Hygrométrie du Lot
              </h3>
              <button
                onClick={() => setShowQualityModal(false)}
                className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-stone-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs space-y-1">
              <div className="flex justify-between text-stone-400">
                <span>Code du Lot :</span>
                <strong className="text-emerald-400 font-mono">{selectedStock.batchCode}</strong>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Culture :</span>
                <span className="text-white">{selectedStock.crop}</span>
              </div>
            </div>

            <form onSubmit={handleSaveQualityControl} className="space-y-3.5">
              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Nouveau Taux d'Humidité Mesuré (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="4.0"
                  max="20.0"
                  value={adjustedHumidity}
                  onChange={(e) => setAdjustedHumidity(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-lg font-bold font-mono text-sky-400 focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Grade Qualité Certifié
                </label>
                <select
                  value={adjustedGrade}
                  onChange={(e) => setAdjustedGrade(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                >
                  <option value="Grade 1 (Supérieur)">Grade 1 (Supérieur)</option>
                  <option value="Grade 2 (Standard)">Grade 2 (Standard)</option>
                  <option value="Grade 3">Grade 3 (Rebut/Local)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Stock Physique Pesé (kg)
                </label>
                <input
                  type="number"
                  step="50"
                  value={adjustedQtyKg}
                  onChange={(e) => setAdjustedQtyKg(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Observations de l'Inspecteur
                </label>
                <textarea
                  rows={2}
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowQualityModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer le Contrôle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: FICHE LOT & ÉTIQUETTE TRAÇABILITÉ SAC (QR CODE) */}
      {selectedStockForQr && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-stone-100 space-y-4 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                Fiche Lot & Étiquette Traçabilité Sac (CCC & OAM)
              </h3>
              <button
                onClick={() => setSelectedStockForQr(null)}
                className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-stone-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Printable Tag Visual Simulation */}
            <div className="p-4 bg-white text-stone-900 rounded-2xl border-4 border-stone-300 shadow-inner space-y-3">
              <div className="flex items-center justify-between border-b-2 border-stone-800 pb-2">
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-stone-900">
                    AGRILINK TRACEABILITY TAG
                  </h4>
                  <p className="text-[10px] text-stone-600 font-semibold">
                    République de Côte d'Ivoire • Norme CCC Export
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded border border-emerald-300">
                  {selectedStockForQr.qualityGrade}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="space-y-1 text-xs">
                  <p>
                    <span className="text-stone-500 font-medium">Culture :</span>{' '}
                    <strong className="text-stone-900">{selectedStockForQr.crop}</strong>
                  </p>
                  <p>
                    <span className="text-stone-500 font-medium">Variété :</span>{' '}
                    <span className="text-stone-800">{selectedStockForQr.variety}</span>
                  </p>
                  <p>
                    <span className="text-stone-500 font-medium">Code Lot :</span>{' '}
                    <strong className="text-emerald-700 font-mono">{selectedStockForQr.batchCode}</strong>
                  </p>
                  <p>
                    <span className="text-stone-500 font-medium">Poids Lot :</span>{' '}
                    <strong className="text-stone-900 font-mono">
                      {formatNumber(selectedStockForQr.quantityKg / 1000, 2)} T
                    </strong>
                  </p>
                  <p>
                    <span className="text-stone-500 font-medium">Humidité :</span>{' '}
                    <strong className="text-sky-700 font-mono">{selectedStockForQr.humidityPercent}%</strong>
                  </p>
                  <p>
                    <span className="text-stone-500 font-medium">Magasin :</span>{' '}
                    <span className="text-stone-800 text-[11px] block">{selectedStockForQr.warehouseName}</span>
                  </p>
                </div>

                {/* QR graphic */}
                <div className="flex flex-col items-center justify-center p-2 bg-stone-100 rounded-xl border border-stone-300">
                  <QrCode className="w-24 h-24 text-stone-900" />
                  <span className="text-[9px] font-mono text-stone-600 mt-1 font-bold">
                    {selectedStockForQr.qrCode}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-300 text-[10px] text-stone-500 flex justify-between">
                <span>Date contrôle: {selectedStockForQr.lastInspectionDate}</span>
                <span>Visa Magasinier: Certifié Conforme</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer l'Étiquette</span>
              </button>

              <button
                onClick={() => setSelectedStockForQr(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
