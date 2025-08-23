# 🚀 Night Shift AI - Vercel Deployment Guide

このガイドでは、Night Shift AIをVercelに安全にデプロイする方法を説明します。

## 📋 前提条件

- [Vercel](https://vercel.com) アカウント
- [GitHub](https://github.com) リポジトリ
- 必要なAPI キー（OpenAI等）

## ⚡ クイックデプロイ

### 1. GitHub連携

1. **リポジトリをフォーク**
   ```bash
   git clone https://github.com/yourusername/ai-board-meeting.git
   cd ai-board-meeting
   ```

2. **Vercelにインポート**
   - [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
   - "New Project" をクリック
   - GitHub リポジトリを選択

### 2. 環境変数の設定

Vercel Dashboardの Environment Variables で以下を設定：

#### 🔑 必須環境変数

| 変数名 | 値の例 | 説明 |
|--------|---------|------|
| `OPENAI_API_KEY` | `sk-...` | OpenAI API キー |
| `NEXTAUTH_SECRET` | `your-secret-here` | NextAuth 暗号化キー |
| `NEXTAUTH_URL` | `https://yourdomain.vercel.app` | 本番ドメイン |

#### 🗄️ データベース（オプション）

| 変数名 | 値の例 | 説明 |
|--------|---------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase 匿名キー |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase サービスキー |

#### 💳 支払い処理（オプション）

| 変数名 | 値の例 | 説明 |
|--------|---------|------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe 公開キー |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe 秘密キー |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe Webhook 秘密 |

#### 📊 監視・分析（オプション）

| 変数名 | 値の例 | 説明 |
|--------|---------|------|
| `SENTRY_DSN` | `https://...@sentry.io/...` | Sentry エラートラッキング |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | Google Analytics |
| `SENTRY_ORG` | `your-org` | Sentry 組織名 |
| `SENTRY_PROJECT` | `night-shift-ai` | Sentry プロジェクト名 |

### 3. デプロイ実行

```bash
# 自動デプロイ
git push origin main
```

または Vercel CLI を使用：

```bash
# Vercel CLI インストール
npm i -g vercel

# デプロイ
vercel --prod
```

## 🛠️ 詳細設定

### セキュリティ設定

#### CORS設定
```javascript
// next.config.ts
async headers() {
  return [
    {
      source: "/api/(.*)",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "https://yourdomain.com" },
        { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
      ],
    },
  ];
}
```

#### CSP (Content Security Policy)
```bash
# Environment Variable
CSP_HEADER="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
```

### パフォーマンス最適化

#### 1. 画像最適化
```javascript
// next.config.ts
images: {
  domains: ['yourdomain.com'],
  formats: ['image/webp', 'image/avif'],
},
```

#### 2. バンドル最適化
```javascript
// next.config.ts
experimental: {
  bundlePagesRouterDependencies: true,
  optimizePackageImports: ['@headlessui/react', 'framer-motion'],
},
```

## 🔍 トラブルシューティング

### よくある問題

#### 1. 環境変数が読み込まれない
```bash
# 解決方法：変数名を確認
echo $OPENAI_API_KEY  # 空の場合は未設定

# Vercel Dashboard で確認
# Settings > Environment Variables
```

#### 2. API レート制限エラー
```typescript
// 解決方法：レート制限の調整
const RATE_LIMIT = {
  requests: 20, // 増加
  windowMs: 60 * 60 * 1000,
};
```

#### 3. ビルドエラー
```bash
# TypeScript エラーの確認
npm run build

# 依存関係の更新
npm update
```

### デバッグ方法

#### 1. ログ確認
```bash
# Vercel CLI でログ確認
vercel logs https://your-deployment-url.vercel.app
```

#### 2. ローカル環境での検証
```bash
# 本番環境をローカルで再現
NODE_ENV=production npm run build
npm start
```

## 🌐 カスタムドメイン設定

### 1. ドメイン追加
```bash
# Vercel CLI
vercel domains add yourdomain.com

# または Vercel Dashboard
# Settings > Domains > Add Domain
```

### 2. DNS設定
```
# A Record
@ 76.76.19.61

# CNAME
www yourdomain.vercel.app
```

### 3. SSL証明書
Vercel が自動で Let's Encrypt 証明書を設定します。

## 📊 監視とメンテナンス

### 1. パフォーマンス監視
```javascript
// Vercel Analytics
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### 2. エラー監視
```javascript
// Sentry 設定確認
console.log('Sentry DSN:', process.env.SENTRY_DSN ? '✓ 設定済み' : '✗ 未設定');
```

### 3. アップデート
```bash
# 依存関係の定期更新
npm update
npm audit fix

# セキュリティ監査
npm audit
```

## 🚨 本番環境チェックリスト

### デプロイ前
- [ ] 環境変数がすべて設定されている
- [ ] API キーが本番用に更新されている
- [ ] データベースが本番環境に接続されている
- [ ] エラートラッキングが有効になっている

### デプロイ後
- [ ] 全ページが正常に表示される
- [ ] AI ディスカッション機能が動作する
- [ ] 認証システムが正常に動作する
- [ ] 支払いシステムが正常に動作する（該当する場合）
- [ ] エラーログが正しく記録される

### セキュリティチェック
- [ ] HTTPS が有効になっている
- [ ] セキュリティヘッダーが設定されている
- [ ] API エンドポイントにレート制限が適用されている
- [ ] 機密情報がログに出力されていない

## 📞 サポート

### 問題が発生した場合

1. **ログを確認**
   ```bash
   vercel logs --follow
   ```

2. **設定を再確認**
   ```bash
   vercel env ls
   ```

3. **Issue を作成**
   - GitHub リポジトリの Issues セクション
   - エラーメッセージとログを添付

### 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

---

🎉 **成功！** Night Shift AI が本番環境で稼働しています。

> **注意**: 定期的にセキュリティアップデートを確認し、依存関係を最新に保ってください。