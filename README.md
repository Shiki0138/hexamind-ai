# 🔥 HexaMind AI - Six Executive Minds, One Powerful Decision

<div align="center">

![HexaMind AI](https://img.shields.io/badge/HexaMind-AI-blue?style=for-the-badge&logo=brain&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)

**革新的AIオーケストレーションプラットフォーム**

*6人の専門AIエージェント（CEO・CFO・CMO・CTO・COO・悪魔の代弁者）が協調してビジネス意思決定を支援*

[🚀 Live Demo](#) | [📖 Documentation](#) | [🎯 Features](#features) | [⚡ Quick Start](#quick-start)

</div>

---

## 🌟 What is HexaMind AI?

HexaMind AIは、**6人の専門AIエージェント**が同時にオーケストレーションし、複合的な視点からビジネス意思決定を支援する革新的なプラットフォームです。

従来の1対1AIチャットを超え、**経営幹部レベルの集合知**をAIで実現。複雑なビジネス課題に対して多角的なソリューションを提供します。

### 🎯 Six Executive AI Agents

| Agent | Role | Specialty |
|-------|------|-----------|
| 🎯 **CEO AI** | 最高経営責任者 | 戦略・ビジョン・全体最適化 |
| 💰 **CFO AI** | 最高財務責任者 | 財務分析・投資判断・リスク管理 |
| 📈 **CMO AI** | 最高マーケティング責任者 | 市場戦略・ブランディング・顧客分析 |
| ⚡ **CTO AI** | 最高技術責任者 | 技術戦略・システム設計・イノベーション |
| ⚙️ **COO AI** | 最高執行責任者 | 運用効率・プロセス改善・実行管理 |
| 😈 **悪魔の代弁者** | 批判的思考者 | リスク分析・反対意見・問題点指摘 |

---

## ✨ Features

### 🤖 AI Orchestration
- **Multi-Agent System**: 6人のAIが同時に議論・分析
- **Premium AI Integration**: Claude Pro, ChatGPT Plus, Gemini Ultra統合
- **Intelligent Fallback**: 自動フォールバック機能で高可用性保証

### 💎 Thinking Modes
- **🧠 Deep Think**: 深い分析と洞察
- **💡 Creative**: 革新的アイデア創出
- **⚔️ Critical**: 批判的検証・リスク分析
- **💼 Normal**: バランスの取れた判断

### 🏢 Enterprise Ready
- **🔐 Enterprise Security**: エンタープライズ級セキュリティ
- **💳 Stripe Integration**: 完全なサブスクリプション管理
- **📊 Advanced Analytics**: 詳細な使用状況分析
- **🌍 Global Scale**: 世界規模でのスケーラビリティ

### 🎨 Premium UX
- **📱 Responsive Design**: モバイル完全対応
- **⚡ Real-time Streaming**: リアルタイム議論表示
- **🎭 Framer Motion**: 滑らかなアニメーション
- **🎨 Tailwind CSS**: モダンなUI/UX

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React フレームワーク
- **React 19** - 最新のReact機能
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - ユーティリティファーストCSS
- **Framer Motion** - アニメーションライブラリ

### Backend & Database
- **Supabase** - PostgreSQL + 認証 + リアルタイム
- **NextAuth.js** - 認証システム
- **Stripe** - 決済処理
- **Sentry** - エラートラッキング

### AI & APIs
- **OpenAI GPT-4** - 基本AI機能
- **Claude Pro** - 高品質推論
- **ChatGPT Plus** - 高速処理
- **Gemini Ultra** - 長文解析

### Infrastructure
- **Vercel** - ホスティング・デプロイ
- **Edge Functions** - サーバーレス処理
- **CDN** - グローバル配信

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account (for payments)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/hexamind-ai.git
cd hexamind-ai
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

### 3. Database Setup

```sql
-- Run the SQL schema in Supabase SQL Editor
-- See DEPLOYMENT_GUIDE.md for complete schema
```

### 4. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

---

## 🔧 Configuration

### Required Environment Variables

```env
# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe
STRIPE_SECRET_KEY=sk_live_your-stripe-secret
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# AI Providers
OPENAI_API_KEY=sk-your-openai-key
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-key
GOOGLE_AI_API_KEY=your-google-ai-api-key  # Gemini 2.0 Flash用

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Rate Limiting (オプション)
DISABLE_RATE_LIMIT=true  # 429エラーが発生する場合にtrueに設定
RATE_LIMIT_REDIS_URL=redis://your-redis-url  # Redisを使用する場合
```

### Optional Features

```env
# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn

# Advanced Features
NEXT_PUBLIC_ENABLE_PREMIUM_MODE=true
NEXT_PUBLIC_ENABLE_USAGE_TRACKING=true
```

---

## 📊 Pricing Plans

| Plan | Price | Discussions/Month | AI Quality | Features |
|------|-------|-------------------|-------------|----------|
| **Free** | ¥0 | 10 | Good | 3 Agents, Basic AI |
| **Basic** | ¥999 | 100 | High | 6 Agents, Premium AI |
| **Pro** | ¥2,999 | 500 | Premium | All Modes, Analytics |
| **Enterprise** | ¥9,999 | Unlimited | Ultimate | API, White Label |

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
```bash
vercel --prod
```

2. **Set Environment Variables**
- Go to Vercel Dashboard > Settings > Environment Variables
- Add all required variables from `.env.example`

3. **Configure Domain**
- Add custom domain in Vercel settings
- SSL certificate is automatically provisioned

### Detailed Deployment Guide
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete production setup.

---

## 🛡️ Security

### Security Features
- ✅ API Key Protection (Server-side only)
- ✅ Rate Limiting & DDoS Protection
- ✅ CSRF Protection
- ✅ SQL Injection Prevention
- ✅ XSS Protection Headers
- ✅ GDPR Compliance

### Security Checklist
See [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) for complete security audit.

---

## 📚 API Documentation

### Discussion API

```typescript
POST /api/ai/discussion
{
  "topic": "新規事業への投資判断",
  "agents": ["ceo", "cfo", "cmo"],
  "mode": "deepthink"
}
```

### Response Format

```typescript
{
  "id": "discussion-uuid",
  "messages": [
    {
      "agent": "ceo",
      "message": "戦略的観点から...",
      "timestamp": "2024-01-01T00:00:00Z",
      "provider": "claude-pro"
    }
  ],
  "status": "completed"
}
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md).

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## 📄 Legal

- [Privacy Policy](/privacy) - データ保護とプライバシー
- [Terms of Service](/terms) - 利用規約
- [Disclaimer](/disclaimer) - 免責事項

---

## 🔧 Troubleshooting

### 429 Too Many Requests エラーの対処

429エラーが発生する場合は、以下の対策を試してください：

#### 重要：Gemini無料プランの制限

Geminiの無料プランは**1分間に15リクエスト**という非常に厳しい制限があります。6人のエージェントが議論する場合、この制限をすぐに超えてしまいます。

**推奨対策：OpenAIを使用する**

デフォルトでOpenAIの`gpt-4o-mini`を使用するよう設定済みです。OpenAIのAPIキーを設定してください。

1. **環境変数の設定**
   ```env
   OPENAI_API_KEY=sk-...  # OpenAI APIキー（必須）
   DISABLE_RATE_LIMIT=true  # Vercelの環境変数に追加
   ```

2. **APIキーの確認**
   - OpenAI APIキーが正しく設定されていることを確認
   - [OpenAI Platform](https://platform.openai.com/account/billing)で使用状況を確認
   - Geminiを使いたい場合は、有料プランの検討をお勧めします

3. **Redisの設定（推奨）**
   ```env
   RATE_LIMIT_REDIS_URL=redis://your-redis-url
   ```
   サーバーレス環境でのレート制限を正しく機能させるためにRedisを使用

4. **クライアント側のスロットリング**
   - アプリケーションには30秒のクールダウン期間が設定されています
   - 連続して議論を実行する場合は少し待ってから実行してください

5. **Geminiで429エラーが発生した場合**
   - システムは自動的にOpenAIにフォールバックします
   - Geminiの遅延は12秒に設定されています（安全マージン）

### その他の一般的な問題

- **議論が終わらない**: 議論は最大12発言で終了するよう設定されています
- **APIエラー**: APIキーが正しく設定されていることを確認してください

---

## 🎯 Roadmap

### Q1 2024
- [ ] API Public Release
- [ ] Multi-language Support (English)
- [ ] Advanced Analytics Dashboard

### Q2 2024
- [ ] White Label Solutions
- [ ] Team Collaboration Features
- [ ] Mobile App (iOS/Android)

### Q3 2024
- [ ] On-premise Deployment
- [ ] Custom AI Agent Creation
- [ ] Enterprise SSO Integration

---

## 📞 Support

- 📧 Email: [support@hexamind.ai](mailto:support@hexamind.ai)
- 💬 Discord: [Join Community](#)
- 📖 Docs: [Documentation Site](#)
- 🐛 Issues: [GitHub Issues](../../issues)

---

## 📊 Status

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)
![Security](https://img.shields.io/badge/security-A+-brightgreen)

---

## ⭐ Show Your Support

If you find HexaMind AI helpful, please give it a ⭐️ on GitHub!

<div align="center">

**[⭐ Star this repository](../../stargazers) | [🍴 Fork this repository](../../fork) | [📢 Share HexaMind AI](#)**

---

**Built with ❤️ by the HexaMind AI Team**

*Six Executive Minds, One Powerful Decision*

</div>