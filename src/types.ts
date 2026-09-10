export type Language = 'fr' | 'en';

export interface Producer {
  id: string;
  name: string;
  phone: string;
  cooperativeId: string;
  cooperativeName: string;
  country: string;
  region: string;
  village: string;
  surfaceTotalHa: number;
  activeParcelsCount: number;
  certifications: string[];
  avatarUrl?: string;
  joinedYear: number;
}

export interface Cooperative {
  id: string;
  name: string;
  code: string;
  country: string;
  region: string;
  headquarters: string;
  membersCount: number;
  totalParcelsHa: number;
  totalStockTons: number;
  contactPhone: string;
  presidentName: string;
  mobileMoneyAccounts: {
    provider: 'Wave' | 'Orange Money' | 'MTN MoMo' | 'Moov Money';
    number: string;
  }[];
}

export interface Parcel {
  id: string;
  producerId: string;
  producerName: string;
  cooperativeId: string;
  name: string;
  crop: string;
  variety: string;
  surfaceHa: number;
  soilType: 'Argileux' | 'Sableux' | 'Limoneux' | 'Volcanique' | 'Alluvionnaire';
  irrigation: 'Pluviale' | 'Goutte-à-goutte' | 'Aspersion' | 'Gravitaire';
  coordinates: {
    lat: number;
    lng: number;
  };
  plantingDate: string;
  vegetativeStage: 'Préparation du sol' | 'Semis/Plantation' | 'Croissance' | 'Floraison' | 'Fructification' | 'Maturation' | 'Récolte en cours';
  healthScore: number; // 0 - 100
  status: 'Actif' | 'En jachère' | 'En préparation';
}

export interface HarvestRecord {
  id: string;
  batchCode: string;
  parcelId: string;
  parcelName: string;
  producerName: string;
  crop: string;
  variety: string;
  date: string;
  quantityKg: number;
  qualityGrade: 'Grade 1 (Supérieur)' | 'Grade 2 (Standard)' | 'Rebut/Sous-grade';
  humidityPercent: number;
  warehouseId: string;
  warehouseName: string;
  unitCostFcfaKg: number;
}

export interface WarehouseStock {
  id: string;
  warehouseId: string;
  warehouseName: string;
  crop: string;
  variety: string;
  batchCode: string;
  quantityKg: number;
  reservedKg: number;
  alertThresholdKg: number;
  humidityPercent: number;
  unitValueFcfa: number;
  lastInspectionDate: string;
  qualityGrade: 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 1 (Supérieur)' | 'Grade 2 (Standard)';
  qrCode: string;
}

export interface CostExpense {
  id: string;
  date: string;
  parcelId: string;
  parcelName: string;
  category: 'Semences' | 'Engrais & Amendements' | 'Produits Phytosanitaires' | 'Main d\'œuvre' | 'Carburant & Mécanisation' | 'Transport' | 'Conditionnement';
  amountFcfa: number;
  description: string;
  paidVia?: 'Cash' | 'Wave' | 'Orange Money' | 'MTN MoMo' | 'Coopérative';
  paymentMethod?: 'Cash' | 'Wave' | 'Orange Money' | 'MTN MoMo' | 'Coopérative';
}

export type ExpenseRecord = CostExpense;

export interface Buyer {
  id: string;
  companyName: string;
  category: 'Grossiste International' | 'Exportateur Agréé' | 'Transformateur Agro-industriel' | 'Supermarché / Local';
  contactName: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  trustScore: number; // 1-5
  totalVolumePurchasedTons: number;
}

export interface OrderItem {
  crop: string;
  quality: string;
  quantityKg: number;
  unitPriceFcfa: number;
  parcelId?: string;
  parcelName?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerContact?: string;
  sellerId?: string;
  sellerName?: string;
  parcelId?: string;
  parcelName?: string;
  crop?: string;
  quantityKg?: number;
  unitPriceFcfaKg?: number;
  items?: OrderItem[];
  totalAmountFcfa: number;
  paidAmountFcfa?: number;
  status: 'Demande' | 'Négociation' | 'Confirmée' | 'Préparation' | 'En cours d\'acheminement' | 'En transit' | 'Livrée' | 'Soldée';
  paymentStatus: 'En attente' | 'Acompte 30% reçu' | 'Payé 100% Mobile Money' | 'Payé Virement' | 'Acompte versé' | 'Payé intégral' | 'En attente acompte';
  deliveryDate?: string;
  deliveryDeadline?: string;
  destination?: string;
  deliveryLocation?: string;
  createdDate?: string;
  createdAt?: string;
  transactions?: PaymentTransaction[];
}

export interface CommodityPrice {
  id: string;
  crop: string;
  currentPriceFcfa: number;
  currency: string;
  unit: string;
  change24h: number;
  referenceMarket: string;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  historicalPrices: { date: string; price: number }[];
}

