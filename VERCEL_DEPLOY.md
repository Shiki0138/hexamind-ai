# 🚀 HexaMind AI - Vercel自動デプロイガイド

## 🎯 ワンクリックデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FShiki0138%2Fhexamind-ai&env=NEXTAUTH_SECRET,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,STRIPE_SECRET_KEY,OPENAI_API_KEY&envDescription=Required%20API%20keys%20for%20HexaMind%20AI%20to%20function&envLink=https%3A%2F%2Fgithub.com%2FShiki0138%2Fhexamind-ai%2Fblob%2Fmain%2F.env.example&project-name=hexamind-ai&repository-name=hexamind-ai)

---

## 📝 手動デプロイ手順

### 1. Vercelアカウント作成・ログイン
```
https://vercel.com にアクセス
GitHubアカウントでサインイン
```

### 2. プロジェクト作成
```
1. "New Project" をクリック
2. GitHubリポジトリから "hexamind-ai" を選択
3. "Import" をクリック
```

### 3. 環境変数設定

#### 必須環境変数
```env
# NextAuth設定
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe決済設定
STRIPE_SECRET_KEY=sk_live_or_test_your_stripe_secret
STRIPE_PUBLISHABLE_KEY=pk_live_or_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe価格ID
STRIPE_BASIC_PRICE_ID=price_your_basic_plan
STRIPE_PRO_PRICE_ID=price_your_pro_plan
STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_plan

# AI API設定
OPENAI_API_KEY=sk-your-openai-api-key
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key

# Google OAuth設定
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 機能フラグ
NEXT_PUBLIC_ENABLE_PREMIUM_MODE=true
NEXT_PUBLIC_ENABLE_USAGE_TRACKING=true
```

#### オプション環境変数
```env
# Sentryエラートラッキング
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=hexamind-ai

# 追加設定
NEXT_PUBLIC_DEBUG_MODE=false
NODE_ENV=production
```

### 4. デプロイ実行
```
"Deploy" ボタンをクリック
約2-3分でデプロイ完了
```

---

## 🌐 カスタムドメイン設定

### 推奨ドメイン
- `hexamind.ai` (推奨)
- `hexamind.com`
- `your-company.com`

### 設定手順
```
1. Vercel Dashboard → Settings → Domains
2. "Add Domain" をクリック
3. ドメイン名を入力 (例: hexamind.ai)
4. DNS設定を更新:
   - Type: A
   - Name: @
   - Value: 76.76.19.61 (Vercel IP)
   
   または
   
   - Type: CNAME
   - Name: @
   - Value: cname.vercel-dns.com
5. SSL証明書が自動発行されるまで待機 (5-10分)
```

---

## ⚡ パフォーマンス最適化

### 自動最適化機能
- ✅ 画像最適化 (WebP変換)
- ✅ フォント最適化
- ✅ JavaScript最小化
- ✅ CSS最小化
- ✅ エッジキャッシング

### 推奨設定
```javascript
// next.config.ts で追加設定
const nextConfig = {
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: true,
  }
}
```

---

## 📊 モニタリング設定

### Vercel Analytics
```
1. Vercel Dashboard → Analytics
2. "Enable Analytics" をクリック
3. プランに応じて機能が有効化
```

### カスタム監視
```env
# Vercel環境変数に追加
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

---

## 🔧 トラブルシューティング

### よくある問題

#### 1. ビルドエラー
```bash
# ローカルでビルドテスト
npm run build

# TypeScriptエラーの場合
npm run type-check
```

#### 2. 環境変数エラー
```
- Vercel Dashboard → Settings → Environment Variables
- 必要な変数がすべて設定されているか確認
- 値に不正な文字が含まれていないか確認
```

#### 3. Supabase接続エラー
```
- NEXT_PUBLIC_SUPABASE_URL が正しいか確認
- NEXT_PUBLIC_SUPABASE_ANON_KEY が有効か確認
- Supabaseプロジェクトが有効か確認
```

#### 4. Stripe Webhookエラー
```
1. Stripe Dashboard → Webhooks
2. Endpoint URL を更新: https://your-domain.com/api/stripe/webhooks
3. イベントが正しく選択されているか確認
```

---

## 🎯 デプロイ後チェックリスト

### 基本機能テスト
- [ ] ホームページが正常に表示される
- [ ] ログイン・サインアップが動作する
- [ ] AI議論機能が動作する
- [ ] 決済フローが動作する
- [ ] ダッシュボードが表示される

### パフォーマンステスト
- [ ] ページ読み込み速度 < 3秒
- [ ] Lighthouse スコア > 90
- [ ] モバイル表示が正常
- [ ] セキュリティヘッダーが適用されている

### セキュリティテスト
- [ ] HTTPS が適用されている
- [ ] 環境変数が適切に保護されている
- [ ] Rate limiting が動作している
- [ ] エラートラッキングが動作している

---

## 📈 スケーリング設定

### Function設定
```javascript
// vercel.json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### エッジ最適化
```javascript
// middleware.ts で地域最適化
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

---

## 🌟 本番運用開始

### Go Live チェックリスト
1. **ドメイン設定完了**
2. **SSL証明書発行完了**
3. **全環境変数設定完了**
4. **機能テスト完了**
5. **パフォーマンステスト完了**
6. **セキュリティテスト完了**
7. **監視設定完了**
8. **バックアップ設定完了**

### 運用監視
- Vercel Analytics でトラフィック監視
- Sentry でエラー監視
- Stripe Dashboard で決済監視
- Supabase でデータベース監視

---

## 🎊 HexaMind AI 本番運用開始！

**Six Executive Minds, One Powerful Decision**

世界中のビジネスリーダーが待つ革新的AIオーケストレーションプラットフォームが、ついに本番運用開始です！

---

**次のステップ**: マーケティング開始 → ユーザー獲得 → フィードバック収集 → 機能改善 → グローバル展開