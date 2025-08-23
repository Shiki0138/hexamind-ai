'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'Configuration':
        return '認証の設定に問題があります。管理者にお問い合わせください。';
      case 'AccessDenied':
        return 'アクセスが拒否されました。権限をご確認ください。';
      case 'Verification':
        return 'メール認証に失敗しました。再度お試しください。';
      case 'Default':
      default:
        return '認証エラーが発生しました。もう一度お試しください。';
    }
  };

  const getErrorDetails = (errorType: string | null) => {
    switch (errorType) {
      case 'Configuration':
        return '認証プロバイダーの設定に問題があります。';
      case 'AccessDenied':
        return 'このリソースにアクセスする権限がありません。';
      case 'Verification':
        return 'メールアドレスの認証リンクが無効または期限切れです。';
      case 'Default':
      default:
        return '予期しないエラーが発生しました。';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            認証エラー
          </h2>
          
          <p className="mt-2 text-center text-sm text-red-300">
            {getErrorMessage(error)}
          </p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong>詳細:</strong> {getErrorDetails(error)}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                エラーコード: {error}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">
              解決方法
            </h3>
            
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                ブラウザのキャッシュとCookieをクリアしてから再度お試しください
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                メール認証エラーの場合は、新しい認証メールを送信してください
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                問題が解決しない場合は、サポートにお問い合わせください
              </li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <Link 
              href="/auth/signin"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-center transition-colors"
            >
              サインインに戻る
            </Link>
            <Link 
              href="/auth/signup"
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md text-center transition-colors"
            >
              新規登録
            </Link>
          </div>
          
          <div className="text-center">
            <Link 
              href="/"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              ← ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white">読み込み中...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}