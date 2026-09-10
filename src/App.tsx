import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storageService';
import {
  Producer,
  Cooperative,
  Parcel,
  WarehouseStock,
  HarvestRecord,
  ExpenseRecord,
  BuyerDemand,
  MarketplaceListing,
  Order,
  CommodityPrice,
  WeatherData,
  AgrilinkAlert,
  SmsOutboxItem,
  OfflineSyncItem,
  PaymentTransaction,
  TransportShipment,
} from './types';

// Components
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { FieldMobileView } from './components/FieldMobileView';
import { ParcelsAndCropsView } from './components/ParcelsAndCropsView';
import { StocksView } from './components/StocksView';
import { CostsAndFinanceView } from './components/CostsAndFinanceView';
import { MarketplaceB2BView } from './components/MarketplaceB2BView';
import { OrdersAndPaymentsView } from './components/OrdersAndPaymentsView';
import { TransportTraceabilityView } from './components/TransportTraceabilityView';
import { WeatherAndAlertsView } from './components/WeatherAndAlertsView';

// Modals
import { PhotoDiagnosisModal } from './components/PhotoDiagnosisModal';
import { AiForecastModal } from './components/AiForecastModal';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Persistence State
  const [producers, setProducers] = useState<Producer[]>(() => StorageService.getProducers());
  const [cooperatives, setCooperatives] = useState<Cooperative[]>(() => StorageService.getCooperatives());
  const [parcels, setParcels] = useState<Parcel[]>(() => StorageService.getParcels());
  const [stocks, setStocks] = useState<WarehouseStock[]>(() => StorageService.getStocks());
  const [harvests, setHarvests] = useState<HarvestRecord[]>(() => StorageService.getHarvests());
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => StorageService.getExpenses());
  const [demands, setDemands] = useState<BuyerDemand[]>(() => StorageService.getDemands());
  const [listings, setListings] = useState<MarketplaceListing[]>(() => StorageService.getListings());
  const [orders, setOrders] = useState<Order[]>(() => StorageService.getOrders());
  const [prices, setPrices] = useState<CommodityPrice[]>(() => StorageService.getPrices());
  const [weather, setWeather] = useState<WeatherData>(() => StorageService.getWeather());
  const [alerts, setAlerts] = useState<AgrilinkAlert[]>(() => StorageService.getAlerts());
  const [smsOutbox, setSmsOutbox] = useState<SmsOutboxItem[]>(() => StorageService.getSmsOutbox());
  const [shipments, setShipments] = useState<TransportShipment[]>(() => StorageService.getShipments());

  // Offline Mode & Sync Queue
  const [isOffline, setIsOffline] = useState<boolean>(() => StorageService.isOfflineMode());
  const [offlineQueue, setOfflineQueue] = useState<OfflineSyncItem[]>(() => StorageService.getOfflineQueue());

  // Modals state
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);
  const [diagnosisParcel, setDiagnosisParcel] = useState<Parcel | null>(null);
  const [isForecastOpen, setIsForecastOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Sync state with storage service
  const handleToggleOffline = () => {
    const nextVal = !isOffline;
    setIsOffline(nextVal);
    StorageService.setOfflineMode(nextVal);
  };

  const handleSyncOffline = () => {
    const syncedCount = StorageService.syncOfflineQueue();
    setOfflineQueue([]);
    // Reload state after sync
    setHarvests(StorageService.getHarvests());
    setExpenses(StorageService.getExpenses());
    setStocks(StorageService.getStocks());
    setOrders(StorageService.getOrders());
    setSyncNotice(`Synchronisation réussie : ${syncedCount} action(s) consolidée(s) avec la base centrale.`);
    setTimeout(() => setSyncNotice(null), 5000);
  };

  // 1. Add Harvest Handler
  const handleAddHarvest = (newHarvestData: Omit<HarvestRecord, 'id' | 'batchCode'>) => {
    const batchCode = `LOT-CI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: HarvestRecord = {
      ...newHarvestData,
      id: `hrv-${Date.now()}`,
      batchCode,
    };

    if (isOffline) {
      StorageService.addToOfflineQueue({
        action: 'CREATE_HARVEST',
        type: 'HARVEST_LOG',
        payload: newRecord,
      });
      setOfflineQueue(StorageService.getOfflineQueue());
    } else {
      const updated = [newRecord, ...harvests];
      setHarvests(updated);
      StorageService.saveHarvests(updated);

      // Increment warehouse stock
      const updatedStocks = stocks.map((s) => {
        if (s.warehouseId === newRecord.warehouseId && s.crop === newRecord.crop) {
          return {
            ...s,
            quantityKg: s.quantityKg + newRecord.quantityKg,
            lastInspectionDate: new Date().toISOString().split('T')[0],
          };
        }
        return s;
      });
      setStocks(updatedStocks);
      StorageService.saveStocks(updatedStocks);
    }
  };

  // 2. Add Expense Handler
  const handleAddExpense = (newExpData: Omit<ExpenseRecord, 'id'>) => {
    const newExp: ExpenseRecord = {
      ...newExpData,
      id: `exp-${Date.now()}`,
    };

    if (isOffline) {
      StorageService.addToOfflineQueue({
        action: 'LOG_EXPENSE',
        type: 'EXPENSE_LOG',
        payload: newExp,
      });
      setOfflineQueue(StorageService.getOfflineQueue());
    } else {
      const updated = [newExp, ...expenses];
      setExpenses(updated);
      StorageService.saveExpenses(updated);
    }
  };

  // 3. Add Producer
  const handleAddProducer = (newProdData: Omit<Producer, 'id'>) => {
    const newProd: Producer = {
      ...newProdData,
      id: `prod-${Date.now()}`,
    };
    const updated = [newProd, ...producers];
    setProducers(updated);
    StorageService.saveProducers(updated);
  };

  // 3b. Add Cooperative
  const handleAddCooperative = (newCoopData: Omit<Cooperative, 'id'>) => {
    const newCoop: Cooperative = {
      ...newCoopData,
      id: `coop-${Date.now()}`,
    };
    const updated = [newCoop, ...cooperatives];
    setCooperatives(updated);
    StorageService.saveCooperatives(updated);
  };

  // 4. Add Parcel
  const handleAddParcel = (newParcelData: Omit<Parcel, 'id'>) => {
    const newParcel: Parcel = {
      ...newParcelData,
      id: `pcl-${Date.now()}`,
    };
    const updated = [newParcel, ...parcels];
    setParcels(updated);
    StorageService.saveParcels(updated);
  };

  // 5. Stock Management
  const handleUpdateStock = (updatedStock: WarehouseStock) => {
    const updated = stocks.map((s) => (s.id === updatedStock.id ? updatedStock : s));
    setStocks(updated);
    StorageService.saveStocks(updated);
  };

  const handleAddStock = (newStock: WarehouseStock) => {
    const updated = [newStock, ...stocks];
    setStocks(updated);
    StorageService.saveStocks(updated);
  };

  const handleDeleteStock = (stockId: string) => {
    const updated = stocks.filter((s) => s.id !== stockId);
    setStocks(updated);
    StorageService.saveStocks(updated);
  };

  // 6. Send SMS
  const handleSendSms = (recipientPhone: string, message: string, category: SmsOutboxItem['category']) => {
    const newSms: SmsOutboxItem = {
      id: `sms-${Date.now()}`,
      recipientPhone,
      message,
      category,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: 'Délivré sur antenne GSM relais',
    };
    const updated = [newSms, ...smsOutbox];
    setSmsOutbox(updated);
    StorageService.saveSmsOutbox(updated);

    // Also add to active alerts
    const newAlert: AgrilinkAlert = {
      id: `alt-${Date.now()}`,
      type: 'sms_sent',
      title: `SMS expédié (${category})`,
      message: `Vers ${recipientPhone} : "${message.substring(0, 45)}..."`,
      timestamp: 'À l\'instant',
      priority: 'Basse',
      read: false,
      smsDispatched: true,
    };
    const updatedAlerts = [newAlert, ...alerts];
    setAlerts(updatedAlerts);
    StorageService.saveAlerts(updatedAlerts);
  };

  // 7. Add B2B Listing
  const handleAddListing = (newListingData: Omit<MarketplaceListing, 'id'>) => {
    const newListing: MarketplaceListing = {
      ...newListingData,
      id: `list-${Date.now()}`,
    };
    const updated = [newListing, ...listings];
    setListings(updated);
    StorageService.saveListings(updated);
  };

  // 8. Initiate Order from AI Matchmaking or Marketplace
  const handleInitiateOrderFromMatch = (match: any) => {
    const quantity = Number(match.quantityKg) || 20000;
    const unitPrice = Number(match.suggestedNegotiationPriceFcfa || match.unitPriceFcfaKg || match.unitPriceFcfa) || 2150;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `CMD-CI-2026-${Math.floor(100 + Math.random() * 900)}`,
      buyerId: match.buyerId || match.buyerDemandId || 'buy-1',
      buyerName: match.buyerName || 'Barry Callebaut Côte d\'Ivoire',
      buyerContact: match.buyerContact || '+225 27 21 00 00 00',
      sellerId: match.sellerId || 'coop-1',
      sellerName: match.sellerName || 'COOPAZA Soubré',
      crop: match.crop || 'Cacao Fèves (Grade 1)',
      quantityKg: quantity,
      unitPriceFcfaKg: unitPrice,
      totalAmountFcfa: quantity * unitPrice,
      paidAmountFcfa: 0,
      paymentStatus: 'En attente acompte',
      status: 'Confirmée',
      deliveryLocation: match.deliveryLocation || 'Usine de Torréfaction, Vridi, Abidjan',
      deliveryDeadline: match.deliveryDeadline || match.deadlineDate || '30 Novembre 2026',
      createdAt: new Date().toISOString().split('T')[0],
      transactions: [],
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);
    StorageService.saveOrders(updated);
    setCurrentTab('commandes');
  };

  // 9. Update Order Status
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setOrders(updated);
    StorageService.saveOrders(updated);
  };

  // 10. Record Payment
  const handleRecordPayment = (orderId: string, paymentData: Omit<PaymentTransaction, 'id'>) => {
    const newTx: PaymentTransaction = {
      ...paymentData,
      id: `tx-${Date.now()}`,
    };

    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const nextPaid = (o.paidAmountFcfa || 0) + newTx.amountFcfa;
        const paymentStatus =
          nextPaid >= o.totalAmountFcfa
            ? ('Payé intégral' as const)
            : ('Acompte versé' as const);

        return {
          ...o,
          paidAmountFcfa: nextPaid,
          paymentStatus,
          transactions: [newTx, ...(o.transactions || [])],
        };
      }
      return o;
    });

    setOrders(updated);
    StorageService.saveOrders(updated);

    // Also send SMS confirmation
    handleSendSms(
      paymentData.recipientPhone || '+225 07 00 00 00 00',
      `AGRILINK: Reçu de paiement de ${newTx.amountFcfa.toLocaleString()} FCFA via ${newTx.method || 'Mobile Money'}. Ref: ${newTx.reference || 'REF-TX'}.`,
      'Paiement'
    );
  };

  // 11. Update Shipment Status
  const handleUpdateShipmentStatus = (shipmentId: string, status: TransportShipment['status']) => {
    const updated = shipments.map((s) => (s.id === shipmentId ? { ...s, status } : s));
    setShipments(updated);
    StorageService.saveShipments(updated);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Header & Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        offlineQueue={offlineQueue}
        onSyncOfflineQueue={handleSyncOffline}
        alerts={alerts}
        onOpenDiagnosis={() => {
          setDiagnosisParcel(null);
          setIsDiagnosisOpen(true);
        }}
      />

      {/* Sync Notification Banner */}
      {syncNotice && (
        <div className="bg-emerald-900 border-b border-emerald-600 px-4 py-2.5 text-center text-xs font-semibold text-emerald-100 flex items-center justify-center gap-2 animate-in fade-in">
          <span>✓</span>
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            producers={producers}
            cooperatives={cooperatives}
            stocks={stocks}
            harvests={harvests}
            orders={orders}
            prices={prices}
            weather={weather}
            alerts={alerts}
            onOpenDiagnosis={() => setIsDiagnosisOpen(true)}
            onOpenReportModal={() => setIsReportOpen(true)}
            onOpenForecastModal={() => setIsForecastOpen(true)}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'terrain' && (
          <FieldMobileView
            parcels={parcels}
            prices={prices}
            weather={weather}
            isOffline={isOffline}
            offlineQueue={offlineQueue}
            onToggleOffline={handleToggleOffline}
            onSyncOffline={handleSyncOffline}
            onOpenDiagnosis={() => setIsDiagnosisOpen(true)}
            onAddHarvest={handleAddHarvest}
            onAddExpense={handleAddExpense}
          />
        )}

        {currentTab === 'parcelles' && (
          <ParcelsAndCropsView
            producers={producers}
            cooperatives={cooperatives}
            parcels={parcels}
            onAddProducer={handleAddProducer}
            onAddCooperative={handleAddCooperative}
            onAddParcel={handleAddParcel}
            onOpenDiagnosisForParcel={(parcel) => {
              setDiagnosisParcel(parcel);
              setIsDiagnosisOpen(true);
            }}
          />
        )}

        {currentTab === 'stocks' && (
          <StocksView
            stocks={stocks}
            onUpdateStock={handleUpdateStock}
            onAddStock={handleAddStock}
            onDeleteStock={handleDeleteStock}
            onSendSmsAlert={(phone, msg) => handleSendSms(phone, msg, 'Stock')}
            cooperatives={cooperatives}
            parcels={parcels}
          />
        )}

        {currentTab === 'couts' && (
          <CostsAndFinanceView
            expenses={expenses}
            parcels={parcels}
            orders={orders}
            harvests={harvests}
            onAddExpense={handleAddExpense}
            onAddOrder={(newOrder) => {
              const updated = [newOrder, ...orders];
              setOrders(updated);
              StorageService.saveOrders(updated);
            }}
          />
        )}

        {currentTab === 'marketplace' && (
          <MarketplaceB2BView
            listings={listings}
            demands={demands}
            stocks={stocks}
            onAddListing={handleAddListing}
            onInitiateOrderFromMatch={handleInitiateOrderFromMatch}
          />
        )}

        {currentTab === 'commandes' && (
          <OrdersAndPaymentsView
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onRecordPayment={handleRecordPayment}
            onAddOrder={(newOrder) => {
              const updated = [newOrder, ...orders];
              setOrders(updated);
              StorageService.saveOrders(updated);
            }}
            onDeleteOrder={(orderId) => {
              const updated = orders.filter((o) => o.id !== orderId);
              setOrders(updated);
              StorageService.saveOrders(updated);
            }}
            onSendSmsAlert={(phone, msg) => handleSendSms(phone, msg, 'Paiement')}
            cooperatives={cooperatives}
          />
        )}

        {currentTab === 'transport-tracabilite' && (
          <TransportTraceabilityView
            shipments={shipments}
            parcels={parcels}
            harvests={harvests}
            onUpdateShipmentStatus={handleUpdateShipmentStatus}
          />
        )}

        {currentTab === 'meteo-sms' && (
          <WeatherAndAlertsView
            weather={weather}
            alerts={alerts}
            smsOutbox={smsOutbox}
            onSendSms={handleSendSms}
            onDismissAlert={(id) => {
              const updated = alerts.map((a) => (a.id === id ? { ...a, read: true } : a));
              setAlerts(updated);
              StorageService.saveAlerts(updated);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-900 py-6 text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-stone-200">AGRILINK</span>
            <span>— ERP & Marketplace Agricole pour Coopératives et Producteurs Africains</span>
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Mode Hors-Ligne Résilient</span>
            <span>•</span>
            <span>IA Gemini 3.8 Flash</span>
            <span>•</span>
            <span>Passerelle SMS & Mobile Money</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PhotoDiagnosisModal
        isOpen={isDiagnosisOpen}
        onClose={() => setIsDiagnosisOpen(false)}
        parcels={parcels}
        initialParcel={diagnosisParcel}
        onSmsDispatched={(recipient, message, crop) => {
          handleSendSms(recipient, message, 'Diagnostic');
        }}
      />

      <AiForecastModal
        isOpen={isForecastOpen}
        onClose={() => setIsForecastOpen(false)}
        parcels={parcels}
      />

      <ExecutiveReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        cooperative={cooperatives[0]}
        summaryStats={{
          producersCount: producers.length,
          totalStockTons: stocks.reduce((acc, s) => acc + s.quantityKg, 0) / 1000,
          ordersTurnoverFcfa: orders.reduce((acc, o) => acc + o.totalAmountFcfa, 0),
          expensesFcfa: expenses.reduce((acc, e) => acc + e.amountFcfa, 0),
        }}
      />
    </div>
  );
}
