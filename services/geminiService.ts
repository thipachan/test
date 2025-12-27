
import { GoogleGenAI, Type } from "@google/genai";
import { UserSkills, IncomePlan, InvestmentAdvice, BusinessAnalysis, Language, MarketData, MarketingPlan, StockMarketAnalysis } from "../types";

// Initialize the Gemini API client with the environment variable API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getLanguageName = (lang: Language) => {
  if (lang === 'th') return 'Thai (ภาษาไทย)';
  if (lang === 'en') return 'English';
  return 'Lao (ພາສາລາວ)';
};

export const getMarketData = async (lang: Language): Promise<MarketData> => {
  const langName = getLanguageName(lang);
  const prompt = `
    Search for and provide current official financial market data from Lao PDR (2024-2025):
    1. Current Exchange Rates: USD to LAK, THB to LAK, CNY to LAK. Prioritize rates from the Bank of the Lao PDR (BOL) or BCEL.
    2. Key Economic Indicators: Gold price (LAK per Baht/Salueng), current Inflation rate in Laos, and average commercial bank savings interest rates.
    3. A 7-day historical trend for USD/LAK, THB/LAK, CNY/LAK and Gold prices based on recent Lao market movements.
    4. A 2-sentence market summary focused on the Lao economic climate.
    
    IMPORTANT: Prioritize information from official Lao domains (.gov.la, .com.la) and reputable local banks. 
    ALL descriptive text in the JSON MUST be written in ${langName}.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          exchangeRates: {
            type: Type.OBJECT,
            properties: {
              USD_LAK: { type: Type.STRING },
              THB_LAK: { type: Type.STRING },
              CNY_LAK: { type: Type.STRING }
            }
          },
          indicators: {
            type: Type.OBJECT,
            properties: {
              goldPrice: { type: Type.STRING },
              inflationRate: { type: Type.STRING },
              bankInterestRate: { type: Type.STRING }
            }
          },
          history: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING, description: "YYYY-MM-DD" },
                usd: { type: Type.NUMBER, description: "USD to LAK numeric value" },
                thb: { type: Type.NUMBER, description: "THB to LAK numeric value" },
                cny: { type: Type.NUMBER, description: "CNY to LAK numeric value" },
                gold: { type: Type.NUMBER, description: "Gold price numeric value (LAK per Baht)" }
              },
              required: ["date", "usd", "thb", "cny", "gold"]
            }
          },
          summary: { type: Type.STRING }
        },
        required: ["exchangeRates", "indicators", "history", "summary"]
      },
      systemInstruction: `You are a financial market analyst specializing in the Lao PDR market. Use Google Search to find data from official Lao sources like bol.gov.la, bcel.com.la, and Lao News Agency. Ensure all output strings are localized to ${langName}.`
    },
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || "Official Source",
    uri: chunk.web?.uri || ""
  })) || [];

  const text = response.text || '{}';
  const data = JSON.parse(text);
  return { ...data, sources };
};

export const getStockMarketAnalysis = async (lang: Language): Promise<StockMarketAnalysis> => {
  const langName = getLanguageName(lang);
  const prompt = `
    Search for and analyze the current status of the Lao Securities Exchange (LSX) AND common local business ventures for 2024-2025:
    1. LSX Stocks: Top listed companies (EDL-Gen, BCEL, LWPC, PTL, SVB).
    2. Local Ventures: Realistic investment ventures for individual Lao citizens. Include options starting from 0 LAK (like sweat equity/referral agents) up to high-capital ventures.
    3. For each Local Venture, specifically explain:
       - Profit Rate (estimated % or amount).
       - Potential Loss / Risks (what could go wrong).
       - How to Start (practical steps).
    4. General risk advice for individual investors in the current Lao economy.

    IMPORTANT: Use Google Search for the most recent stock prices and dividend announcements. 
    ALL descriptive text in the JSON MUST be written in ${langName}.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          marketStatus: { type: Type.STRING },
          topStocks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                ticker: { type: Type.STRING },
                companyName: { type: Type.STRING },
                currentPrice: { type: Type.STRING },
                riskScore: { type: Type.NUMBER },
                feasibilityScore: { type: Type.NUMBER },
                expectedReturn: { type: Type.STRING },
                dividendYield: { type: Type.STRING },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                analysis: { type: Type.STRING }
              },
              required: ["ticker", "companyName", "currentPrice", "riskScore", "feasibilityScore", "expectedReturn", "dividendYield", "pros", "cons", "analysis"]
            }
          },
          localVentures: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                minCapital: { type: Type.STRING },
                profitRate: { type: Type.STRING },
                potentialLoss: { type: Type.STRING },
                description: { type: Type.STRING },
                riskLevel: { type: Type.STRING },
                duration: { type: Type.STRING },
                howToStart: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "minCapital", "profitRate", "potentialLoss", "description", "riskLevel", "duration", "howToStart"]
            }
          },
          investmentMethod: { type: Type.ARRAY, items: { type: Type.STRING } },
          generalRiskAdvice: { type: Type.STRING },
          lastUpdated: { type: Type.STRING }
        },
        required: ["marketStatus", "topStocks", "localVentures", "investmentMethod", "generalRiskAdvice", "lastUpdated"]
      },
      systemInstruction: `You are a professional financial advisor at the Lao Securities Exchange (LSX). Your advice is based on factual data and current market trends in Laos. You MUST respond exclusively in ${langName}.`
    }
  });

  const text = response.text || '{}';
  return JSON.parse(text) as StockMarketAnalysis;
};

