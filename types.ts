
export type Language = 'lo' | 'th' | 'en';

export interface UserSkills {
  hasBike: boolean;
  hasCar: boolean;
  hasTuktuk: boolean;
  hasSmartphone: boolean;
  physicalStrength: boolean;
  languages: string[];
  education: string;
}

export interface IncomeStrategy {
  title: string;
  description: string;
  estimatedIncome: string;
  difficulty: string;
  actionSteps: string[];
}

export interface IncomePlan {
  dailyTarget: number;
  strategies: IncomeStrategy[];
  immediateActions: string[];
  advice: string;
}

export interface MarketingChannel {
  platform: string;
  strategy: string;
  howToFindCustomers: string;
}

export interface MarketingPlan {
  idea: string;
  targetAudience: string[];
  channels: MarketingChannel[];
  incentives: {
    title: string;
    description: string;
  }[];
  contentIdeas: string[];
  expertTip: string;
}

export interface StockInfo {
  ticker: string;
  companyName: string;
  currentPrice: string;
  riskScore: number; // 1-10
  feasibilityScore: number; // 1-10
  expectedReturn: string;
  dividendYield: string;
  pros: string[];
  cons: string[];
  analysis: string;
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
}

export interface InvestmentAdvice {
  capital: number;
  options: InvestmentOption[];
  generalAdvice: string;
  marketSentiment: string;
}

export interface MarketHistoryPoint {
  date: string;
  usd: number;
  thb: number;
  cny: number;
  gold: number;
}

export interface MarketData {
  exchangeRates: {
    USD_LAK: string;
    THB_LAK: string;
    CNY_LAK: string;
  };
  indicators: {
    goldPrice: string;
    inflationRate: string;
    bankInterestRate: string;
  };
  history: MarketHistoryPoint[];
  summary: string;
  sources: { title: string; uri: string }[];
}

export interface BusinessAnalysis {
  idea: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  estimatedStartupCost: string;
  feasibilityScore: number;
  actionSteps: string[];
}
