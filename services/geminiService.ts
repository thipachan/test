
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { UserSkills, IncomePlan, InvestmentAdvice, BusinessAnalysis, Language, MarketData, MarketingPlan, StockMarketAnalysis, JobListing } from "../types";

// Initialize the Gemini API client with the environment variable API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getLanguageName = (lang: Language) => {
  if (lang === 'th') return 'Thai (ภาษาไทย)';
  if (lang === 'en') return 'English';
  return 'Lao (ພາສາລາວ)';
};

const getCachedData = <T>(key: string): T | null => {
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  try {
    const { data, expiry } = JSON.parse(cached);
    if (new Date().getTime() > expiry) {
      return null;
    }
    return data as T;
  } catch (e) {
    return null;
  }
};

const setCachedData = (key: string, data: any, ttlMinutes: number = 60) => {
  const expiry = new Date().getTime() + ttlMinutes * 60000;
  localStorage.setItem(key, JSON.stringify({ data, expiry }));
};

const retryDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const runWithRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 3000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = JSON.stringify(error).toLowerCase();
    const isQuotaError = 
      error?.status === 429 || 
      error?.code === 429 || 
      error?.error?.code === 429 ||
      errorStr.includes('429') || 
      errorStr.includes('quota') || 
      errorStr.includes('resource_exhausted') ||
      errorStr.includes('exhausted');

    if (retries > 0 && (isQuotaError || error?.status === 503)) {
      console.warn(`API Busy/Quota (429/503). Retrying in ${delay}ms... (${retries} retries left)`);
      await retryDelay(delay);
      return runWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const searchJobsByProfession = async (category: string, lang: Language): Promise<JobListing[]> => {
  const cacheKey = `live_jobs_${category}_${lang}`;
  const cached = getCachedData<JobListing[]>(cacheKey);
  if (cached) return cached;

  const prompt = `
    Search for CURRENT (2024-2025) job vacancies in Laos for the category: "${category}".
    Sources to check: 108.jobs, LinkedIn Laos, and Facebook Groups (ຊອກວຽກວຽງຈັນ).
    For each job, extract: 
    - company name (if available)
    - position/role
    - SALARY range (in LAK or USD)
    - CONTACT phone number or WhatsApp
    - specific LOCATION (district/province)
    - is it urgent? (true/false)
    - source platform (e.g., 108.jobs, Facebook)
    
    Output exactly 10 jobs in JSON format according to the schema.
  `;

  const response = await runWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            source: { type: Type.STRING },
            company: { type: Type.STRING },
            role: { type: Type.STRING },
            salary: { type: Type.STRING },
            contact: { type: Type.STRING },
            location: { type: Type.STRING },
            isUrgent: { type: Type.BOOLEAN },
            link: { type: Type.STRING }
          },
          required: ["role", "salary", "contact", "location", "source"]
        }
      }
    }
  }));

  const data = JSON.parse(response.text || '[]') as JobListing[];
  setCachedData(cacheKey, data, 60); // Cache for 1 hour
  return data;
};

export const getMarketData = async (lang: Language): Promise<MarketData> => {
  const cacheKey = `market_data_v2_${lang}`;
  const validCached = getCachedData<MarketData>(cacheKey);
  if (validCached) return validCached;

  const langName = getLanguageName(lang);
  const prompt = `
    Search for official economic data for Lao PDR (Current 2024-2025):
    1. Exchange Rates (USD, THB, CNY to LAK).
    2. Fuel Prices (Petrol Regular, Diesel) in Vientiane Capital.
    3. Economic Indicators (Gold, Inflation, Interest Rate).
    4. Sector Trends: Which sectors are growing (e.g. Tourism, Export)? Which are struggling?
    5. Business Suitability: Based on high inflation/fuel/fx, what businesses are BEST to start now, and what are RISKY?

    Output in ${langName}.
  `;

  try {
    const response = await runWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            exchangeRates: { 
              type: Type.OBJECT, 
              properties: { USD_LAK: { type: Type.STRING }, THB_LAK: { type: Type.STRING }, CNY_LAK: { type: Type.STRING } } 
            },
            fuelPrices: {
              type: Type.OBJECT,
              properties: { regular: { type: Type.STRING }, diesel: { type: Type.STRING } }
            },
            indicators: { 
              type: Type.OBJECT, 
              properties: { goldPrice: { type: Type.STRING }, inflationRate: { type: Type.STRING }, bankInterestRate: { type: Type.STRING } } 
            },
            history: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { date: { type: Type.STRING }, usd: { type: Type.NUMBER }, thb: { type: Type.NUMBER }, cny: { type: Type.NUMBER }, gold: { type: Type.NUMBER } }, 
                required: ["date", "usd", "thb", "cny", "gold"] 
              } 
            },
            sectorTrends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { name: { type: Type.STRING }, trend: { type: Type.STRING, enum: ["up", "down", "stable"] }, insight: { type: Type.STRING } }
              }
            },
            businessSuitability: {
              type: Type.OBJECT,
              properties: {
                bestFor: { type: Type.ARRAY, items: { type: Type.STRING } },
                riskyFor: { type: Type.ARRAY, items: { type: Type.STRING } },
                reasoning: { type: Type.STRING }
              }
            },
            summary: { type: Type.STRING }
          },
          required: ["exchangeRates", "fuelPrices", "indicators", "history", "sectorTrends", "businessSuitability", "summary"]
        }
      },
    }));

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Official Source",
      uri: chunk.web?.uri || ""
    })) || [];

    const text = response.text || '{}';
    const data = { ...JSON.parse(text), sources };
    setCachedData(cacheKey, data, 30);
    return data;
  } catch (err) {
    const staleCache = localStorage.getItem(cacheKey);
    if (staleCache) {
      try {
        const { data } = JSON.parse(staleCache);
        return data as MarketData;
      } catch (parseErr) {}
    }
    throw err;
  }
};

