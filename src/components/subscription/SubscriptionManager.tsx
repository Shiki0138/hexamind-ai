'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserTier, TIER_LIMITS } from '@/lib/auth-system';
import { DatabaseService } from '@/lib/database-adapter';
import { UNIFIED_PRICING } from '@/lib/pricing';


interface SubscriptionManagerProps {
  currentTier?: UserTier;
  showUpgradeOnly?: boolean;
}

interface SubscriptionInfo {
  tier: UserTier;
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  stripeSubscriptionId?: string;
}

export default function SubscriptionManager({ 
  currentTier = UserTier.FREE,
  showUpgradeOnly = false
}: SubscriptionManagerProps) {
  const { data: session } = useSession();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user?.id) {
      loadSubscriptionInfo();
    }
  }, [session]);

  const loadSubscriptionInfo = async () => {
    try {
      setLoading(true);
      const activeSubscription = await DatabaseService.getActiveSubscription(session?.user?.id || '');
      
      if (activeSubscription) {
        setSubscriptionInfo({
          tier: currentTier,
          status: activeSubscription.status,
          currentPeriodEnd: activeSubscription.current_period_end || undefined,
          stripeSubscriptionId: activeSubscription.stripe_subscription_id || undefined
        });
      } else {
        setSubscriptionInfo({
          tier: UserTier.FREE,
          status: 'inactive'
        });
      }
    } catch (error) {
      console.error('Failed to load subscription info:', error);
      setError('サブスクリプション情報の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: UserTier) => {
    if (!session?.user?.id) {
      setError('ログインが必要です');
      return;
    }

    // Stripeが設定されていない場合はアップグレードを無効化
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setError('決済機能は現在利用できません。サポートにお問い合わせください。');
      return;
    }

    try {
      setUpgradeLoading(tier);
      setError('');

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'チェックアウトセッションの作成に失敗しました');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('チェックアウトURLが取得できませんでした');
      }

    } catch (error: any) {
      setError(error.message);
      setUpgradeLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!session?.user?.id) {
      setError('ログインが必要です');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'カスタマーポータルの作成に失敗しました');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('ポータルURLが取得できませんでした');
      }

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPlanCard = (tier: UserTier, plan: any) => {
    const isCurrentPlan = currentTier === tier;
    const isUpgrade = getTierLevel(tier) > getTierLevel(currentTier);
    const isDowngrade = getTierLevel(tier) < getTierLevel(currentTier);
    const limits = TIER_LIMITS[tier];

    return (
      <div
        key={tier}
        className={`relative rounded-lg border-2 p-6 ${
          isCurrentPlan
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-gray-200 bg-white'
        }`}
      >
        {isCurrentPlan && (
          <div className="absolute -top-3 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            現在のプラン
          </div>
        )}

        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {plan.name}
          </h3>
          
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-900">
              {plan.priceDisplay}
            </span>
            <span className="text-gray-500 ml-1">/月</span>
          </div>

          <div className="text-left mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">含まれる機能:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-left mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">利用制限:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>月間議論: {limits.monthlyDiscussions === -1 ? '無制限' : `${limits.monthlyDiscussions}回`}</li>
              <li>日間議論: {limits.dailyLimit === -1 ? '無制限' : `${limits.dailyLimit}回`}</li>
              <li>利用可能エージェント: {limits.maxAgents}人</li>
              <li>利用可能モード: {Array.isArray(limits.modes) ? limits.modes.join(', ') : 'すべて'}</li>
            </ul>
          </div>

          {!showUpgradeOnly && isCurrentPlan ? (
            <div className="space-y-2">
              <button
                onClick={handleManageSubscription}
                disabled={loading}
                className="w-full bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? '処理中...' : 'サブスクリプション管理'}
              </button>
              
              {subscriptionInfo?.currentPeriodEnd && (
                <p className="text-xs text-gray-500">
                  次回更新: {new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString('ja-JP')}
                </p>
              )}
            </div>
          ) : isUpgrade || (showUpgradeOnly && tier !== UserTier.FREE) ? (
            <div className="space-y-2">
              <button
                onClick={() => handleUpgrade(tier)}
                disabled={!!upgradeLoading || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {upgradeLoading === tier ? '処理中...' : 'このプランを選択'}
              </button>
              {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
                <p className="text-xs text-orange-400 text-center">
                  決済機能は現在使用できません
                </p>
              )}
            </div>
          ) : isDowngrade ? (
            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              プラン変更
            </button>
          ) : (
            <div className="w-full bg-gray-100 text-gray-500 font-medium py-2 px-4 rounded-lg text-center">
              現在のプラン
            </div>
          )}
        </div>
      </div>
    );
  };

  const getTierLevel = (tier: UserTier): number => {
    const levels = {
      [UserTier.FREE]: 0,
      [UserTier.BASIC]: 1,
      [UserTier.PRO]: 2,
      [UserTier.ENTERPRISE]: 3,
    };
    return levels[tier] || 0;
  };

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">
          プランを確認するには、ログインが必要です。
        </p>
        <a
          href="/auth/signin"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          ログイン
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!showUpgradeOnly && currentTier !== UserTier.FREE && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">現在のサブスクリプション</h3>
              <p className="text-sm text-blue-700">
                プラン: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
                {subscriptionInfo?.status && (
                  <span className="ml-2 text-xs">
                    (ステータス: {subscriptionInfo.status})
                  </span>
                )}
              </p>
              {subscriptionInfo?.currentPeriodEnd && (
                <p className="text-xs text-blue-600">
                  次回更新: {new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString('ja-JP')}
                </p>
              )}
            </div>
            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              管理
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(UNIFIED_PRICING)
          .filter(([tier]) => tier !== 'free')
          .map(([tier, plan]) =>
          getPlanCard(tier as UserTier, plan)
        )}
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>
          すべての価格は日本円（税込）です。サブスクリプションはいつでもキャンセルできます。
        </p>
        <p className="mt-1">
          プラン変更は次回請求サイクルから適用されます。
        </p>
      </div>
    </div>
  );
}