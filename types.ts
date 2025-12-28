
export type Language = 'lo' | 'th' | 'en';

export type Tab = 'home' | 'plan' | 'invest' | 'analyze' | 'marketing' | 'stock' | 'resources' | 'tracker' | 'docs' | 'jobs';

export interface UserSkills {
  hasBike: boolean;
  hasCar: boolean;
  hasTuktuk: boolean;
  hasSmartphone: boolean;
  hasLaptop: boolean;
  hasLicense: boolean;
  physicalStrength: boolean;
  languages: string[];
  education: string;
  // Digital Skills
  whatsappSkill: boolean;
  tiktokSkill: boolean;
  bcelOneSkill: boolean;
  contentCreationSkill: boolean;
  marketplaceSkill: boolean;
  aiSkill: boolean;
  // Professional Skills
  cookingSkill: boolean;
  accountingSkill: boolean;
  salesSkill: boolean;
  deliverySkill: boolean;
}

export interface JobListing {
  source: string;
  role: string;
  contact: string;
  location: string;
  salary?: string;
  link?: string;
  isUrgent?: boolean;
  company?: string;
}

export interface IncomeStrategy {
  title: string;
  description: string;
  estimatedIncome: string;
  difficulty: string;
  actionSteps: string[];
  workLocation: string;
  locationDetails: string;
  realWorldLandmarks: string[];
  platformLinks: { title: string; uri: string }[];
  timeRequired: string;
  toolsNeeded: string[];
  successMetric: string;
  proTip: string;
  masterySkills: string[];
  dailySchedule: { time: string; task: string }[];
  incomeCalculation: string;
  revenueBreakdown: { item: string; amount: string; quantity: string }[];
  expenseBreakdown: { item: string; amount: string }[];
  howToVerify: string;
  jobListings: JobListing[];
}

export interface IncomePlan {
  dailyTarget: number;
  strategies: IncomeStrategy[];
  immediateActions: string[];
  advice: string;
}

export interface MarketingPlan {
  idea: string;
  targetAudience: string[];
  channels: { platform: string; strategy: string; howToFindCustomers: string }[];
  leadRadar: {
    locationName: string;
    platform: string;
    description: string;
    link?: string;
    actionType: string;
  }[];
  closingTactics: {
    title: string;
    technique: string;
    script: string;
  }[];
  contentChecklist: {
    item: string;
    why: string;
  }[];
  incentives: {
    title: string;
    description: string;
  }[];
  contentIdeas: string[];
  expertTip: string;
}

export interface ProjectionData {
  timeframe: string;
  expectedReturn: string;
  riskLevel: string;
  potentialLoss: string;
  successProbability: number;
}

export interface StockInfo {
  ticker: string;
  companyName: string;
  currentPrice: string;
  riskScore: number;
  feasibilityScore: number;
  expectedReturn: string;
  dividendYield: string;
  pros: string[];
  cons: string[];
  analysis: string;
  registrationNo: string;
  headquarters: string;
  headquartersUri: string;
  contactPhone: string;
  investmentEase: string;
  officialListingUrl: string;
  shortTermProjection: ProjectionData;
  longTermProjection: ProjectionData;
}

export interface LocalVenture {
  title: string;
  minCapital: string;
  profitRate: string;
  potentialLoss: string;
  description: string;
  riskLevel: string;
  duration: string;
  howToStart: string[];
  riskMitigation: string[];
  officialResources: { title: string; uri: string }[];
  physicalHub: string;
  partnershipModel: string;
  legalTips: string;
  locationUri: string;
  shortTermProjection: ProjectionData;
  longTermProjection: ProjectionData;
}

export interface StockMarketAnalysis {
  marketStatus: string;
  topStocks: StockInfo[];
  localVentures: LocalVenture[];
  investmentMethod: string[];
  generalRiskAdvice: string;
  lastUpdated: string;
}

export interface InvestmentOption {
  name: string;
  description: string;
  expectedReturn: string;
  riskLevel: string;
  steps: string[];
  pros: string[];
  cons: string[];
  localPlatforms: string[];
  timeline: string;
  financialBreakdown: {
    estDailyRevenue: string;
    estDailyCost: string;
    netDailyProfit: string;
  };
  exactLocations: string[];
  shoppingList: { item: string; source: string; estCost: string }[];
  riskMitigation: string[];
  masteryProTip: string;
  marketVerification: string;
  closingTechnique: string;
  masteryRoadmap: { phase: string; actions: string[] }[];
  scalingStrategy: string;
  competitiveMoat: string;
  breakEvenPoint: string;
  failureRisk: string;
  dailyTasks: { time: string; activity: string }[];
  redFlags: string[];
  supplierInfo: string;
  shortTermProjection: ProjectionData;
  longTermProjection: ProjectionData;
}

export interface InvestmentAdvice {
  capital: number;
  options: InvestmentOption[];
  generalAdvice: string;
  marketSentiment: string;
}

export interface MarketData {
  exchangeRates: { USD_LAK: string; THB_LAK: string; CNY_LAK: string; };
  fuelPrices: { regular: string; diesel: string; };
  indicators: { goldPrice: string; inflationRate: string; bankInterestRate: string; };
  history: any[];
  sectorTrends: any[];
  businessSuitability: { bestFor: string[]; riskyFor: string[]; reasoning: string; };
  summary: string;
  sources: { title: string; uri: string }[];
}

export interface BusinessAnalysis {
  idea: string;
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[]; };
  estimatedStartupCost: string;
  feasibilityScore: number;
  feasibilityMetrics: { category: string; score: number }[];
  locationRecommendations: { area: string; reason: string; uri?: string }[];
  actionSteps: string[];
  failureScenarios: any[];
  monthlyProjection: string;
  yearlyProjection: string;
  criticalEquipment: any[];
  staffingPlan: any;
  totalExpenseSummary: any;
  launchTimeline: any[];
  openingChecklist: any[];
  doAndDont: any;
}

export interface SavedInvestmentPlan {
  id: string;
  timestamp: number;
  capitalAmount: number;
  advice: InvestmentAdvice;
  title: string;
}
