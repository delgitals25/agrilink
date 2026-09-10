import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Sparkles,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Wallet,
  Scale,
  Search,
  Filter,
  Eye,
  ShoppingCart,
  ShieldCheck,
  Building2,
  Calendar,
  X,
  Layers,
  MapPin,
  Check,
} from 'lucide-react';
import { ExpenseRecord, Parcel, Order, HarvestRecord, Buyer } from '../types';
import { GeminiService, CostAnalysisResult } from '../services/geminiService';
import { formatFcfa, formatNumber, StorageService } from '../services/storageService';

export interface CostsAndFinanceViewProps {
  expenses: ExpenseRecord[];
  parcels: Parcel[];
  orders?: Order[];
  harvests?: HarvestRecord[];
  onAddExpense: (exp: Omit<ExpenseRecord, 'id'>) => void;
  onAddOrder?: (order: Order) => void;
}

export interface ParcelFinancialStats {
  parcel: Parcel;
  totalCosts: number;
  totalRevenue: number;
  totalPaidRevenue: number;
  netMargin: number;
  marginRate: number; // percentage
  marginPerHa: number;
  costsPerHa: number;
  revenuePerHa: number;
  revenueToCostRatio: number;
  orders: Order[];
  expenses: ExpenseRecord[];
  expensesByCategory: Record<string, number>;
  status: 'EXCELLENT' | 'RENTABLE' | 'MODERE' | 'DEFICIT';
}

