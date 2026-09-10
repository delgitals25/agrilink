import {
  Producer,
  Cooperative,
  Parcel,
  HarvestRecord,
  WarehouseStock,
  CostExpense,
  Buyer,
  Order,
  CommodityPrice,
  PaymentTransaction,
  TransportMission,
  TraceabilityBatch,
  WeatherData,
  AgrilinkAlert,
  SmsLogEntry,
  B2BListing,
  OfflineSyncItem,
} from '../types';
import {
  INITIAL_PRODUCERS,
  INITIAL_COOPERATIVES,
  INITIAL_PARCELS,
  INITIAL_HARVESTS,
  INITIAL_STOCKS,
  INITIAL_COSTS,
  INITIAL_BUYERS,
  INITIAL_ORDERS,
  INITIAL_COMMODITY_PRICES,
  INITIAL_PAYMENTS,
  INITIAL_TRANSPORTS,
  INITIAL_BATCHES,
  INITIAL_WEATHER,
  INITIAL_ALERTS,
  INITIAL_SMS_LOGS,
  INITIAL_B2B_LISTINGS,
} from '../data/mockData';

const STORAGE_KEYS = {
  PRODUCERS: 'agrilink_producers_v1',
  COOPERATIVES: 'agrilink_cooperatives_v1',
  PARCELS: 'agrilink_parcels_v1',
  HARVESTS: 'agrilink_harvests_v1',
  STOCKS: 'agrilink_stocks_v1',
  COSTS: 'agrilink_costs_v1',
  BUYERS: 'agrilink_buyers_v1',
  ORDERS: 'agrilink_orders_v1',
  PRICES: 'agrilink_prices_v1',
  PAYMENTS: 'agrilink_payments_v1',
  TRANSPORTS: 'agrilink_transports_v1',
  BATCHES: 'agrilink_batches_v1',
  WEATHER: 'agrilink_weather_v1',
  ALERTS: 'agrilink_alerts_v1',
  SMS_LOGS: 'agrilink_sms_logs_v1',
  B2B: 'agrilink_b2b_v1',
  OFFLINE_QUEUE: 'agrilink_offline_queue_v1',
  FORCE_OFFLINE_MODE: 'agrilink_force_offline_mode_v1',
};

function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

