import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-system';
import * as Sentry from '@sentry/nextjs';
import { enforceRateLimit, buildRateHeaders } from '@/lib/rate-limit';

// 動的ルートとして設定（ビルド時の静的解析を回避）
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 1-minute 20-requests in-memory limiter is enforced via src/lib/rate-limit

export async function POST(request: NextRequest) {
  // clientIdをtryブロックの外で宣言
  let clientId = 'anonymous';
  
  try {
    // セッション確認（オプション：認証が必要な場合）
    const session = await getServerSession(authOptions);
    
    // リクエストの検証
    const body = await request.json();
    const { messages, model = 'gpt-3.5-turbo', temperature = 0.7, max_tokens = 150 } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'メッセージが必要です' }, 
        { status: 400 }
      );
    }
    
    // レート制限チェック（1分20回）
    clientId = session?.user?.email || request.ip || 'anonymous';
    const rateViolation = await enforceRateLimit(request, { endpoint: 'ai_discussion', identifier: clientId });
    if (rateViolation) {
      return rateViolation;
    }
    
    // OpenAI APIキーの確認
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'OpenAI APIキーが設定されていません' }, 
        { status: 500 }
      );
    }
    
    // APIキーの形式を確認（デバッグ用）
    console.log('API Key length:', process.env.OPENAI_API_KEY.length);
    console.log('API Key prefix:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
    
    // OpenAI組織IDの確認
    if (process.env.OPENAI_ORGANIZATION) {
      console.log('OpenAI Organization ID:', process.env.OPENAI_ORGANIZATION);
    } else {
      console.log('No OpenAI Organization ID set');
    }
    
    // OpenAIクライアントの初期化（サーバーサイドのみ）
    let openai;
    try {
      const clientConfig: any = {
        apiKey: process.env.OPENAI_API_KEY,
      };
      
      // Organization IDがある場合は追加
      if (process.env.OPENAI_ORGANIZATION) {
        clientConfig.organization = process.env.OPENAI_ORGANIZATION;
      }
      
      openai = new OpenAI(clientConfig);
      
      // APIキーの有効性を確認するための簡単なテスト
      console.log('Testing OpenAI API connection...');
      
    } catch (initError) {
      console.error('OpenAI initialization error:', initError);
      return NextResponse.json(
        { error: 'OpenAIクライアントの初期化に失敗しました', details: initError instanceof Error ? initError.message : 'Unknown error' }, 
        { status: 500 }
      );
    }
    
    // APIコール
    console.log('Calling OpenAI API with model:', model, 'messages:', messages.length);
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
        modelUsed: model,
        messageCount: messages.length,
      },
    });
    
    // エラーの詳細をログに記録
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // OpenAI APIエラーの場合は特別な処理
    if (error instanceof Error && (error.message.includes('rate limit') || error.message.includes('exceeded your current quota'))) {
      return NextResponse.json(
        { 
          error: 'OpenAI APIの利用制限に達しました。APIキーの請求状況を確認してください。',
          details: 'OpenAI APIのクォータまたはレート制限に達しています。https://platform.openai.com/account/billing で請求状況とAPI使用量を確認してください。',
          retryAfter: 3600,
        }, 
        { status: 429 }
      );
    }
    
    // APIキー関連のエラーの特別な処理
    if (errorMessage.includes('API key') || errorMessage.includes('Incorrect API key')) {
      return NextResponse.json(
        { 
          error: 'OpenAI APIキーが無効です。正しいAPIキーがVercelの環境変数に設定されているか確認してください。',
          details: errorMessage
        }, 
        { status: 500 }
      );
    }
    
    // 認証エラーの場合
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return NextResponse.json(
        { 
          error: 'OpenAI APIの認証に失敗しました。APIキーが有効か確認してください。',
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
    // レート制限をリセット
    resetRateLimit(clientIdParam);
    return NextResponse.json({
      success: true,
      message: `Rate limit reset for client: ${clientIdParam}`
    });
  }
  
  if (action === 'status') {
    return NextResponse.json({ status: 'ok' });
  }
  
  return NextResponse.json(
    { error: 'GET method not allowed. Use ?action=status or ?action=reset&clientId=xxx' }, 
    { status: 405 }
  );
}