export const CostsAndFinanceView: React.FC<CostsAndFinanceViewProps> = ({
  expenses,
  parcels,
  orders = [],
  harvests = [],
  onAddExpense,
  onAddOrder,
}) => {
  // Navigation tabs within Finance view
  const [activeTab, setActiveTab] = useState<'marge-parcelle' | 'audit-ia' | 'journal'>('marge-parcelle');

  // Filters & Search for parcels margin analysis
  const [searchQuery, setSearchQuery] = useState('');
  const [cropFilter, setCropFilter] = useState('ALL');
  const [profitabilityFilter, setProfitabilityFilter] = useState<'ALL' | 'RENTABLE' | 'MODERE' | 'DEFICIT'>('ALL');
  const [sortBy, setSortBy] = useState<'margin-desc' | 'margin-ha-desc' | 'revenue-desc' | 'cost-desc'>('margin-desc');
  const [viewLayout, setViewLayout] = useState<'cards' | 'table'>('cards');

  // Selected Parcel for detailed drill-down modal / inspector
  const [inspectingParcelId, setInspectingParcelId] = useState<string | null>(null);

  // Modals
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [preselectedParcelForExpense, setPreselectedParcelForExpense] = useState<string>(parcels[0]?.id || '');

  const [showAddSaleModal, setShowAddSaleModal] = useState(false);
  const [preselectedParcelForSale, setPreselectedParcelForSale] = useState<string>(parcels[0]?.id || '');

  // Form states for adding an expense
  const [expenseParcelId, setExpenseParcelId] = useState(parcels[0]?.id || '');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseRecord['category']>('Main d\'œuvre');
  const [expenseAmount, setExpenseAmount] = useState('45000');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<ExpenseRecord['paymentMethod']>('Wave');

  // Form states for recording a new parcel sale / revenue
  const [saleParcelId, setSaleParcelId] = useState(parcels[0]?.id || '');
  const [saleBuyerName, setSaleBuyerName] = useState('AFRICACAO International S.A.');
  const [saleQuantityKg, setSaleQuantityKg] = useState('5000');
  const [saleUnitPriceKg, setSaleUnitPriceKg] = useState('1950');
  const [salePaidStatus, setSalePaidStatus] = useState<'Payé intégral' | 'Acompte versé' | 'En attente'>('Payé intégral');
  const [salePaymentMethod, setSalePaymentMethod] = useState<'Wave' | 'Orange Money' | 'MTN MoMo' | 'Virement bancaire'>('Wave');
  const [saleDestination, setSaleDestination] = useState('Terminal Portuaire San Pedro');
  const [saleSuccessNotice, setSaleSuccessNotice] = useState<string | null>(null);

  // Gemini AI Cost Audit state
  const [selectedCrop, setSelectedCrop] = useState('Cacao Fèves');
  const [selectedHa, setSelectedHa] = useState('4.5');
  const [expectedRevenue, setExpectedRevenue] = useState('7800000');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CostAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Available buyers
  const buyersList: Buyer[] = useMemo(() => {
    return StorageService.getBuyers();
  }, []);

  // Global expense sums & categories
  const totalExpenseFcfa = useMemo(() => {
    return expenses.reduce((acc, e) => acc + (e.amountFcfa || 0), 0);
  }, [expenses]);

  const expensesByCategory = useMemo(() => {
    return expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + (e.amountFcfa || 0);
      return acc;
    }, {} as Record<string, number>);
  }, [expenses]);

  // Comprehensive calculation of Net Profit Margin per Parcel
  const parcelStatsList: ParcelFinancialStats[] = useMemo(() => {
    return parcels.map((parcel) => {
      // 1. Matched expenses for this parcel
      const parcelExpenses = expenses.filter((e) => e.parcelId === parcel.id);
      const totalCosts = parcelExpenses.reduce((sum, e) => sum + (e.amountFcfa || 0), 0);

      // Group costs by category for this parcel
      const pExpensesByCategory = parcelExpenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amountFcfa;
        return acc;
      }, {} as Record<string, number>);

      // 2. Matched sales orders for this parcel
      // Match explicitly by parcelId or parcelName; fallback to crop if parcelId not assigned
      const parcelOrders = orders.filter((o) => {
        if (o.parcelId && o.parcelId === parcel.id) return true;
        if (o.items && o.items.some((it) => it.parcelId === parcel.id)) return true;
        if (o.parcelName && o.parcelName.toLowerCase() === parcel.name.toLowerCase()) return true;

        // Fallback crop match if order has no explicit parcelId
        if (!o.parcelId) {
          const parcelCropWords = parcel.crop.toLowerCase().split(' ');
          const firstWord = parcelCropWords[0] || '';
          if (firstWord.length > 2) {
            if (o.crop && o.crop.toLowerCase().includes(firstWord)) return true;
            if (o.items && o.items.some((it) => it.crop?.toLowerCase().includes(firstWord))) return true;
          }
        }
        return false;
      });

      const totalRevenue = parcelOrders.reduce((sum, o) => sum + (o.totalAmountFcfa || 0), 0);
      const totalPaidRevenue = parcelOrders.reduce((sum, o) => sum + (o.paidAmountFcfa || 0), 0);

      // 3. Net Margin calculations
      const netMargin = totalRevenue - totalCosts;
      const marginRate =
        totalRevenue > 0
          ? Math.round((netMargin / totalRevenue) * 100)
          : totalCosts > 0
          ? -100
          : 0;

      const surfaceHa = parcel.surfaceHa > 0 ? parcel.surfaceHa : 1;
      const marginPerHa = Math.round(netMargin / surfaceHa);
      const costsPerHa = Math.round(totalCosts / surfaceHa);
      const revenuePerHa = Math.round(totalRevenue / surfaceHa);
      const revenueToCostRatio =
        totalCosts > 0
          ? Number((totalRevenue / totalCosts).toFixed(2))
          : totalRevenue > 0
          ? 99
          : 0;

      let status: ParcelFinancialStats['status'] = 'MODERE';
      if (netMargin > 0 && marginRate >= 50) {
        status = 'EXCELLENT';
      } else if (netMargin > 0 && marginRate >= 20) {
        status = 'RENTABLE';
      } else if (netMargin >= 0) {
        status = 'MODERE';
      } else {
        status = 'DEFICIT';
      }

      return {
        parcel,
        totalCosts,
        totalRevenue,
        totalPaidRevenue,
        netMargin,
        marginRate,
        marginPerHa,
        costsPerHa,
        revenuePerHa,
        revenueToCostRatio,
        orders: parcelOrders,
        expenses: parcelExpenses,
        expensesByCategory: pExpensesByCategory,
        status,
      };
    });
  }, [parcels, expenses, orders]);

  // Aggregate portfolio totals
  const portfolioSummary = useMemo(() => {
    const totalRevenue = parcelStatsList.reduce((acc, p) => acc + p.totalRevenue, 0);
    const totalPaid = parcelStatsList.reduce((acc, p) => acc + p.totalPaidRevenue, 0);
    const totalCosts = parcelStatsList.reduce((acc, p) => acc + p.totalCosts, 0);
    const totalNetMargin = totalRevenue - totalCosts;
    const globalMarginRate =
      totalRevenue > 0 ? Math.round((totalNetMargin / totalRevenue) * 100) : 0;
    const totalSurfaceHa = parcels.reduce((acc, p) => acc + (p.surfaceHa || 0), 0);
    const avgMarginPerHa =
      totalSurfaceHa > 0 ? Math.round(totalNetMargin / totalSurfaceHa) : 0;

    // Top profitable parcel
    const sortedByMargin = [...parcelStatsList].sort((a, b) => b.netMargin - a.netMargin);
    const topParcel = sortedByMargin[0] || null;

    return {
      totalRevenue,
      totalPaid,
      totalCosts,
      totalNetMargin,
      globalMarginRate,
      totalSurfaceHa,
      avgMarginPerHa,
      topParcel,
      ordersCount: orders.length,
      parcelsCount: parcels.length,
    };
  }, [parcelStatsList, parcels, orders]);

  // Filtered & Sorted parcel stats
  const filteredParcelStats = useMemo(() => {
    return parcelStatsList
      .filter((item) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.parcel.name.toLowerCase().includes(q);
          const matchProd = item.parcel.producerName.toLowerCase().includes(q);
          const matchCrop = item.parcel.crop.toLowerCase().includes(q);
          if (!matchName && !matchProd && !matchCrop) return false;
        }

        // Crop filter
        if (cropFilter !== 'ALL') {
          if (!item.parcel.crop.toLowerCase().includes(cropFilter.toLowerCase())) {
            return false;
          }
        }

        // Profitability filter
        if (profitabilityFilter !== 'ALL') {
          if (profitabilityFilter === 'RENTABLE' && (item.status !== 'EXCELLENT' && item.status !== 'RENTABLE')) {
            return false;
          }
          if (profitabilityFilter === 'MODERE' && item.status !== 'MODERE') {
            return false;
          }
          if (profitabilityFilter === 'DEFICIT' && item.status !== 'DEFICIT') {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'margin-desc') return b.netMargin - a.netMargin;
        if (sortBy === 'margin-ha-desc') return b.marginPerHa - a.marginPerHa;
        if (sortBy === 'revenue-desc') return b.totalRevenue - a.totalRevenue;
        if (sortBy === 'cost-desc') return b.totalCosts - a.totalCosts;
        return 0;
      });
  }, [parcelStatsList, searchQuery, cropFilter, profitabilityFilter, sortBy]);

  // Currently inspected parcel stats
  const inspectedStats = useMemo(() => {
    if (!inspectingParcelId) return null;
    return parcelStatsList.find((p) => p.parcel.id === inspectingParcelId) || null;
  }, [inspectingParcelId, parcelStatsList]);

  // Handle adding an expense
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parcels.find((pr) => pr.id === expenseParcelId) || parcels[0];
    if (!p) return;

    onAddExpense({
      parcelId: p.id,
      parcelName: p.name,
      category: expenseCategory,
      amountFcfa: Number(expenseAmount) || 10000,
      date: new Date().toISOString().split('T')[0],
      description: expenseDescription || `Frais ${expenseCategory} — ${p.crop}`,
      paymentMethod: expensePaymentMethod,
    });

    setShowAddExpenseModal(false);
    setExpenseDescription('');
    setSaleSuccessNotice(`Dépense de ${formatFcfa(Number(expenseAmount))} enregistrée sur ${p.name}.`);
    setTimeout(() => setSaleSuccessNotice(null), 4000);
  };

  // Handle recording a sale for a parcel
  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parcels.find((pr) => pr.id === saleParcelId) || parcels[0];
    if (!p) return;

    const qty = Number(saleQuantityKg) || 1000;
    const unitPrice = Number(saleUnitPriceKg) || 1950;
    const totalFcfa = qty * unitPrice;
    const paidFcfa = salePaidStatus === 'Payé intégral' ? totalFcfa : salePaidStatus === 'Acompte versé' ? Math.round(totalFcfa * 0.3) : 0;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `VENTE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      buyerId: `buy-${Date.now()}`,
      buyerName: saleBuyerName,
      parcelId: p.id,
      parcelName: p.name,
      crop: p.crop,
      quantityKg: qty,
      unitPriceFcfaKg: unitPrice,
      totalAmountFcfa: totalFcfa,
      paidAmountFcfa: paidFcfa,
      status: 'Confirmée',
      paymentStatus: salePaidStatus,
      destination: saleDestination || 'Magasin Régional',
      createdDate: new Date().toISOString().split('T')[0],
      items: [
        {
          crop: `${p.crop} (${p.variety})`,
          quality: 'Qualité Standard / Récolte Parcelle',
          quantityKg: qty,
          unitPriceFcfa: unitPrice,
          parcelId: p.id,
          parcelName: p.name,
        },
      ],
      transactions: paidFcfa > 0 ? [
        {
          id: `tx-${Date.now()}`,
          orderId: `ord-${Date.now()}`,
          amountFcfa: paidFcfa,
          method: salePaymentMethod,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          reference: `${salePaymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
          status: 'Effectué',
          smsReceiptSent: true,
        }
      ] : [],
    };

    if (onAddOrder) {
      onAddOrder(newOrder);
    } else {
      const updated = [newOrder, ...orders];
      StorageService.saveOrders(updated);
    }

    setShowAddSaleModal(false);
    setSaleSuccessNotice(
      `Vente de ${formatNumber(qty)} kg enregistrée pour ${p.name} (+${formatFcfa(totalFcfa)}). Marge nette recalculée !`
    );
    setTimeout(() => setSaleSuccessNotice(null), 5000);
  };

  // Run AI Cost Audit with Gemini
  const handleRunAiCostAudit = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await GeminiService.analyzeCosts({
        cropName: selectedCrop,
        hectares: Number(selectedHa) || 3,
        expenses: expensesByCategory,
        expectedRevenueFcfa: Number(expectedRevenue) || 5000000,
      });
      setAnalysisResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Impossible d\'exécuter l\'analyse financière IA');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-display flex items-center gap-2">
            <span>💰</span> Coûts d'Exploitation & Marge Nette par Parcelle
          </h2>
          <p className="text-xs text-stone-400">
            Calcul en temps réel de la marge bénéficiaire nette par parcelle, confrontant coûts cumulés et recettes des ventes enregistrées.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setSaleParcelId(parcels[0]?.id || '');
              setShowAddSaleModal(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Enregistrer une Vente</span>
          </button>

          <button
            onClick={() => {
              setExpenseParcelId(parcels[0]?.id || '');
              setShowAddExpenseModal(true);
            }}
            className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-rose-400" />
            <span>Consigner une Dépense</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saleSuccessNotice && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-500 rounded-2xl flex items-center gap-3 text-xs text-emerald-100 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{saleSuccessNotice}</span>
        </div>
      )}

      {/* Primary KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Ventes Enregistrées */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4.5 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-bold uppercase tracking-wider">Revenus Ventes Enregistrées</span>
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {formatFcfa(portfolioSummary.totalRevenue)}
          </div>
          <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1 border-t border-stone-800/80">
            <span>Encaissé : <strong className="text-emerald-300 font-mono">{formatFcfa(portfolioSummary.totalPaid)}</strong></span>
            <span>{portfolioSummary.ordersCount} contrat(s)</span>
          </div>
        </div>

        {/* 2. Coûts Cumulés */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4.5 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-bold uppercase tracking-wider">Coûts d'Exploitation Cumulés</span>
            <Receipt className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">
            {formatFcfa(portfolioSummary.totalCosts)}
          </div>
          <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1 border-t border-stone-800/80">
            <span>{expenses.length} dépenses tracées</span>
            <span>Intrants & Salaires</span>
          </div>
        </div>

        {/* 3. Marge Nette Globale */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4.5 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-bold uppercase tracking-wider">Marge Bénéficiaire Nette</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-2xl font-black font-mono ${portfolioSummary.totalNetMargin >= 0 ? 'text-white' : 'text-rose-400'}`}>
            {portfolioSummary.totalNetMargin >= 0 ? '+' : ''}{formatFcfa(portfolioSummary.totalNetMargin)}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1 border-t border-stone-800/80">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Taux de rentabilité global de <strong>{portfolioSummary.globalMarginRate}%</strong></span>
          </div>
        </div>

        {/* 4. Rendement Financier à l'Hectare */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4.5 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-bold uppercase tracking-wider">Marge Moyenne / Hectare</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300 font-mono">
            {formatFcfa(portfolioSummary.avgMarginPerHa)} / ha
          </div>
          <div className="text-[11px] text-stone-400 truncate pt-1 border-t border-stone-800/80">
            <span>Top parcelle : </span>
            <strong className="text-stone-200">{portfolioSummary.topParcel ? portfolioSummary.topParcel.parcel.name : '—'}</strong>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('marge-parcelle')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'marge-parcelle'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Marge Nette par Parcelle</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[10px]">
            {parcels.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit-ia')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'audit-ia'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Audit Rentabilité IA (Gemini 3.8)</span>
        </button>

        <button
          onClick={() => setActiveTab('journal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'journal'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Journal des Dépenses & Catégories</span>
        </button>
      </div>

      {/* TAB 1: MARGE NETTE PAR PARCELLE */}
      {activeTab === 'marge-parcelle' && (
        <div className="space-y-6">
          {/* Controls Bar: Filter, Search, Sort & View Mode */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Search */}
              <div className="relative min-w-[200px] flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrer parcelle, planteur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Crop Filter */}
              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-300 focus:border-emerald-500 outline-none cursor-pointer"
              >
                <option value="ALL">Toutes les cultures</option>
                <option value="Cacao">Cacao Fèves</option>
                <option value="Café">Café Robusta</option>
                <option value="Cajou">Noix de Cajou</option>
                <option value="Maïs">Maïs Blanc</option>
              </select>

              {/* Profitability Filter */}
              <select
                value={profitabilityFilter}
                onChange={(e) => setProfitabilityFilter(e.target.value as any)}
                className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-300 focus:border-emerald-500 outline-none cursor-pointer"
              >
                <option value="ALL">Tous statuts</option>
                <option value="RENTABLE">Rentables (Marge &gt; 20%)</option>
                <option value="MODERE">Marge Modérée (0 - 20%)</option>
                <option value="DEFICIT">Déficitaires (&lt; 0%)</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-300 focus:border-emerald-500 outline-none cursor-pointer"
              >
                <option value="margin-desc">Trier : Marge Nette Décroissante</option>
                <option value="margin-ha-desc">Trier : Marge / Hectare</option>
                <option value="revenue-desc">Trier : Revenus Ventes</option>
                <option value="cost-desc">Trier : Coûts Cumulés</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 self-end md:self-auto">
              <button
                onClick={() => setViewLayout('cards')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                  viewLayout === 'cards'
                    ? 'bg-stone-800 text-white shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Cartes Comparatives
              </button>
              <button
                onClick={() => setViewLayout('table')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                  viewLayout === 'table'
                    ? 'bg-stone-800 text-white shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Tableau Analytique
              </button>
            </div>
          </div>

          {/* Cards View */}
          {viewLayout === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredParcelStats.map((item) => {
                const isProfitable = item.netMargin >= 0;
                // Ratio bar: percentage of total flow represented by revenue vs cost
                const flowTotal = item.totalRevenue + item.totalCosts;
                const revPct = flowTotal > 0 ? Math.round((item.totalRevenue / flowTotal) * 100) : 50;
                const costPct = 100 - revPct;

                return (
                  <div
                    key={item.parcel.id}
                    className="bg-stone-900 border border-stone-800 hover:border-stone-700 transition rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden group"
                  >
                    {/* Top row: parcel name, crop badge, and profitability pill */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                            {item.parcel.name}
                          </h4>
                        </div>
                        <p className="text-xs text-stone-400 flex items-center gap-2">
                          <span>{item.parcel.producerName}</span>
                          <span>•</span>
                          <span className="font-mono">{item.parcel.surfaceHa} ha</span>
                          <span>•</span>
                          <span className="text-stone-300 font-medium">{item.parcel.crop}</span>
                        </p>
                      </div>

                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                          item.status === 'EXCELLENT'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : item.status === 'RENTABLE'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900'
                            : item.status === 'MODERE'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-900'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-900'
                        }`}
                      >
                        {item.status === 'EXCELLENT'
                          ? 'Très Rentable'
                          : item.status === 'RENTABLE'
                          ? 'Rentable'
                          : item.status === 'MODERE'
                          ? 'Marge Faible'
                          : 'Déficitaire'}
                      </span>
                    </div>

                    {/* Comparative Visual Bar: Ventes vs Coûts */}
                    <div className="space-y-1.5 bg-stone-950/60 p-3 rounded-xl border border-stone-850">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <ShoppingCart className="w-3 h-3" /> Ventes : {formatFcfa(item.totalRevenue)}
                        </span>
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <Receipt className="w-3 h-3" /> Coûts : {formatFcfa(item.totalCosts)}
                        </span>
                      </div>

                      <div className="w-full bg-stone-800 rounded-full h-2.5 overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full transition-all duration-500"
                          style={{ width: `${revPct}%` }}
                          title={`Ventes : ${revPct}%`}
                        />
                        <div
                          className="bg-rose-500 h-full transition-all duration-500"
                          style={{ width: `${costPct}%` }}
                          title={`Coûts : ${costPct}%`}
                        />
                      </div>

                      <div className="flex justify-between text-[10px] text-stone-500">
                        <span>{item.orders.length} contrat(s) de vente</span>
                        <span>{item.expenses.length} dépenses consignées</span>
                      </div>
                    </div>

                    {/* Net Margin & Unit KPI Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                      {/* Net Margin */}
                      <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">
                          Marge Bénéficiaire
                        </span>
                        <div
                          className={`text-sm font-black font-mono ${
                            isProfitable ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isProfitable ? '+' : ''}{formatFcfa(item.netMargin)}
                        </div>
                        <span className="text-[10px] text-stone-400">
                          Taux net : <strong className={isProfitable ? 'text-emerald-400' : 'text-rose-400'}>{item.marginRate}%</strong>
                        </span>
                      </div>

                      {/* Margin per Hectare */}
                      <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">
                          Marge / Hectare
                        </span>
                        <div className="text-sm font-black text-white font-mono">
                          {formatFcfa(item.marginPerHa)}
                        </div>
                        <span className="text-[10px] text-stone-500">
                          sur {item.parcel.surfaceHa} ha
                        </span>
                      </div>

                      {/* Coverage Ratio */}
                      <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800 col-span-2 sm:col-span-1">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">
                          Couverture Coûts
                        </span>
                        <div className="text-sm font-black text-indigo-300 font-mono">
                          {item.revenueToCostRatio}x
                        </div>
                        <span className="text-[10px] text-stone-500">
                          Chiffre d'Affaires / Dépenses
                        </span>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
                      <button
                        onClick={() => setInspectingParcelId(item.parcel.id)}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Détail Analytique</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSaleParcelId(item.parcel.id);
                            setShowAddSaleModal(true);
                          }}
                          className="px-2.5 py-1 bg-stone-800 hover:bg-emerald-950 hover:text-emerald-400 text-stone-300 rounded-lg text-xs font-medium transition cursor-pointer"
                        >
                          + Vente
                        </button>
                        <button
                          onClick={() => {
                            setExpenseParcelId(item.parcel.id);
                            setShowAddExpenseModal(true);
                          }}
                          className="px-2.5 py-1 bg-stone-800 hover:bg-rose-950 hover:text-rose-400 text-stone-300 rounded-lg text-xs font-medium transition cursor-pointer"
                        >
                          + Dépense
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-950/80 text-stone-400 uppercase font-semibold border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Parcelle & Culture</th>
                      <th className="py-3 px-4">Exploitant</th>
                      <th className="py-3 px-4 text-right">Surface</th>
                      <th className="py-3 px-4 text-right">Ventes Enregistrées</th>
                      <th className="py-3 px-4 text-right">Coûts Cumulés</th>
                      <th className="py-3 px-4 text-right">Marge Nette</th>
                      <th className="py-3 px-4 text-right">Taux Marge</th>
                      <th className="py-3 px-4 text-right">Marge / ha</th>
                      <th className="py-3 px-4 text-center">Statut</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 font-sans">
                    {filteredParcelStats.map((item) => {
                      const isProfitable = item.netMargin >= 0;
                      return (
                        <tr key={item.parcel.id} className="hover:bg-stone-850/50 transition">
                          <td className="py-3 px-4 font-bold text-white">
                            <div>{item.parcel.name}</div>
                            <div className="text-[11px] text-stone-400 font-normal">
                              {item.parcel.crop} ({item.parcel.variety})
                            </div>
                          </td>
                          <td className="py-3 px-4 text-stone-300">{item.parcel.producerName}</td>
                          <td className="py-3 px-4 text-right font-mono">{item.parcel.surfaceHa} ha</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                            {formatFcfa(item.totalRevenue)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                            {formatFcfa(item.totalCosts)}
                          </td>
                          <td className={`py-3 px-4 text-right font-mono font-black ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isProfitable ? '+' : ''}{formatFcfa(item.netMargin)}
                          </td>
                          <td className={`py-3 px-4 text-right font-mono font-bold ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {item.marginRate}%
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-white">
                            {formatFcfa(item.marginPerHa)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                item.status === 'EXCELLENT' || item.status === 'RENTABLE'
                                  ? 'bg-emerald-950 text-emerald-400'
                                  : item.status === 'MODERE'
                                  ? 'bg-amber-950 text-amber-400'
                                  : 'bg-rose-950 text-rose-400'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setInspectingParcelId(item.parcel.id)}
                              className="px-2.5 py-1 bg-stone-800 hover:bg-emerald-950 hover:text-emerald-400 text-stone-300 rounded-lg text-[11px] font-bold transition cursor-pointer"
                            >
                              Détail
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Summary Totals Footer */}
                  <tfoot className="bg-stone-950 font-bold border-t-2 border-stone-800 text-white">
                    <tr>
                      <td colSpan={2} className="py-3 px-4 uppercase text-stone-400">
                        Total {filteredParcelStats.length} parcelles filtrées
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {filteredParcelStats.reduce((acc, p) => acc + p.parcel.surfaceHa, 0).toFixed(1)} ha
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-400">
                        {formatFcfa(filteredParcelStats.reduce((acc, p) => acc + p.totalRevenue, 0))}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-rose-400">
                        {formatFcfa(filteredParcelStats.reduce((acc, p) => acc + p.totalCosts, 0))}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-300">
                        {formatFcfa(filteredParcelStats.reduce((acc, p) => acc + p.netMargin, 0))}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-stone-300">
                        {Math.round(
                          (filteredParcelStats.reduce((acc, p) => acc + p.netMargin, 0) /
                            (filteredParcelStats.reduce((acc, p) => acc + p.totalRevenue, 0) || 1)) *
                            100
                        )}%
                      </td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AUDIT DE RENTABILITÉ IA (GEMINI) */}
      {activeTab === 'audit-ia' && (
        <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 border border-emerald-900/60 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Audit de Rentabilité & Optimisation des Intrants (Gemini 3.8 Flash)
              </h3>
              <p className="text-xs text-stone-300">
                Analysez la structure de vos coûts agricoles pour identifier les opportunités d'économies et comparer au seuil de rentabilité.
              </p>
            </div>

            <button
              onClick={handleRunAiCostAudit}
              disabled={isAnalyzing}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 transition cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Audit IA en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Lancer l'Audit de Rentabilité</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* AI Result Display */}
          {analysisResult && (
            <div className="space-y-4 pt-3 border-t border-stone-800 animate-in fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-stone-900 p-3 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Marge Brute Projetée</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {formatFcfa(analysisResult.grossMarginFcfa)}
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">
                    ({analysisResult.marginPercentage}% CA)
                  </span>
                </div>

                <div className="bg-stone-900 p-3 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Prix de Rupture</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {analysisResult.breakevenPricePerKg} FCFA / kg
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Seuil zéro perte</span>
                </div>

                <div className="bg-stone-900 p-3 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Rendement Seuil</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {analysisResult.breakevenYieldTonnes} Tonnes
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Pour amortir</span>
                </div>

                <div className="bg-stone-900 p-3 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Score Viabilité</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {analysisResult.financialHealthScore}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-stone-900 rounded-xl border border-stone-800 space-y-1 text-xs text-stone-300">
                <strong className="text-stone-100 block">Évaluation de la structure des coûts :</strong>
                <p className="leading-relaxed">{analysisResult.costBreakdownAssessment}</p>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-800/60 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  Opportunités Concrètes d'Économies & Optimisations
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-200">
                  {(analysisResult.savingsOpportunities || []).map((op, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{op}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: JOURNAL & VENTILATION DES DÉPENSES */}
      {activeTab === 'journal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Category Breakdown Bars */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Répartition des Charges
            </h3>

            <div className="space-y-3">
              {Object.entries(expensesByCategory).map(([cat, val], idx) => {
                const numVal = Number(val) || 0;
                const pct = totalExpenseFcfa > 0 ? Math.round((numVal / totalExpenseFcfa) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-300">{cat}</span>
                      <span className="font-mono text-stone-200 font-bold">
                        {formatFcfa(numVal)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-stone-950 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 2 cols: Expense Journal */}
          <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Journal Récent des Dépenses Consignées
              </h3>
              <span className="text-xs text-stone-400">{expenses.length} dépenses</span>
            </div>

            <div className="divide-y divide-stone-800 max-h-[460px] overflow-y-auto pr-1">
              {expenses.map((exp) => (
                <div key={exp.id} className="py-3 flex items-center justify-between hover:bg-stone-850/30 px-2 rounded-lg transition">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-200">{exp.description}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 font-medium">
                        {exp.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 flex items-center gap-2">
                      <span className="text-emerald-400 font-medium">{exp.parcelName}</span>
                      <span>•</span>
                      <span>Règlement : {exp.paymentMethod || exp.paidVia || 'Cash'}</span>
                      <span>•</span>
                      <span>{exp.date}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-400 font-mono">
                      -{formatFcfa(exp.amountFcfa)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DRILL-DOWN ANALYTICAL INSPECTOR FOR A PARCEL */}
      {inspectedStats && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-stone-100 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{inspectedStats.parcel.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      inspectedStats.status === 'EXCELLENT' || inspectedStats.status === 'RENTABLE'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {inspectedStats.status}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Exploitant : <strong className="text-stone-300">{inspectedStats.parcel.producerName}</strong> | Culture :{' '}
                  <strong className="text-stone-300">{inspectedStats.parcel.crop}</strong> ({inspectedStats.parcel.variety}) | Surface :{' '}
                  <strong className="text-stone-300">{inspectedStats.parcel.surfaceHa} hectares</strong>
                </p>
              </div>

              <button
                onClick={() => setInspectingParcelId(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Summary Scorecard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Revenus Ventes</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {formatFcfa(inspectedStats.totalRevenue)}
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  Encaissé : {formatFcfa(inspectedStats.totalPaidRevenue)}
                </span>
              </div>

              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Coûts Cumulés</span>
                <span className="text-base font-black text-rose-400 font-mono">
                  {formatFcfa(inspectedStats.totalCosts)}
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  {inspectedStats.expenses.length} dépenses
                </span>
              </div>

              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Marge Nette</span>
                <span
                  className={`text-base font-black font-mono ${
                    inspectedStats.netMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {inspectedStats.netMargin >= 0 ? '+' : ''}{formatFcfa(inspectedStats.netMargin)}
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  Taux net : {inspectedStats.marginRate}%
                </span>
              </div>

              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Marge / Hectare</span>
                <span className="text-base font-black text-indigo-300 font-mono">
                  {formatFcfa(inspectedStats.marginPerHa)}
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  Ratio : {inspectedStats.revenueToCostRatio}x
                </span>
              </div>
            </div>

            {/* Side by side comparison: Ventes vs Dépenses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Sales recorded */}
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                    Ventes Enregistrées ({inspectedStats.orders.length})
                  </h4>
                  <button
                    onClick={() => {
                      setSaleParcelId(inspectedStats.parcel.id);
                      setShowAddSaleModal(true);
                    }}
                    className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Nouvelle Vente
                  </button>
                </div>

                {inspectedStats.orders.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-stone-800 rounded-xl space-y-2">
                    <p className="text-xs text-stone-500">Aucune vente enregistrée pour cette parcelle.</p>
                    <button
                      onClick={() => {
                        setSaleParcelId(inspectedStats.parcel.id);
                        setShowAddSaleModal(true);
                      }}
                      className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Enregistrer un contrat de vente
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {inspectedStats.orders.map((o) => (
                      <div key={o.id} className="p-2.5 bg-stone-900 border border-stone-800 rounded-xl space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-stone-200">{o.buyerName}</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            +{formatFcfa(o.totalAmountFcfa)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-stone-400">
                          <span>
                            {o.quantityKg ? `${formatNumber(o.quantityKg)} kg` : 'Lot'} • {o.orderNumber}
                          </span>
                          <span className="text-emerald-300">{o.paymentStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Expenses recorded */}
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Receipt className="w-3.5 h-3.5 text-rose-400" />
                    Coûts Cumulés ({inspectedStats.expenses.length})
                  </h4>
                  <button
                    onClick={() => {
                      setExpenseParcelId(inspectedStats.parcel.id);
                      setShowAddExpenseModal(true);
                    }}
                    className="text-[11px] font-bold text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Nouvelle Dépense
                  </button>
                </div>

                {inspectedStats.expenses.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-stone-800 rounded-xl">
                    <p className="text-xs text-stone-500">Aucune charge consignée sur cette parcelle.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {inspectedStats.expenses.map((e) => (
                      <div key={e.id} className="p-2.5 bg-stone-900 border border-stone-800 rounded-xl space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-stone-200">{e.description}</span>
                          <span className="text-xs font-mono font-bold text-rose-400">
                            -{formatFcfa(e.amountFcfa)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-stone-400">
                          <span className="px-1.5 py-0.2 rounded bg-stone-800 text-[10px]">{e.category}</span>
                          <span>{e.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Economic Assessment note */}
            <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-300 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-100">Bilan Économique : </strong>
                {inspectedStats.netMargin > 0 ? (
                  <span>
                    La parcelle dégage un excédent net de <strong>{formatFcfa(inspectedStats.netMargin)}</strong> ({inspectedStats.marginRate}% de marge).
                    Les charges d'exploitation ({formatFcfa(inspectedStats.totalCosts)}) représentent seulement{' '}
                    {Math.round((inspectedStats.totalCosts / (inspectedStats.totalRevenue || 1)) * 100)}% des revenus encaissés.
                  </span>
                ) : (
                  <span>
                    Attention, les charges d'exploitation ({formatFcfa(inspectedStats.totalCosts)}) dépassent actuellement les recettes vendues.
                    Assurez-vous de consigner toutes les récoltes et contrats de vente associés pour équilibrer la balance.
                  </span>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-stone-800">
              <button
                onClick={() => setInspectingParcelId(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ENREGISTRER UNE VENTE POUR UNE PARCELLE */}
      {showAddSaleModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-stone-100 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" /> Enregistrer une Vente de Parcelle
              </h3>
              <button
                onClick={() => setShowAddSaleModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-3">
              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Parcelle d'origine de la récolte
                </label>
                <select
                  value={saleParcelId}
                  onChange={(e) => setSaleParcelId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                >
                  {parcels.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.crop} ({p.surfaceHa} ha)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">Acheteur / Client</label>
                <select
                  value={saleBuyerName}
                  onChange={(e) => setSaleBuyerName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                >
                  {buyersList.map((b) => (
                    <option key={b.id} value={b.companyName}>
                      {b.companyName} ({b.category})
                    </option>
                  ))}
                  <option value="CEMOI Chocolaterie Côte d'Ivoire">CEMOI Chocolaterie Côte d'Ivoire</option>
                  <option value="Barry Callebaut San Pedro">Barry Callebaut San Pedro</option>
                  <option value="Cargill West Africa">Cargill West Africa</option>
                  <option value="Comptoir Local Bord-Champ">Comptoir Local Bord-Champ</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Quantité (kg)
                  </label>
                  <input
                    type="number"
                    value={saleQuantityKg}
                    onChange={(e) => setSaleQuantityKg(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Prix Unitaire (FCFA/kg)
                  </label>
                  <input
                    type="number"
                    value={saleUnitPriceKg}
                    onChange={(e) => setSaleUnitPriceKg(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Total Calculation Preview */}
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex items-center justify-between">
                <span className="text-xs text-stone-400">Total Recette Brute :</span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {formatFcfa((Number(saleQuantityKg) || 0) * (Number(saleUnitPriceKg) || 0))}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">Règlement</label>
                  <select
                    value={salePaidStatus}
                    onChange={(e) => setSalePaidStatus(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  >
                    <option value="Payé intégral">Payé 100% Mobile Money</option>
                    <option value="Acompte versé">Acompte versé (30%)</option>
                    <option value="En attente">En attente de versement</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">Canal de Paiement</label>
                  <select
                    value={salePaymentMethod}
                    onChange={(e) => setSalePaymentMethod(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  >
                    <option value="Wave">Wave</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="MTN MoMo">MTN MoMo</option>
                    <option value="Virement bancaire">Virement bancaire</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">Destination / Réf</label>
                <input
                  type="text"
                  placeholder="Ex: Quai Portuaire San Pedro / Silo Central"
                  value={saleDestination}
                  onChange={(e) => setSaleDestination(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddSaleModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow cursor-pointer"
                >
                  Enregistrer la Vente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONSIGNER UNE DÉPENSE */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-stone-100 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-rose-400" /> Consigner une Dépense d'Exploitation
              </h3>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Parcelle concernée
                </label>
                <select
                  value={expenseParcelId}
                  onChange={(e) => setExpenseParcelId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                >
                  {parcels.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.crop})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">Catégorie</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                >
                  <option value="Main d'œuvre">Main d'œuvre (ouvriers agricoles)</option>
                  <option value="Engrais & Amendements">Engrais & Amendements</option>
                  <option value="Produits Phytosanitaires">Produits Phytosanitaires</option>
                  <option value="Carburant & Mécanisation">Carburant & Mécanisation</option>
                  <option value="Transport">Transport</option>
                  <option value="Conditionnement">Conditionnement (sacs jute)</option>
                  <option value="Semences">Semences & Plants certifiés</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Montant (FCFA)
                  </label>
                  <input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">Règlement</label>
                  <select
                    value={expensePaymentMethod}
                    onChange={(e) => setExpensePaymentMethod(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  >
                    <option value="Wave">Wave</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="MTN MoMo">MTN MoMo</option>
                    <option value="Cash">Espèces</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Ex: Rémunération émondage 3 ouvriers"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow cursor-pointer"
                >
                  Consigner Dépense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
