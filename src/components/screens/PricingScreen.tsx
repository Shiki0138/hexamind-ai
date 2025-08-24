'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { SUBSCRIPTION_PLANS, calculateROI } from '@/lib/cost-efficient-models';

interface PricingScreenProps {
  onBack: () => void;
  currentPlan?: string;
  onSelectPlan: (planId: string) => void;
}

export default function PricingScreen({ onBack, currentPlan = 'free', onSelectPlan }: PricingScreenProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const getPrice = (monthlyPrice: number) => {
    if (billingCycle === 'yearly') {
      // 年払いは20%割引
      return Math.floor(monthlyPrice * 12 * 0.8);
    }
    return monthlyPrice;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto max-w-6xl space-y-8">
        {/* ヘッダー */}
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            >
              戻る
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              料金プラン
            </h1>
          </div>
        </header>

        {/* 説明文 */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            あなたのビジネスに最適なプランを選択
          </h2>
          <p className="text-lg text-gray-600">
            6人のAI役員による高度な意思決定支援。
            コスト効率の良いモデルで、質の高い議論を実現します。
          </p>
        </div>

        {/* 料金サイクル切り替え */}
        <div className="flex justify-center">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600'
              }`}
            >
              月払い
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600'
              }`}
            >
              年払い（20%OFF）
            </button>
          </div>
        </div>

        {/* プランカード */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            const roi = plan.monthlyPrice > 0 ? calculateROI(
              plan.monthlyPrice,
              plan.monthlyDiscussions > 0 ? plan.monthlyDiscussions : 1000,
              30, // 30分/議論
              10000 // 10,000円/時
            ) : null;

            return (
              <Card
                key={plan.id}
                className={`p-6 relative ${
                  plan.id === 'starter' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {plan.id === 'starter' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                      おすすめ
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {plan.displayName}
                    </h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">
                        {formatPrice(getPrice(plan.monthlyPrice))}
                      </span>
                      <span className="text-gray-600">
                        /{billingCycle === 'monthly' ? '月' : '年'}
                      </span>
                    </div>
                    {plan.monthlyDiscussions > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        月{plan.monthlyDiscussions}回まで
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {roi && plan.monthlyDiscussions > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-xs text-gray-600">
                        1議論あたり: {formatPrice(roi.costPerDiscussion)}
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        ROI: +{Math.round(roi.roi)}%
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? 'outline' : 'default'}
                    disabled={isCurrentPlan}
                    onClick={() => onSelectPlan(plan.id)}
                  >
                    {isCurrentPlan ? '現在のプラン' : '選択する'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* AIモデル情報 */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3">
            使用するAIモデルについて
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-800">Gemini 1.5 Pro</h4>
              <p className="text-blue-700">
                コスト効率: ★★★★★<br />
                品質: ★★★★☆<br />
                1議論あたり約¥8.8
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800">Claude 3.5 Sonnet</h4>
              <p className="text-blue-700">
                コスト効率: ★★★★☆<br />
                品質: ★★★★★<br />
                1議論あたり約¥10.8
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800">GPT-4 Turbo</h4>
              <p className="text-blue-700">
                コスト効率: ★★★☆☆<br />
                品質: ★★★★☆<br />
                1議論あたり約¥27
              </p>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-4">
            ※ 6エージェント×3ラウンドの標準的な議論での推定コスト
          </p>
        </Card>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-lg font-bold mb-4">よくある質問</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">
                なぜ最新モデル（GPT-5等）を使わないのですか？
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                6つのエージェントの相互作用により、コスト効率の良いモデルでも
                十分に高品質な議論が可能です。最新モデルと比較して
                コストを80%削減しながら、90%以上の品質を維持しています。
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                議論の品質は保証されますか？
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                多様な視点を持つ6人のAIエージェントが相互に検証・反論することで、
                単一の高性能AIを上回る洞察を提供します。
                特に悪魔の代弁者による批判的検証が品質を担保します。
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                月間制限を超えた場合は？
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                上位プランへのアップグレードをお勧めします。
                エンタープライズプランでは無制限で利用可能です。
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}