export const generatePersonalizedPlan = async (skills: UserSkills, lang: Language): Promise<IncomePlan> => {
  const langName = getLanguageName(lang);
  const prompt = `
    User Situation in Laos:
    - Target: Earn 200,000 LAK per day.
    - Starting Capital: 0 LAK.
    - Assets/Skills: Bike: ${skills.hasBike}, Car: ${skills.hasCar}, Tuktuk: ${skills.hasTuktuk}, Smartphone: ${skills.hasSmartphone}, Strong: ${skills.physicalStrength}, Languages: ${skills.languages.join(', ')}, Education: ${skills.education}

    TASK:
    1. Provide a realistic daily plan in Laos to reach 200k LAK.
    2. For EACH strategy, provide actionSteps.
    3. Provide immediateActions.

    IMPORTANT: ALL text fields in the JSON response MUST be written in ${langName}.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
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
                actionSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "description", "estimatedIncome", "difficulty", "actionSteps"]
            }
          },
          immediateActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          advice: { type: Type.STRING }
        },
        required: ["dailyTarget", "strategies", "immediateActions", "advice"]
      },
      systemInstruction: `You are an expert economic consultant specialized in the Lao PDR market. You MUST respond exclusively in ${langName}.`
    },
  });

  const text = response.text || '{}';
  return JSON.parse(text) as IncomePlan;
};

export const generateInvestmentAdvice = async (capital: number, lang: Language, assets?: UserSkills): Promise<InvestmentAdvice> => {
  const langName = getLanguageName(lang);
  const assetsStr = assets ? `User has: Bike: ${assets.hasBike}, Car: ${assets.hasCar}, Tuktuk: ${assets.hasTuktuk}` : "No specific vehicle assets";
  
  const prompt = `
    I have ${capital} LAK. ${assetsStr}. 
    Give me 3 micro-business options for the Lao market that are HIGHLY REALISTIC and ACTIONABLE.
    For each option, provide a "financialBreakdown" including:
    - Daily Revenue (Gross)
    - Daily Operating Costs (Fuel, ingredients, etc.)
    - Net Daily Profit (The "Real Result")
    
    Include a short marketSentiment summary for 2024.
    IMPORTANT: EVERY SINGLE STRING field MUST be written in ${langName}.
  `;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          capital: { type: Type.NUMBER },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                expectedReturn: { type: Type.STRING },
                riskLevel: { type: Type.STRING },
                steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                localPlatforms: { type: Type.ARRAY, items: { type: Type.STRING } },
                timeline: { type: Type.STRING },
                financialBreakdown: {
                  type: Type.OBJECT,
                  properties: {
                    estDailyRevenue: { type: Type.STRING },
                    estDailyCost: { type: Type.STRING },
                    netDailyProfit: { type: Type.STRING }
                  }
                }
              },
              required: ["name", "description", "expectedReturn", "riskLevel", "steps", "pros", "cons", "localPlatforms", "timeline", "financialBreakdown"]
            }
          },
          generalAdvice: { type: Type.STRING },
          marketSentiment: { type: Type.STRING }
        },
        required: ["capital", "options", "generalAdvice", "marketSentiment"]
      },
      systemInstruction: `You are a professional Lao investment advisor. Your goal is to provide realistic, data-driven advice that leads to "Real Results". You MUST respond exclusively in ${langName}.`
    }
  });
  
  const text = response.text || '{}';
  return JSON.parse(text) as InvestmentAdvice;
};

export const generateMarketingPlan = async (idea: string, lang: Language): Promise<MarketingPlan> => {
  const langName = getLanguageName(lang);
  const prompt = `
    Create a highly practical Marketing Plan and Strategy for this business idea in Laos: "${idea}".
    The plan must reflect the CURRENT business environment in Lao PDR (2024-2025).
    Focus on:
    1. Realistic Target Audience (e.g., Gen Z, office workers in Vientiane, rural farmers).
    2. How to find customers (e.g., specific Facebook groups, TikTok trends, Loca app integrations).
    3. Incentives and Promotions that Lao people love (e.g., specific gift-giving, BCEL One discounts).
    4. Social media content ideas (TikTok/FB).

    IMPORTANT: ALL text fields in the JSON response MUST be written in ${langName}.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          idea: { type: Type.STRING },
          targetAudience: { type: Type.ARRAY, items: { type: Type.STRING } },
          channels: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                platform: { type: Type.STRING },
                strategy: { type: Type.STRING },
                howToFindCustomers: { type: Type.STRING }
              },
              required: ["platform", "strategy", "howToFindCustomers"]
            }
          },
          incentives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title", "description"]
            }
          },
          contentIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
          expertTip: { type: Type.STRING }
        },
        required: ["idea", "targetAudience", "channels", "incentives", "contentIdeas", "expertTip"]
      },
      systemInstruction: `You are a Lao digital marketing expert. Your advice must be practical, specific to Laos, and designed to generate immediate sales. You MUST respond exclusively in ${langName}.`
    }
  });

  const text = response.text || '{}';
  return JSON.parse(text) as MarketingPlan;
};

export const analyzeBusiness = async (idea: string, lang: Language): Promise<BusinessAnalysis> => {
  const langName = getLanguageName(lang);
  const prompt = `Analyze this business idea in Laos: "${idea}". Provide a highly realistic breakdown of what it takes to actually succeed.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          idea: { type: Type.STRING },
          swot: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              threats: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          estimatedStartupCost: { type: Type.STRING },
          feasibilityScore: { type: Type.NUMBER },
          actionSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["idea", "swot", "estimatedStartupCost", "feasibilityScore", "actionSteps"]
      },
      systemInstruction: `You are a business consultant for the Lao market. You MUST respond exclusively in ${langName}. Focus on practical, real-world execution.`
    }
  });
  
  const text = response.text || '{}';
  return JSON.parse(text) as BusinessAnalysis;
};
