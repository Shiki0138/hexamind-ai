import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-system';
import * as Sentry from '@sentry/nextjs';
import { enforceRateLimit, buildRateHeaders } from '@/lib/rate-limit';
import { callGeminiAPI } from '@/lib/gemini-client';

// 動的ルートとして設定（ビルド時の静的解析を回避）
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 1-minute 20-requests in-memory limiter is enforced via src/lib/rate-limit

export async function POST(request: NextRequest) {
  // tryブロック外で参照される可能性のある値を初期化
  let clientId = 'anonymous';
  let modelUsed: string = 'unknown';
  let messageCount: number = 0;
  
  try {
    // セッション確認（オプション：認証が必要な場合）
    const session = await getServerSession(authOptions);
    
    // リクエストの検証
    const body = await request.json();
    const { messages, model = 'gemini-2.0-flash-exp', temperature = 0.7, max_tokens = 2000 } = body;

    // 以降のログ/エラーハンドリング用に値を保存
    modelUsed = model;
    messageCount = Array.isArray(messages) ? messages.length : 0;
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'メッセージが必要です' }, 
        { status: 400 }
      );
    }
    
    // レート制限チェック（緩和中: 1分60回）
    clientId = session?.user?.email || request.ip || 'anonymous';
    // 診断ログ（短期的に有効化）
    console.log('[ai-discussion] rate-check', {
      clientId,
      xff: request.headers.get('x-forwarded-for') || null,
      xrip: request.headers.get('x-real-ip') || null,
      cfip: request.headers.get('cf-connecting-ip') || null,
      ua: request.headers.get('user-agent') || null,
    });
    const rateViolation = await enforceRateLimit(request, { endpoint: 'ai_discussion', identifier: clientId });
    if (rateViolation) {
      return rateViolation;
    }
    
    // APIキーの確認 (モデルに応じて分岐)
    const isGeminiModel = model.includes('gemini');
    const isOpenAIModel = model.includes('gpt') || model.includes('o1');
    
    console.log('[API Route] モデル判定:', {
      requestedModel: model,
      isGeminiModel,
      isOpenAIModel,
      hasGoogleKey: !!process.env.GOOGLE_AI_API_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY
    });
    
    if (isGeminiModel && !process.env.GOOGLE_AI_API_KEY) {
      console.error('GOOGLE_AI_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Google AI APIキーが設定されていません' }, 
        { status: 500 }
      );
    }
    
    if (isOpenAIModel && !process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'OpenAI APIキーが設定されていません' }, 
        { status: 500 }
      );
    }
    
    // モデルに応じて適切なAPIを呼び出し
    let response: string = '';
    let usage: any = undefined;
    
    if (isGeminiModel) {
      console.log('Calling Gemini API with model:', model, 'messages:', messages.length);
      response = await callGeminiAPI({
        messages: messages,
        model: model,
        temperature: temperature,
        max_tokens: max_tokens
      });
      
      // Geminiは現在usage情報を返さないため、推定値を設定
      usage = {
        prompt_tokens: messages.reduce((sum, msg) => sum + (msg.content?.length || 0) / 4, 0),
        completion_tokens: response.length / 4,
        total_tokens: messages.reduce((sum, msg) => sum + (msg.content?.length || 0) / 4, 0) + response.length / 4
      };
      
    } else {
      // OpenAI API
      console.log('API Key check for OpenAI...');
      
      if (isOpenAIModel && process.env.OPENAI_API_KEY) {
        console.log('API Key length:', process.env.OPENAI_API_KEY.length);
        console.log('API Key prefix:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
        
        // OpenAI組織IDの確認
        if (process.env.OPENAI_ORGANIZATION) {
          console.log('OpenAI Organization ID:', process.env.OPENAI_ORGANIZATION);
        }
        
        // OpenAIクライアントの初期化
        const clientConfig: any = {
          apiKey: process.env.OPENAI_API_KEY,
        };
        
        if (process.env.OPENAI_ORGANIZATION) {
          clientConfig.organization = process.env.OPENAI_ORGANIZATION;
        }
        
        const openai = new OpenAI(clientConfig);
        
        console.log('Calling OpenAI API with model:', model, 'messages:', messages.length);
        const completion = await openai.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens,
        });
        
        response = completion.choices[0]?.message?.content || '';
        usage = completion.usage;
      }
    }
    
    return NextResponse.json({
      success: true,
      response,
      usage: usage,
      model: model,
      provider: isGeminiModel ? 'gemini' : 'openai'
    });
    
  } catch (error) {
    console.error('AI API Error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name,
    });
    
    // Sentryにエラーを送信
    Sentry.captureException(error, {
      tags: {
        component: 'ai-api',
        endpoint: 'discussion',
      },
      contexts: {
        request: {
          method: 'POST',
          url: '/api/ai/discussion',
          user_agent: request.headers.get('user-agent') || 'unknown',
        },
      },
      extra: {
        clientId,
        modelUsed,
        messageCount,
      },
    });
    
    // エラーの詳細をログに記録
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // API制限エラーの場合は特別な処理
    if (error instanceof Error && (error.message.includes('rate limit') || error.message.includes('exceeded your current quota'))) {
      const isGeminiError = error.message.includes('gemini') || error.message.includes('google');
      const providerName = isGeminiError ? 'Google AI' : 'OpenAI';
      const billingUrl = isGeminiError ? 'https://aistudio.google.com/app/apikey' : 'https://platform.openai.com/account/billing';
      
      return NextResponse.json(
        { 
          error: `${providerName} APIの利用制限に達しました。APIキーの請求状況を確認してください。`,
          details: `${providerName} APIのクォータまたはレート制限に達しています。${billingUrl} で請求状況とAPI使用量を確認してください。`,
          retryAfter: 3600,
        }, 
        { status: 429 }
      );
    }
    
    // APIキー関連のエラーの特別な処理
    if (errorMessage.includes('API key') || errorMessage.includes('Incorrect API key')) {
      const isGeminiError = errorMessage.includes('gemini') || errorMessage.includes('google');
      const providerName = isGeminiError ? 'Google AI' : 'OpenAI';
      
      return NextResponse.json(
        { 
          error: `${providerName} APIキーが無効です。正しいAPIキーがVercelの環境変数に設定されているか確認してください。`,
          details: errorMessage
        }, 
        { status: 500 }
      );
    }
    
    // 認証エラーの場合
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      const isGeminiError = errorMessage.includes('gemini') || errorMessage.includes('google');
      const providerName = isGeminiError ? 'Google AI' : 'OpenAI';
      
      return NextResponse.json(
        { 
          error: `${providerName} APIの認証に失敗しました。APIキーが有効か確認してください。`,
          details: errorMessage
        }, 
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'AIディスカッション中にエラーが発生しました',
        details: errorMessage // 常にエラーの詳細を返す
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const clientIdParam = searchParams.get('clientId');
  
  if (action === 'reset' && clientIdParam) {
    // レート制限をリセット機能は一時的に無効化
    // TODO: resetRateLimit関数の実装後に有効化
    return NextResponse.json({
      success: true,
      message: `Rate limit reset functionality is temporarily disabled`
    });
  }
  
  if (action === 'status') {
    // 環境変数の状態を返す（デバッグ用）
    return NextResponse.json({ 
      status: 'ok',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DISABLE_RATE_LIMIT: process.env.DISABLE_RATE_LIMIT,
        hasGoogleKey: !!process.env.GOOGLE_AI_API_KEY,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY
      },
      rateLimit: {
        isDisabled: process.env.NODE_ENV === 'development' || process.env.DISABLE_RATE_LIMIT === 'true'
      }
    });
  }
  
  return NextResponse.json(
    { error: 'GET method not allowed. Use ?action=status or ?action=reset&clientId=xxx' }, 
    { status: 405 }
  );
}
