import React, { useState } from 'react';
import {
  Package,
  DollarSign,
  Send,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  Building,
  Smartphone,
  Receipt,
  FileText,
  AlertCircle,
  Plus,
  Printer,
  Search,
  Filter,
  Trash2,
  QrCode,
  Share2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Order, PaymentTransaction, Cooperative } from '../types';
import { formatFcfa, formatNumber } from '../services/storageService';

interface OrdersAndPaymentsViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onRecordPayment: (orderId: string, payment: Omit<PaymentTransaction, 'id'>) => void;
  onAddOrder?: (order: Order) => void;
  onDeleteOrder?: (orderId: string) => void;
  onSendSmsAlert?: (phone: string, msg: string) => void;
  cooperatives?: Cooperative[];
}

export const OrdersAndPaymentsView: React.FC<OrdersAndPaymentsViewProps> = ({
  orders,
  onUpdateOrderStatus,
  onRecordPayment,
  onAddOrder,
  onDeleteOrder,
  onSendSmsAlert,
  cooperatives = [],
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'En attente acompte' | 'Acompte versé' | 'Payé intégral'>('Tous');

  // Selected Order with real-time reactive sync
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0] || null;

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('5000000');
  const [paymentMethod, setPaymentMethod] = useState<'Wave' | 'Orange Money' | 'MTN MoMo' | 'Moov Money' | 'Virement bancaire' | 'Espèces'>('Wave');
  const [phoneRecipient, setPhoneRecipient] = useState('+225 07 88 99 00 11');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState<string | null>(null);

  // New Order Modal State
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newBuyerName, setNewBuyerName] = useState('Barry Callebaut Côte d\'Ivoire');
  const [newBuyerContact, setNewBuyerContact] = useState('+225 27 21 00 00 00');
  const [newSellerCoop, setNewSellerCoop] = useState(cooperatives[0]?.name || 'COOPAZA Soubré');
  const [newCrop, setNewCrop] = useState('Cacao Fèves (Grade 1)');
  const [newQuantityTons, setNewQuantityTons] = useState('25');
  const [newUnitPriceFcfaKg, setNewUnitPriceFcfaKg] = useState('2150');
  const [newDeliveryLocation, setNewDeliveryLocation] = useState('Zone Portuaire de Vridi, Abidjan');
  const [newDeliveryDeadline, setNewDeliveryDeadline] = useState('15 Décembre 2026');

  // Printable Voucher / Invoice Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Calculations
  const totalTurnover = orders.reduce((acc, o) => acc + (o.totalAmountFcfa || 0), 0);
  const totalPaid = orders.reduce((acc, o) => acc + (o.paidAmountFcfa || 0), 0);
  const totalPending = Math.max(0, totalTurnover - totalPaid);
  const recoveryRate = totalTurnover > 0 ? ((totalPaid / totalTurnover) * 100).toFixed(1) : '0';

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.crop || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'Tous') return matchesSearch;
    return matchesSearch && o.paymentStatus === statusFilter;
  });

  // Open Payment Modal prefilled with remaining balance
  const handleOpenPaymentModal = () => {
    if (!selectedOrder) return;
    const remaining = Math.max(0, (selectedOrder.totalAmountFcfa || 0) - (selectedOrder.paidAmountFcfa || 0));
    setPaymentAmount(remaining > 0 ? remaining.toString() : '1000000');
    setPhoneRecipient(selectedOrder.buyerContact || '+225 07 88 99 00 11');
    setPaymentNote(`Règlement contrat ${selectedOrder.orderNumber}`);
    setShowPaymentModal(true);
  };

  // Submit Payment
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const amount = Number(paymentAmount) || 0;
    if (amount <= 0) return;

    const reference = `${paymentMethod.toUpperCase().replace(/\s+/g, '')}-${Math.floor(100000 + Math.random() * 900000)}`;

    onRecordPayment(selectedOrder.id, {
      orderId: selectedOrder.id,
      amountFcfa: amount,
      method: paymentMethod,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      reference,
      status: 'Effectué',
      recipientPhone: phoneRecipient,
      smsReceiptSent: true,
    });

    setPaymentSuccessNotice(
      `Paiement de ${formatFcfa(amount)} via ${paymentMethod} (Réf: ${reference}) enregistré. Reçu SMS expédié.`
    );
    setShowPaymentModal(false);
    setTimeout(() => setPaymentSuccessNotice(null), 6000);
  };

  // Quick preset amount buttons
  const handleSetPresetAmount = (percentage: number) => {
    if (!selectedOrder) return;
    if (percentage === 100) {
      const remaining = Math.max(0, (selectedOrder.totalAmountFcfa || 0) - (selectedOrder.paidAmountFcfa || 0));
      setPaymentAmount(remaining.toString());
    } else {
      const amt = Math.round((selectedOrder.totalAmountFcfa * percentage) / 100);
      setPaymentAmount(amt.toString());
    }
  };

  // Create New Order
  const handleCreateNewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const tons = Number(newQuantityTons) || 10;
    const qtyKg = tons * 1000;
    const unitPrice = Number(newUnitPriceFcfaKg) || 2000;
    const totalAmount = qtyKg * unitPrice;

    const orderNumber = `CMD-CI-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      buyerId: `buyer-${Date.now()}`,
      buyerName: newBuyerName,
      buyerContact: newBuyerContact,
      sellerId: 'coop-1',
      sellerName: newSellerCoop,
      crop: newCrop,
      quantityKg: qtyKg,
      unitPriceFcfaKg: unitPrice,
      totalAmountFcfa: totalAmount,
      paidAmountFcfa: 0,
      paymentStatus: 'En attente acompte',
      status: 'Confirmée',
      deliveryLocation: newDeliveryLocation,
      deliveryDeadline: newDeliveryDeadline,
      createdAt: new Date().toISOString().split('T')[0],
      transactions: [],
    };

    if (onAddOrder) {
      onAddOrder(newOrder);
    }
    setSelectedOrderId(newOrder.id);
    setShowNewOrderModal(false);

    setPaymentSuccessNotice(`Nouveau Bon de Commande ${orderNumber} créé avec succès.`);
    setTimeout(() => setPaymentSuccessNotice(null), 5000);
  };

  // Send SMS Summary
  const handleSendOrderSms = () => {
    if (!selectedOrder) return;
    const remaining = Math.max(0, (selectedOrder.totalAmountFcfa || 0) - (selectedOrder.paidAmountFcfa || 0));
    const msg = `AGRILINK: Bon ${selectedOrder.orderNumber} (${selectedOrder.crop}) - Total: ${formatFcfa(selectedOrder.totalAmountFcfa)}, Payé: ${formatFcfa(selectedOrder.paidAmountFcfa || 0)}, Reste: ${formatFcfa(remaining)}. Livraison: ${selectedOrder.deliveryDeadline}.`;

    if (onSendSmsAlert) {
      onSendSmsAlert(selectedOrder.buyerContact || '+225 07 00 00 00 00', msg);
    }
    setPaymentSuccessNotice(`SMS de confirmation du bon ${selectedOrder.orderNumber} expédié avec succès.`);
    setTimeout(() => setPaymentSuccessNotice(null), 4000);
  };

  // Delete Order confirmation
  const handleDeleteOrder = (orderId: string) => {
    if (!confirm('Êtes-vous certain de vouloir supprimer ce bon de commande ?')) return;
    if (onDeleteOrder) {
      onDeleteOrder(orderId);
      const remainingOrders = orders.filter((o) => o.id !== orderId);
      if (remainingOrders.length > 0) {
        setSelectedOrderId(remainingOrders[0].id);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Global Stats & Add Order Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-white font-display flex items-center gap-2">
            <span className="p-1.5 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800">
              <Package className="w-5 h-5" />
            </span>
            <span>Commandes & Règlements Mobile Money</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Gestion intégrale des contrats d'achat B2B, validation des acomptes Wave / Orange Money et facturation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl">
              <span className="text-[10px] text-stone-400 uppercase font-medium block">Total Ventes</span>
              <strong className="text-white font-mono">{formatFcfa(totalTurnover)}</strong>
            </div>
            <div className="px-3 py-1.5 bg-stone-950 border border-emerald-900/50 rounded-xl">
              <span className="text-[10px] text-emerald-400 uppercase font-medium block">Encaissé</span>
              <strong className="text-emerald-400 font-mono">{formatFcfa(totalPaid)}</strong>
            </div>
            <div className="px-3 py-1.5 bg-stone-950 border border-amber-900/50 rounded-xl">
              <span className="text-[10px] text-amber-400 uppercase font-medium block">Recouvrement</span>
              <strong className="text-amber-400 font-mono">{recoveryRate}%</strong>
            </div>
          </div>

          <button
            onClick={() => setShowNewOrderModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Bon de Commande</span>
          </button>
        </div>
      </div>

      {paymentSuccessNotice && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-100 shadow-md animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{paymentSuccessNotice}</span>
          </div>
          <button
            onClick={() => setPaymentSuccessNotice(null)}
            className="text-stone-400 hover:text-white text-xs px-2 py-1 rounded bg-stone-800 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Orders List & Detailed Order Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (4 cols): Orders List with Search and Filters */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" /> Bons de Commande ({filteredOrders.length})
            </span>
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Créer
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-500" />
            <input
              type="text"
              placeholder="Rechercher bon, acheteur, culture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:border-emerald-500"
            />
          </div>

          {/* Status Filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
            {(['Tous', 'En attente acompte', 'Acompte versé', 'Payé intégral'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Orders Cards List */}
          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center bg-stone-900 border border-stone-800 rounded-2xl text-xs text-stone-400">
                <Package className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                <p>Aucun bon de commande ne correspond aux critères.</p>
              </div>
            ) : (
              filteredOrders.map((ord) => {
                const isSelected = selectedOrder?.id === ord.id;
                const paid = ord.paidAmountFcfa || 0;
                const pct = ord.totalAmountFcfa > 0 ? Math.min(100, Math.round((paid / ord.totalAmountFcfa) * 100)) : 0;

                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrderId(ord.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition text-left relative ${
                      isSelected
                        ? 'bg-stone-850 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                        : 'bg-stone-900 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                          {ord.orderNumber}
                        </span>
                        <h4 className="text-xs font-semibold text-stone-200 mt-0.5 line-clamp-1">{ord.buyerName}</h4>
                        <p className="text-[11px] text-stone-400">
                          {ord.crop} • {((ord.quantityKg || 0) / 1000).toFixed(1)} T
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                          ord.paymentStatus === 'Payé intégral'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : ord.paymentStatus === 'Acompte versé'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </div>

                    {/* Mini progress bar */}
                    <div className="mt-2.5">
                      <div className="flex justify-between text-[10px] text-stone-400 mb-1 font-mono">
                        <span>{pct}% réglé</span>
                        <span className="text-emerald-400 font-bold">{formatFcfa(ord.totalAmountFcfa)}</span>
                      </div>
                      <div className="w-full bg-stone-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col (8 cols): Active Purchase Order Details, Interactive Controls & Mobile Money Gateway */}
        <div className="lg:col-span-8">
          {selectedOrder ? (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Top Order Header & Main Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      Bon de Commande {selectedOrder.orderNumber}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      {selectedOrder.status}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        selectedOrder.paymentStatus === 'Payé intégral'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : selectedOrder.paymentStatus === 'Acompte versé'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Émis le {selectedOrder.createdAt || selectedOrder.createdDate || '10 Septembre 2026'} • Vendeur : <strong className="text-stone-300">{selectedOrder.sellerName || 'Coopérative Locale'}</strong>
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-stone-700 transition cursor-pointer"
                    title="Imprimer ou exporter le reçu officiel"
                  >
                    <Printer className="w-3.5 h-3.5 text-stone-400" />
                    <span>Imprimer / Reçu</span>
                  </button>

                  <button
                    onClick={handleSendOrderSms}
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-amber-800/40 transition cursor-pointer"
                    title="Envoyer un rappel par SMS"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Notification SMS</span>
                  </button>

                  <button
                    onClick={handleOpenPaymentModal}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Encaisser Paiement</span>
                  </button>
                </div>
              </div>

              {/* Order Info Cards: Buyer & Product Spec */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-stone-850 p-4 rounded-xl border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 font-bold uppercase text-[10px] flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-emerald-400" /> Acheteur Industriel
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Client Vérifié</span>
                  </div>
                  <strong className="text-sm font-bold text-white block">
                    {selectedOrder.buyerName}
                  </strong>
                  <div className="space-y-1 text-stone-300">
                    <p className="flex items-center gap-1.5 text-stone-300">
                      <Smartphone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{selectedOrder.buyerContact || '+225 27 21 00 00 00'}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-stone-400">
                      <Truck className="w-3.5 h-3.5 text-stone-500" />
                      <span>Livraison : {selectedOrder.deliveryLocation || 'Port d\'Abidjan'}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-stone-400">
                      <Clock className="w-3.5 h-3.5 text-stone-500" />
                      <span>Date limite : {selectedOrder.deliveryDeadline || '30 Novembre 2026'}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-stone-850 p-4 rounded-xl border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 font-bold uppercase text-[10px] flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-emerald-400" /> Spécifications & Tarifs
                    </span>
                    <span className="text-[10px] text-amber-400 font-semibold font-mono">
                      {selectedOrder.unitPriceFcfaKg || 2150} FCFA / kg
                    </span>
                  </div>
                  <strong className="text-sm font-bold text-emerald-400 block">
                    {selectedOrder.crop || 'Cacao Fèves (Grade 1)'}
                  </strong>
                  <div className="space-y-1 text-stone-300">
                    <p className="flex items-center justify-between">
                      <span className="text-stone-400">Volume Contractuel :</span>
                      <span className="font-bold text-white font-mono">
                        {formatNumber(((selectedOrder.quantityKg || 0) / 1000), 1)} Tonnes ({((selectedOrder.quantityKg || 0)).toLocaleString()} kg)
                      </span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-stone-400">Prix unitaire convenu :</span>
                      <span className="font-bold text-stone-200 font-mono">
                        {formatFcfa(selectedOrder.unitPriceFcfaKg || 2150)} / kg
                      </span>
                    </p>
                    <p className="flex items-center justify-between pt-1 border-t border-stone-700/60 font-semibold">
                      <span className="text-stone-300">Montant Total du Bon :</span>
                      <span className="font-bold text-emerald-400 font-mono text-sm">
                        {formatFcfa(selectedOrder.totalAmountFcfa)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Progress Bar & Summary */}
              <div className="space-y-2 bg-stone-850 p-4 rounded-xl border border-stone-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span className="text-stone-300 font-semibold">Statut des Encaisses :</span>
                  </div>
                  <div className="font-mono text-xs">
                    <span className="text-emerald-400 font-bold">{formatFcfa(selectedOrder.paidAmountFcfa || 0)}</span>
                    <span className="text-stone-400"> payés sur </span>
                    <span className="text-white font-bold">{formatFcfa(selectedOrder.totalAmountFcfa)}</span>
                    <span className="text-amber-400 font-bold ml-2">
                      (Reste : {formatFcfa(Math.max(0, selectedOrder.totalAmountFcfa - (selectedOrder.paidAmountFcfa || 0)))})
                    </span>
                  </div>
                </div>

                <div className="w-full bg-stone-950 rounded-full h-3 overflow-hidden p-0.5 border border-stone-800">
                  <div
                    className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(((selectedOrder.paidAmountFcfa || 0) / (selectedOrder.totalAmountFcfa || 1)) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Status Workflow Controls */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-400" /> Faire Évoluer l'État du Bon de Commande
                  </span>
                  <span className="text-[11px] text-stone-400">Cliquez pour actualiser l'avancement</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {(['Demande', 'Confirmée', 'Préparation', 'En transit', 'Livrée', 'Soldée'] as const).map((st) => {
                    const isActive = selectedOrder.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => {
                          onUpdateOrderStatus(selectedOrder.id, st);
                          setPaymentSuccessNotice(`Statut du bon ${selectedOrder.orderNumber} mis à jour : "${st}".`);
                          setTimeout(() => setPaymentSuccessNotice(null), 3500);
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                          isActive
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-1 ring-emerald-400'
                            : 'bg-stone-850 text-stone-300 border-stone-800 hover:border-stone-700 hover:text-white'
                        }`}
                      >
                        {st === 'Confirmée' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {st === 'Préparation' && <Clock className="w-3.5 h-3.5" />}
                        {st === 'En transit' && <Truck className="w-3.5 h-3.5" />}
                        {st === 'Livrée' && <Package className="w-3.5 h-3.5" />}
                        {st === 'Soldée' && <DollarSign className="w-3.5 h-3.5" />}
                        {st === 'Demande' && <FileText className="w-3.5 h-3.5" />}
                        <span>{st}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Transactions History Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-emerald-400" /> Historique des Règlements Mobile Money & Banque
                  </span>
                  <button
                    onClick={handleOpenPaymentModal}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter un encaissement
                  </button>
                </div>

                {!selectedOrder.transactions || selectedOrder.transactions.length === 0 ? (
                  <div className="p-6 text-center bg-stone-850 border border-stone-800 rounded-xl">
                    <CreditCard className="w-6 h-6 text-stone-600 mx-auto mb-1.5" />
                    <p className="text-xs text-stone-400 font-medium">Aucun versement enregistré pour le moment.</p>
                    <button
                      onClick={handleOpenPaymentModal}
                      className="mt-2.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-xs font-semibold border border-emerald-500/40 transition cursor-pointer"
                    >
                      Encaisser le premier acompte
                    </button>
                  </div>
                ) : (
                  <div className="bg-stone-850 rounded-xl border border-stone-800 divide-y divide-stone-800 overflow-hidden">
                    {selectedOrder.transactions.map((tx) => (
                      <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-stone-800/40 transition">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white bg-stone-900 px-2 py-0.5 rounded border border-stone-700">
                              {tx.method}
                            </span>
                            <span className="text-[11px] font-mono text-emerald-400 font-semibold">{tx.reference}</span>
                            {tx.smsReceiptSent && (
                              <span className="text-[10px] text-amber-400 flex items-center gap-0.5 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                                <Send className="w-2.5 h-2.5" /> SMS Reçu OK
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-stone-400 block mt-1">
                            Bénéficiaire : {tx.recipientPhone || 'Compte Coopérative'}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-emerald-400 font-mono text-sm block">
                            +{formatFcfa(tx.amountFcfa)}
                          </span>
                          <span className="text-[10px] text-stone-500">{tx.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-800 text-xs text-stone-400">
                <button
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1.5 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Supprimer ce bon
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="text-stone-300 hover:text-white flex items-center gap-1 font-semibold cursor-pointer px-3 py-1.5 rounded-lg bg-stone-800"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Aperçu Facture Proforma
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center text-stone-400 space-y-3">
              <Package className="w-12 h-12 text-stone-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Aucun bon de commande sélectionné</h3>
              <p className="text-xs max-w-sm mx-auto">Sélectionnez une commande dans la liste ou créez-en une nouvelle pour démarrer le suivi.</p>
              <button
                onClick={() => setShowNewOrderModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                + Nouveau Bon de Commande
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Process Payment via Mobile Money / Banque */}
      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-stone-100 space-y-4 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" /> Encaisser via Mobile Money / Banque
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-stone-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs space-y-1">
              <div className="flex justify-between text-stone-400">
                <span>Bon de commande :</span>
                <strong className="text-white font-mono">{selectedOrder.orderNumber}</strong>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Total commande :</span>
                <span className="font-mono font-bold text-white">{formatFcfa(selectedOrder.totalAmountFcfa)}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Déjà réglé :</span>
                <span className="font-mono text-emerald-400">{formatFcfa(selectedOrder.paidAmountFcfa || 0)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-stone-800 text-amber-400 font-bold">
                <span>Reste à percevoir :</span>
                <span className="font-mono">
                  {formatFcfa(Math.max(0, selectedOrder.totalAmountFcfa - (selectedOrder.paidAmountFcfa || 0)))}
                </span>
              </div>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Montant à encaisser (FCFA) <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="number"
                  min="1000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-lg font-bold font-mono text-emerald-400 focus:border-emerald-500"
                  required
                />

                {/* Quick Presets */}
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleSetPresetAmount(30)}
                    className="flex-1 py-1 bg-stone-800 hover:bg-stone-700 text-[11px] font-semibold text-stone-300 rounded-lg border border-stone-700 cursor-pointer"
                  >
                    Acompte 30%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetAmount(50)}
                    className="flex-1 py-1 bg-stone-800 hover:bg-stone-700 text-[11px] font-semibold text-stone-300 rounded-lg border border-stone-700 cursor-pointer"
                  >
                    Acompte 50%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetAmount(100)}
                    className="flex-1 py-1 bg-emerald-950 hover:bg-emerald-900 text-[11px] font-bold text-emerald-300 rounded-lg border border-emerald-700 cursor-pointer"
                  >
                    Solde Total (100%)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1.5">
                  Opérateur / Canal de Paiement
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Wave', 'Orange Money', 'MTN MoMo', 'Moov Money', 'Virement bancaire', 'Espèces'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                        paymentMethod === m
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-1 ring-emerald-400'
                          : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Numéro Mobile Money du payeur / expéditeur
                </label>
                <input
                  type="text"
                  value={phoneRecipient}
                  onChange={(e) => setPhoneRecipient(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Référence / Note interne (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Reçu de virement Wave #94827"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-[11px] text-stone-400 flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Un SMS de reçu avec code de confirmation sera instantanément transmis au client.</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider l'Encaissement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create New Purchase Order */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 text-stone-100 space-y-4 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" /> Émettre un Nouveau Bon de Commande B2B
              </h3>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-stone-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewOrder} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Acheteur Industriel / Entreprise <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Barry Callebaut, Cargill, CEMOI..."
                    value={newBuyerName}
                    onChange={(e) => setNewBuyerName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Contact Téléphonique Acheteur <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="+225 27 21 00 00 00"
                    value={newBuyerContact}
                    onChange={(e) => setNewBuyerContact(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Coopérative Émettrice / Vendeur
                  </label>
                  <input
                    type="text"
                    value={newSellerCoop}
                    onChange={(e) => setNewSellerCoop(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Spéculation / Culture
                  </label>
                  <select
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  >
                    <option value="Cacao Fèves (Grade 1)">Cacao Fèves (Grade 1 - Supérieur)</option>
                    <option value="Café Robusta">Café Robusta (Grade 1)</option>
                    <option value="Noix de Cajou / Anacarde (KOR 48+)">Noix de Cajou / Anacarde (KOR 48+)</option>
                    <option value="Maïs Grain Blanc">Maïs Grain Blanc (Séchage 13%)</option>
                    <option value="Soja Grain">Soja Grain Protéagineux</option>
                    <option value="Riz Paddy Local">Riz Paddy Local</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-950 p-3 rounded-xl border border-stone-800">
                <div>
                  <label className="text-[11px] text-stone-400 font-medium block mb-1">
                    Volume en Tonnes (T)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newQuantityTons}
                    onChange={(e) => setNewQuantityTons(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-stone-400 font-medium block mb-1">
                    Prix FCFA / Kg
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={newUnitPriceFcfaKg}
                    onChange={(e) => setNewUnitPriceFcfaKg(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-stone-400 font-medium block mb-1">
                    Montant Total Calculé
                  </label>
                  <div className="px-2.5 py-1.5 bg-stone-900 border border-emerald-800 rounded-lg text-xs font-bold text-emerald-400 font-mono">
                    {formatFcfa((Number(newQuantityTons) || 0) * 1000 * (Number(newUnitPriceFcfaKg) || 0))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Lieu de Livraison Convenu
                  </label>
                  <input
                    type="text"
                    value={newDeliveryLocation}
                    onChange={(e) => setNewDeliveryLocation(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-300 font-semibold block mb-1">
                    Date Limite de Livraison
                  </label>
                  <input
                    type="text"
                    value={newDeliveryDeadline}
                    onChange={(e) => setNewDeliveryDeadline(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer le Bon de Commande</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Official Printable Purchase Order / Facture Proforma */}
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-stone-900 rounded-2xl w-full max-w-2xl shadow-2xl p-8 space-y-6 my-8 print:p-0 print:shadow-none print:w-full">
            {/* Header Voucher */}
            <div className="flex items-start justify-between border-b border-stone-200 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                    AG
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">AGRILINK PLATFORM</h1>
                    <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">
                      Système Intégré de Commerce Agricole & Traçabilité
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-stone-600">
                  <p>Coopérative : <strong>{selectedOrder.sellerName || 'COOPAZA Soubré'}</strong></p>
                  <p>Région de la Nawa • Côte d'Ivoire</p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold uppercase inline-block mb-1">
                  BON DE COMMANDE OFFICIEL
                </span>
                <p className="text-sm font-mono font-bold text-stone-900">{selectedOrder.orderNumber}</p>
                <p className="text-xs text-stone-500">Date : {selectedOrder.createdAt || '10/09/2026'}</p>
                <p className="text-xs text-emerald-700 font-bold mt-1">Statut : {selectedOrder.status}</p>
              </div>
            </div>

            {/* Buyer & Seller Details */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div>
                <p className="text-[10px] font-bold uppercase text-stone-400 mb-1">Client / Acheteur</p>
                <p className="text-sm font-bold text-stone-900">{selectedOrder.buyerName}</p>
                <p className="text-stone-600">Contact : {selectedOrder.buyerContact}</p>
                <p className="text-stone-600">Destination : {selectedOrder.deliveryLocation}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-stone-400 mb-1">Conditions de Règlement</p>
                <p className="font-semibold text-stone-800">Mobile Money (Wave / Orange) ou Virement</p>
                <p className="text-stone-600">Délai d'expédition : {selectedOrder.deliveryDeadline}</p>
                <p className="font-bold text-emerald-700 mt-1">Règlement : {selectedOrder.paymentStatus}</p>
              </div>
            </div>

            {/* Line items table */}
            <table className="w-full text-xs text-left border border-stone-200 rounded-lg overflow-hidden">
              <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Désignation Produit</th>
                  <th className="p-2.5 text-right">Volume (Kg)</th>
                  <th className="p-2.5 text-right">Prix Unitaire</th>
                  <th className="p-2.5 text-right">Total HT (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr>
                  <td className="p-2.5 font-semibold text-stone-900">
                    {selectedOrder.crop || 'Cacao Fèves (Grade 1)'}
                    <span className="block text-[10px] text-stone-500 font-normal">Certification & Traçabilité Géolocalisée</span>
                  </td>
                  <td className="p-2.5 text-right font-mono font-medium">
                    {((selectedOrder.quantityKg || 0)).toLocaleString()} kg
                  </td>
                  <td className="p-2.5 text-right font-mono font-medium">
                    {selectedOrder.unitPriceFcfaKg || 2150} FCFA
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-stone-900">
                    {formatFcfa(selectedOrder.totalAmountFcfa)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-stone-50 border-t border-stone-200">
                <tr>
                  <td colSpan={3} className="p-2.5 font-bold text-stone-700 text-right">Total Contrat :</td>
                  <td className="p-2.5 text-right font-bold text-stone-900 font-mono text-sm">
                    {formatFcfa(selectedOrder.totalAmountFcfa)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="p-2.5 font-bold text-emerald-700 text-right">Total Acomptes Reçus :</td>
                  <td className="p-2.5 text-right font-bold text-emerald-700 font-mono">
                    -{formatFcfa(selectedOrder.paidAmountFcfa || 0)}
                  </td>
                </tr>
                <tr className="bg-emerald-50 text-emerald-900">
                  <td colSpan={3} className="p-2.5 font-extrabold text-right">Reste Net à Payer :</td>
                  <td className="p-2.5 text-right font-extrabold font-mono text-base text-emerald-900">
                    {formatFcfa(Math.max(0, selectedOrder.totalAmountFcfa - (selectedOrder.paidAmountFcfa || 0)))}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Transactions History on printable voucher */}
            {selectedOrder.transactions && selectedOrder.transactions.length > 0 && (
              <div className="space-y-1 text-xs">
                <p className="font-bold text-stone-700 uppercase text-[10px]">Reçus de Paiements Confirmés :</p>
                <div className="space-y-1">
                  {selectedOrder.transactions.map((t) => (
                    <div key={t.id} className="flex justify-between p-1.5 bg-stone-50 border border-stone-200 rounded text-[11px]">
                      <span>{t.method} • Réf: <strong>{t.reference}</strong> ({t.timestamp})</span>
                      <span className="font-bold text-emerald-700 font-mono">+{formatFcfa(t.amountFcfa)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signatures & Stamp */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-stone-200 text-xs">
              <div className="text-center p-3 border border-dashed border-stone-300 rounded-xl h-24 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-stone-400">Signature de l'Acheteur</span>
                <span className="text-[10px] text-stone-500 italic">Mention "Bon pour accord"</span>
              </div>
              <div className="text-center p-3 border border-dashed border-stone-300 rounded-xl h-24 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-stone-400">Cachet & Signature Coopérative</span>
                <span className="text-[10px] text-stone-500 italic">Validé sur plateforme AGRILINK</span>
              </div>
            </div>

            {/* Modal action bar (hidden in print) */}
            <div className="flex justify-end gap-2 pt-4 border-t border-stone-200 print:hidden">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-xs font-semibold text-stone-800 cursor-pointer"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-xs font-bold text-white shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Imprimer / Exporter PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
