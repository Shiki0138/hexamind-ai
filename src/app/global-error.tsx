'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentryにエラーを報告
    Sentry.captureException(error, {
      tags: {
        component: 'global-error',
        digest: error.digest,
      },
      level: 'error',
    });
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                予期しないエラーが発生しました
              </h1>
              <p className="text-gray-400">
                システムに問題が発生しました。お不便をおかけして申し訳ありません。
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-2">
                エラー情報
              </h3>
              <div className="text-left text-sm">
                {process.env.NODE_ENV === 'development' ? (
                  <pre className="text-red-400 bg-gray-900 p-3 rounded overflow-auto">
                    {error.message}
                    {error.stack && (
                      <div className="mt-2 text-gray-500">
                        {error.stack}
                      </div>
                    )}
                  </pre>
                ) : (
                  <div className="text-gray-400">
                    <p>エラーID: {error.digest || 'N/A'}</p>
                    <p className="mt-1 text-sm">
                      詳細なエラー情報は開発チームに自動的に送信されました。
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={reset}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                再試行
              </Button>
              
              <a
                href="/"
                className="block w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                ホームに戻る
              </a>
              
              <div className="text-sm text-gray-500">
                <p>問題が続く場合は、以下をお試しください：</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-left">
                  <li>ブラウザをリフレッシュする</li>
                  <li>キャッシュを削除する</li>
                  <li>しばらく時間をおいてから再度アクセスする</li>
                </ul>
              </div>
              
              {process.env.NEXT_PUBLIC_SUPPORT_EMAIL && (
                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400">
                    問題が解決しない場合は、サポートチームまでご連絡ください：
                  </p>
                  <a
                    href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}