export interface PaymentTransaction {
  id: string;
  orderId?: string;
  transactionRef?: string;
  reference?: string;
  type?: 'Paiement commande' | 'Avance récolte' | 'Acompte intrants' | 'Frais de transport';
  fromParty?: string;
  toParty?: string;
  amountFcfa: number;
  provider?: 'Wave' | 'Orange Money' | 'MTN MoMo' | 'Moov Money' | 'Virement';
  method?: 'Wave' | 'Orange Money' | 'MTN MoMo' | 'Moov Money' | 'Virement' | 'Virement bancaire';
  status: 'Effectué' | 'En attente' | 'Échoué';
  date?: string;
  timestamp?: string;
  phoneOrAccount?: string;
  recipientPhone?: string;
  smsReceiptSent?: boolean;
}

export interface TransportMission {
  id: string;
  missionCode?: string;
  batchCode?: string;
  carrierName?: string;
  driverName: string;
  driverPhone: string;
  truckPlate: string;
  origin: string;
  destination: string;
  cargoTonnage?: number;
  weightTons?: number;
  crop: string;
  costFcfa?: number;
  status: 'Planifié' | 'En transit' | 'En route' | 'Chargement' | 'Contrôle douane/péage' | 'Arrivé au port/usine' | 'Livré';
  estimatedArrival?: string;
  eta?: string;
  gpsTracking?: {
    lastCheckpoint: string;
    batteryLevel: number;
  };
}

export type TransportShipment = TransportMission;

export interface TraceabilityBatch {
  id: string;
  batchCode: string;
  crop: string;
  variety: string;
  producerName: string;
  cooperativeName: string;
  parcelName: string;
  gpsCoordinates: { lat: number; lng: number };
  harvestDate: string;
  initialWeightKg: number;
  currentWarehouse: string;
  certifications: string[];
  steps: {
    timestamp: string;
    stepName: string;
    location: string;
    operator: string;
    verified: boolean;
  }[];
}

export interface WeatherData {
  region: string;
  currentTempC: number;
  condition: 'Ensoleillé' | 'Pluies orageuses' | 'Averses éparses' | 'Nuageux' | 'Harmattan / Brume';
  humidityPercent: number;
  precipitationProb: number;
  rainfallMm24h: number;
  windSpeedKmH: number;
  agriculturalNotice: string;
  dailyForecast?: {
    day: string;
    maxTemp: number;
    minTemp: number;
    rainProb: number;
    rainfallMm: number;
    condition: string;
  }[];
  forecast7Days?: {
    day: string;
    tempMax: number;
    tempMin: number;
    rainProbability: number;
    condition: string;
  }[];
}

export interface AgrilinkAlert {
  id: string;
  title: string;
  message: string;
  type: 'stock_critique' | 'meteo_alerte' | 'ravageur_maladie' | 'paiement_momo' | 'commande_b2b' | 'sms_sent';
  priority: 'Haute' | 'Moyenne' | 'Basse';
  timestamp: string;
  read: boolean;
  smsDispatched: boolean;
  recipientPhone?: string;
}

export interface SmsLogEntry {
  id: string;
  timestamp: string;
  recipientNumber?: string;
  recipientPhone?: string;
  recipientName?: string;
  carrier?: 'Orange' | 'MTN' | 'Wave SMS' | 'Moov' | 'Airtel';
  content?: string;
  message?: string;
  status: 'Envoyé' | 'Délivré' | 'En file d\'attente' | 'Délivré sur antenne GSM relais';
  messageType?: 'Alerte Stock' | 'Notification Paiement' | 'Météo' | 'Ordre de Récolte';
  category?: 'Météo' | 'Paiement' | 'Diagnostic' | 'Prix' | 'Stock' | 'Général';
}

export type SmsOutboxItem = SmsLogEntry;

export interface B2BListing {
  id: string;
  type: 'OFFRE_VENTE' | 'DEMANDE_ACHAT';
  authorName?: string;
  authorType?: 'Coopérative' | 'Grand Producteur' | 'Industriel' | 'Négociant Export' | 'Exportateur Agréé';
  sellerId?: string;
  sellerName?: string;
  sellerType?: string;
  buyerName?: string;
  crop: string;
  variety?: string;
  quantityTons?: number;
  quantityAvailableKg?: number;
  quantityRequiredKg?: number;
  targetPriceFcfaPerKg?: number;
  unitPriceFcfaKg?: number;
  minimumOrderKg?: number;
  targetPriceFcfaKg?: number;
  qualityGrade?: string;
  location?: string;
  country?: string;
  availableDate?: string;
  deliveryLocation?: string;
  deadlineDate?: string;
  certifiedBioOrFair?: boolean;
  certifications?: string[];
  requiredCertifications?: string[];
  contactPhone?: string;
  incoterm?: 'EXW' | 'FOB' | 'DAP' | 'FCA';
  publishedDate?: string;
  status?: string;
}

export type MarketplaceListing = B2BListing;
export type BuyerDemand = B2BListing;

export interface OfflineSyncItem {
  id: string;
  action?: 'CREATE_HARVEST' | 'UPDATE_STOCK' | 'LOG_EXPENSE' | 'ADD_DIAGNOSTIC' | 'CREATE_ORDER' | 'HARVEST_LOG' | 'EXPENSE_LOG';
  type?: string;
  entity?: string;
  payload: any;
  timestamp: string;
  synced: boolean;
}

