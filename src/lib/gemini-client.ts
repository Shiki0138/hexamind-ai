/**
 * Google Gemini API クライアント
 * Gemini 2.0 Flash対応
 */

import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';
import { withGeminiRateLimit, geminiRateLimiter } from './gemini-rate-limiter';

// Gemini APIクライアント
let geminiClient: GoogleGenerativeAI | null = null;
let geminiModel: GenerativeModel | null = null;

/**
 * Gemini クライアントの初期化
 */
export function initializeGemini(): GoogleGenerativeAI {
  if (!geminiClient) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY is not set in environment variables');
    }
    
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  
  return geminiClient;
}

/**
 * Gemini モデルの取得
 */
export function getGeminiModel(modelName: string = 'gemini-1.5-flash'): GenerativeModel {
  const client = initializeGemini();
  
  // Available models:
  // - gemini-2.0-flash-exp (最新experimental版)
  // - gemini-1.5-flash (stable版)
  // - gemini-1.5-pro (高性能版)
  
  geminiModel = client.getGenerativeModel({ 
    model: modelName,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192, // Geminiの最大出力トークン数
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  });
  
  return geminiModel;
}

/**
 * Gemini API呼び出し（OpenAI API互換形式）
 */
export interface GeminiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GeminiChatRequest {
  messages: GeminiMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export async function callGeminiAPI(request: GeminiChatRequest): Promise<string> {
  const modelName = request.model || 'gemini-1.5-flash';
  
  // Log current usage stats
  const stats = geminiRateLimiter.getUsageStats(modelName);
  console.log('[Gemini] Current usage:', {
    model: modelName,
    minuteUsage: `${stats.minuteUsage}/${stats.limits.rpm}`,
    dailyUsage: `${stats.dailyUsage}/${stats.limits.rpd}`
  });
  
  try {
    return await withGeminiRateLimit(modelName, async () => {
      const model = getGeminiModel(modelName);
      
      // OpenAI形式のメッセージをGemini形式に変換
      const prompt = formatMessagesForGemini(request.messages);
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: request.temperature || 0.7,
          maxOutputTokens: request.max_tokens || 8192,
        }
      });
      
      const response = result.response;
      return response.text() || '';
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    // Handle specific Gemini error types
    if (error.message?.includes('429') || error.message?.includes('Resource has been exhausted')) {
      const enhancedError = new Error(
        `Gemini API rate limit exceeded. The free tier allows only 15 requests per minute. ` +
        `Please wait a moment before trying again or consider upgrading to a paid tier. ` +
        `Model: ${request.model || 'gemini-2.0-flash-exp'}`
      );
      enhancedError.name = 'GeminiRateLimitError';
      throw enhancedError;
    }
    
    if (error.message?.includes('quota')) {
      const quotaError = new Error(
        `Gemini API daily quota exceeded (1,500 requests per day on free tier). ` +
        `Please try again tomorrow or upgrade your API plan.`
      );
      quotaError.name = 'GeminiQuotaError';
      throw quotaError;
    }
    
    throw error;
  }
}

/**
 * OpenAI形式のメッセージをGemini用プロンプトに変換
 */
function formatMessagesForGemini(messages: GeminiMessage[]): string {
  let prompt = '';
  let systemContext = '';
  
  // システムメッセージを最初にまとめる
  const systemMessages = messages.filter(m => m.role === 'system');
  if (systemMessages.length > 0) {
    systemContext = systemMessages.map(m => m.content).join('\n\n');
    prompt += `【システム設定】\n${systemContext}\n\n`;
  }
  
  // 会話履歴を構築
  const conversationMessages = messages.filter(m => m.role !== 'system');
  if (conversationMessages.length > 0) {
    prompt += '【会話履歴】\n';
    conversationMessages.forEach((message, index) => {
      const roleLabel = message.role === 'user' ? 'ユーザー' : 'アシスタント';
      prompt += `${roleLabel}: ${message.content}\n\n`;
    });
  }
  
  // 最新の指示が明確になるよう調整
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage.role === 'user') {
    prompt += `【現在の指示】\n${lastMessage.content}\n\n`;
    prompt += '上記の指示に従って、あなたの専門分野から詳細で具体的な回答を提供してください。';
  }
  
  return prompt;
}

/**
 * 利用可能なGeminiモデル一覧
 */
export const GEMINI_MODELS = {
  'gemini-2.0-flash-exp': {
    displayName: 'Gemini 2.0 Flash (Experimental)',
    description: '最新実験版。最高の性能と速度',
    contextLength: 1000000,
    maxOutput: 8192
  },
  'gemini-1.5-flash': {
    displayName: 'Gemini 1.5 Flash',
    description: '安定版。高速で信頼性が高い',
    contextLength: 1000000,
    maxOutput: 8192
  },
  'gemini-1.5-pro': {
    displayName: 'Gemini 1.5 Pro',
    description: '高性能版。複雑なタスクに最適',
    contextLength: 2000000,
    maxOutput: 8192
  }
};

/**
 * Gemini APIの健全性チェック
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const response = await callGeminiAPI({
      messages: [
        { role: 'user', content: 'こんにちは。簡単なテストです。「OK」と返答してください。' }
      ]
    });
    
    console.log('Gemini API Test Response:', response);
    return response.toLowerCase().includes('ok') || response.includes('OK');
  } catch (error) {
    console.error('Gemini API Test Failed:', error);
    return false;
  }
}