import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-system';
import * as Sentry from '@sentry/nextjs';

// 動的ルートとして設定（ビルド時の静的解析を回避）
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// レート制限とセキュリティのための設定
const RATE_LIMIT = {
  requests: 10, // 1時間あたりの最大リクエスト数
  windowMs: 60 * 60 * 1000, // 1時間
};

// シンプルなメモリベースレート制限（本番環境ではRedis等を使用）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(clientId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT.requests) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // セッション確認（オプション：認証が必要な場合）
    const session = await getServerSession(authOptions);
    
    // リクエストの検証
    const body = await request.json();
    const { messages, model = 'gpt-4o-mini', temperature = 0.7, max_tokens = 200 } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'メッセージが必要です' }, 
        { status: 400 }
      );
    }
    
    // レート制限チェック
    const clientId = session?.user?.email || request.ip || 'anonymous';
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: '1時間あたりのリクエスト制限に達しました。しばらくお待ちください。' }, 
        { status: 429 }
      );
    }
    
    // OpenAI APIキーの確認
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI APIキーが設定されていません' }, 
        { status: 500 }
      );
    }
    
    // OpenAIクライアントの初期化（サーバーサイドのみ）
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // APIコール
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
    });
    
    const response = completion.choices[0]?.message?.content || '';
    
    return NextResponse.json({
      success: true,
      response,
      usage: completion.usage,
    });
    
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
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
        modelUsed: model,
        messageCount: messages.length,
      },
    });
    
    // エラーの詳細をログに記録
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // OpenAI APIエラーの場合は特別な処理
    if (error instanceof Error && error.message.includes('rate limit')) {
      return NextResponse.json(
        { 
          error: 'AIサービスのレート制限に達しました。しばらく時間をおいてから再度お試しください。',
          retryAfter: 60,
        }, 
        { status: 429 }
      );
    }
    
    // APIキーが設定されていない場合の特別なエラーメッセージ
    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        { 
          error: 'OpenAI APIキーが設定されていません。Vercelの環境変数にOPENAI_API_KEYを設定してください。',
          details: errorMessage
        }, 
        { status: 500 }
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

export async function GET() {
  return NextResponse.json(
    { error: 'GET method not allowed' }, 
    { status: 405 }
  );
}