export const generatePersonalizedPlan = async (skills: UserSkills, lang: Language): Promise<IncomePlan> => {
  const cacheKey = `earn_plan_v6_${JSON.stringify(skills)}_${lang}`;
  const cached = getCachedData<IncomePlan>(cacheKey);
  if (cached) return cached;

  const langName = getLanguageName(lang);
  const prompt = `
    Provide 10 strategies for earning 200,000 LAK/day in Laos starting from ZERO capital.
    User Profile: Bike:${skills.hasBike}, Car:${skills.hasCar}, Strength:${skills.physicalStrength}, Phone:${skills.hasSmartphone}.
    
    FOR EACH STRATEGY, you MUST search and include:
    - jobListings: Search "108 Jobs Laos" and Facebook groups like "ຊອກວຽກ ວຽງຈັນ" to find 2-3 related active roles. 
    Include: source, role name, contact phone number/hotline, salary (crucial), and link if possible.
    
    Output JSON in ${langName}.
  `;

  const response = await runWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { 
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dailyTarget: { type: Type.NUMBER },
          strategies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedIncome: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                actionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                workLocation: { type: Type.STRING },
                locationDetails: { type: Type.STRING },
                realWorldLandmarks: { type: Type.ARRAY, items: { type: Type.STRING } },
                platformLinks: { 
                  type: Type.ARRAY, 
                  items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, uri: { type: Type.STRING } } } 
                },
                timeRequired: { type: Type.STRING },
                toolsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
                successMetric: { type: Type.STRING },
                proTip: { type: Type.STRING },
                masterySkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                dailySchedule: { 
                  type: Type.ARRAY, 
                  items: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, task: { type: Type.STRING } } } 
                },
                incomeCalculation: { type: Type.STRING },
                revenueBreakdown: { 
                  type: Type.ARRAY, 
                  items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, amount: { type: Type.STRING }, quantity: { type: Type.STRING } } } 
                },
                expenseBreakdown: { 
                  type: Type.ARRAY, 
                  items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, amount: { type: Type.STRING } } } 
                },
                howToVerify: { type: Type.STRING },
                jobListings: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      source: { type: Type.STRING },
                      role: { type: Type.STRING },
                      contact: { type: Type.STRING },
                      location: { type: Type.STRING },
                      salary: { type: Type.STRING },
                      link: { type: Type.STRING },
                      isUrgent: { type: Type.BOOLEAN }
                    }
                  }
                }
              },
              required: ["title", "description", "estimatedIncome", "actionSteps", "jobListings"]
            }
          },
          immediateActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          advice: { type: Type.STRING }
        },
        required: ["dailyTarget", "strategies", "immediateActions", "advice"]
      }
    }
  }));

  const data = JSON.parse(response.text || '{}') as IncomePlan;
  setCachedData(cacheKey, data, 120);
  return data;
};

export const generateInvestmentAdvice = async (capital: number, lang: Language, assets?: UserSkills): Promise<InvestmentAdvice> => {
  const cacheKey = `invest_advice_v5_${capital}_${lang}_${JSON.stringify(assets || {})}`;
  const cached = getCachedData<InvestmentAdvice>(cacheKey);
  if (cached) return cached;

  const langName = getLanguageName(lang);
  const prompt = `
    LAO INVESTMENT BLUEPRINT (2024-2025):
    Capital: ${capital} LAK.
    Provide exactly 10 high-fidelity investment business plans for the Lao market.
    FOR EACH PLAN, INCLUDE:
    - shortTermProjection: 1-6 months analysis (profit/loss).
    - longTermProjection: 1-3 years analysis (profit/loss).
    - Failure triggers and specific location advice.
    Output JSON in ${langName}.
  `;
  
  const response = await runWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      // Response schema omitted for brevity here, but should align with InvestmentAdvice interface
    }
  }));
  
  const data = JSON.parse(response.text || '{}') as InvestmentAdvice;
  setCachedData(cacheKey, data, 120);
  return data;
};

export const getStockMarketAnalysis = async (lang: Language): Promise<StockMarketAnalysis> => {
  const cacheKey = `stock_analysis_v5_${lang}`;
  const cached = getCachedData<StockMarketAnalysis>(cacheKey);
  if (cached) return cached;

  const langName = getLanguageName(lang);
  const prompt = `
    Analyze the Lao PDR Investment Landscape (Current 2024-2025). Output in ${langName} in JSON format.
  `;
  
  const response = await runWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
    }
  }));
  
  const data = JSON.parse(response.text || '{}') as StockMarketAnalysis;
  setCachedData(cacheKey, data, 60);
  return data;
};

export const generateMarketingPlan = async (idea: string, lang: Language): Promise<MarketingPlan> => {
  const prompt = `Detailed sales-focused marketing plan for: "${idea}" in Laos. Output JSON in ${getLanguageName(lang)}.`;
  const response = await runWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  }));
  
  const data = JSON.parse(response.text || '{}') as MarketingPlan;
  return data;
};

export const analyzeBusiness = async (idea: string, lang: Language): Promise<BusinessAnalysis> => {
  const prompt = `Turn-key Business System Analysis for: "${idea}" in Lao PDR. Output STRICT JSON in ${getLanguageName(lang)}.`;
  const response = await runWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  }));
  
  const data = JSON.parse(response.text || '{}') as BusinessAnalysis;
  return data;
};
