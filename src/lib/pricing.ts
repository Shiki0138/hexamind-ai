// 統一された価格・機能定義
// この定義をすべてのコンポーネントで使用して一貫性を保つ

export interface PlanFeatures {
  name: string;
  price: number; // 円単位
  priceDisplay: string; // 表示用価格
  currency: 'jpy';
  interval: 'month';
  monthlyDiscussions: number; // -1 = unlimited
  dailyLimit: number; // -1 = unlimited
  maxAgents: number;
  availableModes: string[];
  aiQuality: string;
  features: string[];
  restrictions?: string[];
  popular?: boolean;
  stripePriceId?: string; // Stripe連携用
}

export const UNIFIED_PRICING: Record<string, PlanFeatures> = {
  free: {
    name: 'フリー',
    price: 0,
    priceDisplay: '¥0',
    currency: 'jpy',
    interval: 'month',
    monthlyDiscussions: 3,
    dailyLimit: 1,
    maxAgents: 3,
    availableModes: ['通常モード'],
    aiQuality: '標準品質',
    features: [
      '月3回まで議論可能',
      '1日1回の利用制限',
      '基本AI軍師3名',
      '通常モードのみ',
      '議論結果の保存'
    ],
    restrictions: [
      '機能制限あり',
      'サポートなし',
      '広告表示'
    ]
  },
  basic: {
    name: 'ベーシック',
    price: 2980,
    priceDisplay: '¥2,980',
    currency: 'jpy',
    interval: 'month',
    monthlyDiscussions: 50,
    dailyLimit: 5,
    maxAgents: 6,
    availableModes: ['通常モード', 'クリエイティブモード'],
    aiQuality: '高品質',
    features: [
      '月50回まで議論可能',
      '1日5回の利用制限',
      'AI軍師6名すべて利用可能',
      '通常・クリエイティブモード',
      '議論履歴の保存・検索',
      'レポートのエクスポート',
      'メールサポート'
    ],
    popular: true,
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID
  },
  pro: {
    name: 'プロ',
    price: 9800,
    priceDisplay: '¥9,800',
    currency: 'jpy',
    interval: 'month',
    monthlyDiscussions: 200,
    dailyLimit: 15,
    maxAgents: 12,
    availableModes: ['すべてのモード'],
    aiQuality: 'プレミアム品質',
    features: [
      '月200回まで議論可能',
      '1日15回の利用制限',
      'AI軍師12名すべて利用可能',
      'すべての検討モード利用可能',
      '詳細分析レポート',
      'ビジュアルレポート',
      '優先処理',
      'チャットサポート',
      'カスタム質問テンプレート'
    ],
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID
  },
  enterprise: {
    name: 'エンタープライズ',
    price: 29800,
    priceDisplay: '¥29,800',
    currency: 'jpy',
    interval: 'month',
    monthlyDiscussions: -1,
    dailyLimit: -1,
    maxAgents: 12,
    availableModes: ['すべてのモード + カスタム'],
    aiQuality: '最高品質',
    features: [
      '無制限利用',
      'AI軍師12名 + カスタム作成',
      'すべての検討モード + カスタム',
      '専任カスタマーサクセス',
      '24時間サポート',
      'SLA保証',
      'API連携',
      'ホワイトラベル対応',
      'カスタム開発対応',
      'オンプレミス対応可能'
    ],
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID
  }
};

// UserTierとの対応表
export const TIER_TO_PLAN_MAP = {
  'free': 'free',
  'basic': 'basic', 
  'pro': 'pro',
  'enterprise': 'enterprise'
} as const;

// プラン比較用のヘルパー関数
export function getPlanByTier(tier: string): PlanFeatures | null {
  return UNIFIED_PRICING[TIER_TO_PLAN_MAP[tier as keyof typeof TIER_TO_PLAN_MAP]] || null;
}

// プランレベルの比較（アップグレード判定用）
export function getPlanLevel(planKey: string): number {
  const levels = { free: 0, basic: 1, pro: 2, enterprise: 3 };
  return levels[planKey as keyof typeof levels] || 0;
}

// 価格表示のフォーマット
export function formatPrice(price: number): string {
  if (price === 0) return '無料';
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0
  }).format(price);
}
