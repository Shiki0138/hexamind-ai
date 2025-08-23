import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Puppeteerはサーバーサイドでのみ使用
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        dns: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    
    return config;
  },

  // Sentry関連設定
  experimental: {
    instrumentationHook: true,
  },

  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

// Sentry設定
const sentryWebpackPluginOptions = {
  // ソースマップを本番環境のみアップロード
  silent: process.env.NODE_ENV !== 'development',
  
  // Sentry組織・プロジェクト情報（必要に応じて設定）
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // デバッグ情報
  debug: process.env.NODE_ENV === 'development',
  
  // ソースマップの除外
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
};

export default process.env.SENTRY_DSN 
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