export const StorageService = {
  getProducers: (): Producer[] => getLocal(STORAGE_KEYS.PRODUCERS, INITIAL_PRODUCERS),
  saveProducers: (prods: Producer[]) => setLocal(STORAGE_KEYS.PRODUCERS, prods),

  getCooperatives: (): Cooperative[] => getLocal(STORAGE_KEYS.COOPERATIVES, INITIAL_COOPERATIVES),
  saveCooperatives: (coops: Cooperative[]) => setLocal(STORAGE_KEYS.COOPERATIVES, coops),

  getParcels: (): Parcel[] => getLocal(STORAGE_KEYS.PARCELS, INITIAL_PARCELS),
  saveParcels: (parcels: Parcel[]) => setLocal(STORAGE_KEYS.PARCELS, parcels),

  getHarvests: (): HarvestRecord[] => getLocal(STORAGE_KEYS.HARVESTS, INITIAL_HARVESTS),
  saveHarvests: (harvests: HarvestRecord[]) => setLocal(STORAGE_KEYS.HARVESTS, harvests),

  getStocks: (): WarehouseStock[] => getLocal(STORAGE_KEYS.STOCKS, INITIAL_STOCKS),
  saveStocks: (stocks: WarehouseStock[]) => setLocal(STORAGE_KEYS.STOCKS, stocks),

  getCosts: (): CostExpense[] => getLocal(STORAGE_KEYS.COSTS, INITIAL_COSTS),
  saveCosts: (costs: CostExpense[]) => setLocal(STORAGE_KEYS.COSTS, costs),
  getExpenses: (): CostExpense[] => StorageService.getCosts(),
  saveExpenses: (costs: CostExpense[]) => StorageService.saveCosts(costs),

  getBuyers: (): Buyer[] => getLocal(STORAGE_KEYS.BUYERS, INITIAL_BUYERS),
  saveBuyers: (buyers: Buyer[]) => setLocal(STORAGE_KEYS.BUYERS, buyers),

  getOrders: (): Order[] => getLocal(STORAGE_KEYS.ORDERS, INITIAL_ORDERS),
  saveOrders: (orders: Order[]) => setLocal(STORAGE_KEYS.ORDERS, orders),

  getPrices: (): CommodityPrice[] => getLocal(STORAGE_KEYS.PRICES, INITIAL_COMMODITY_PRICES),
  savePrices: (prices: CommodityPrice[]) => setLocal(STORAGE_KEYS.PRICES, prices),

  getPayments: (): PaymentTransaction[] => getLocal(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS),
  savePayments: (payments: PaymentTransaction[]) => setLocal(STORAGE_KEYS.PAYMENTS, payments),

  getTransports: (): TransportMission[] => getLocal(STORAGE_KEYS.TRANSPORTS, INITIAL_TRANSPORTS),
  saveTransports: (transports: TransportMission[]) => setLocal(STORAGE_KEYS.TRANSPORTS, transports),
  getShipments: (): TransportMission[] => StorageService.getTransports(),
  saveShipments: (transports: TransportMission[]) => StorageService.saveTransports(transports),

  getBatches: (): TraceabilityBatch[] => getLocal(STORAGE_KEYS.BATCHES, INITIAL_BATCHES),
  saveBatches: (batches: TraceabilityBatch[]) => setLocal(STORAGE_KEYS.BATCHES, batches),

  getWeather: (): WeatherData => getLocal(STORAGE_KEYS.WEATHER, INITIAL_WEATHER),
  saveWeather: (weather: WeatherData) => setLocal(STORAGE_KEYS.WEATHER, weather),

  getAlerts: (): AgrilinkAlert[] => getLocal(STORAGE_KEYS.ALERTS, INITIAL_ALERTS),
  saveAlerts: (alerts: AgrilinkAlert[]) => setLocal(STORAGE_KEYS.ALERTS, alerts),

  getSmsLogs: (): SmsLogEntry[] => getLocal(STORAGE_KEYS.SMS_LOGS, INITIAL_SMS_LOGS),
  saveSmsLogs: (logs: SmsLogEntry[]) => setLocal(STORAGE_KEYS.SMS_LOGS, logs),
  getSmsOutbox: (): SmsLogEntry[] => StorageService.getSmsLogs(),
  saveSmsOutbox: (logs: SmsLogEntry[]) => StorageService.saveSmsLogs(logs),

  getB2BListings: (): B2BListing[] => getLocal(STORAGE_KEYS.B2B, INITIAL_B2B_LISTINGS),
  saveB2BListings: (listings: B2BListing[]) => setLocal(STORAGE_KEYS.B2B, listings),
  getListings: (): B2BListing[] => StorageService.getB2BListings().filter(l => l.type === 'OFFRE_VENTE'),
  getDemands: (): B2BListing[] => StorageService.getB2BListings().filter(l => l.type === 'DEMANDE_ACHAT'),
  saveListings: (listings: B2BListing[]) => StorageService.saveB2BListings(listings),

  // Offline Queue
  getOfflineQueue: (): OfflineSyncItem[] => getLocal(STORAGE_KEYS.OFFLINE_QUEUE, []),
  saveOfflineQueue: (queue: OfflineSyncItem[]) => setLocal(STORAGE_KEYS.OFFLINE_QUEUE, queue),

  addToOfflineQueue: (item: Omit<OfflineSyncItem, 'id' | 'timestamp' | 'synced'>): OfflineSyncItem => {
    const queue = StorageService.getOfflineQueue();
    const newItem: OfflineSyncItem = {
      ...item,
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      synced: false,
    };
    queue.push(newItem);
    StorageService.saveOfflineQueue(queue);
    return newItem;
  },

  syncOfflineQueue: (): number => {
    const queue = StorageService.getOfflineQueue();
    if (queue.length === 0) return 0;

    const harvests = StorageService.getHarvests();
    const costs = StorageService.getCosts();
    const stocks = StorageService.getStocks();

    let count = 0;
    queue.forEach((item) => {
      if (item.action === 'CREATE_HARVEST' || item.type === 'HARVEST_LOG') {
        harvests.unshift(item.payload);
        // update stock
        const st = stocks.find(s => s.warehouseId === item.payload.warehouseId && s.crop === item.payload.crop);
        if (st) {
          st.quantityKg += item.payload.quantityKg;
        }
        count++;
      } else if (item.action === 'LOG_EXPENSE' || item.type === 'EXPENSE_LOG') {
        costs.unshift(item.payload);
        count++;
      }
    });

    StorageService.saveHarvests(harvests);
    StorageService.saveCosts(costs);
    StorageService.saveStocks(stocks);
    StorageService.saveOfflineQueue([]);
    return count;
  },

  clearOfflineQueue: () => {
    StorageService.saveOfflineQueue([]);
  },

  // Manual Offline Toggle
  isForceOffline: (): boolean => getLocal(STORAGE_KEYS.FORCE_OFFLINE_MODE, false),
  setForceOffline: (val: boolean) => setLocal(STORAGE_KEYS.FORCE_OFFLINE_MODE, val),
  isOfflineMode: (): boolean => StorageService.isForceOffline(),
  setOfflineMode: (val: boolean) => StorageService.setForceOffline(val),

  // Reset demo data
  resetAllData: () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCERS);
    localStorage.removeItem(STORAGE_KEYS.COOPERATIVES);
    localStorage.removeItem(STORAGE_KEYS.PARCELS);
    localStorage.removeItem(STORAGE_KEYS.HARVESTS);
    localStorage.removeItem(STORAGE_KEYS.STOCKS);
    localStorage.removeItem(STORAGE_KEYS.COSTS);
    localStorage.removeItem(STORAGE_KEYS.BUYERS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.PRICES);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSPORTS);
    localStorage.removeItem(STORAGE_KEYS.BATCHES);
    localStorage.removeItem(STORAGE_KEYS.WEATHER);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.SMS_LOGS);
    localStorage.removeItem(STORAGE_KEYS.B2B);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    localStorage.removeItem(STORAGE_KEYS.FORCE_OFFLINE_MODE);
  },
};

// Formatter Helpers
export function formatFcfa(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

export function formatNumber(amount: number, digits: number = 1): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: digits,
  }).format(amount);
}
