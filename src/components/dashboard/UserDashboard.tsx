'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DatabaseService } from '@/lib/supabase';
import { TIER_LIMITS, UserTier } from '@/lib/auth-system';
import SubscriptionManager from '@/components/subscription/SubscriptionManager';
import Link from 'next/link';

interface UsageStats {
  totalDiscussions: number;
  monthlyDiscussions: number;
  successRate: number;
  averageResponseTime: number;
  topAgents: string[];
  topModes: string[];
}

interface SubscriptionInfo {
  tier: UserTier;
  status: string;
  monthlyUsage: number;
  dailyUsage: number;
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      loadDashboardData();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, session]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const userId = session?.user?.id;
      
      if (!userId) return;

      // Load usage analytics
      const analytics = await DatabaseService.getUserAnalytics(userId);
      setUsageStats(analytics);

      // Load subscription info
      const monthlyUsage = await DatabaseService.getMonthlyUsage(userId);
      const dailyUsage = await DatabaseService.getDailyUsage(userId);
      
      setSubscriptionInfo({
        tier: (session.user as any).tier || UserTier.FREE,
        status: (session.user as any).subscriptionStatus || 'inactive',
        monthlyUsage,
        dailyUsage
      });

    } catch (err) {
      setError('ダッシュボードデータの読み込みに失敗しました');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              ログインが必要です
            </h1>
            <p className="text-gray-300 mb-8">
              ダッシュボードにアクセスするには、サインインしてください。
            </p>
            <a
              href="/auth/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              サインイン
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-6 py-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const currentTier = subscriptionInfo?.tier || UserTier.FREE;
  const tierLimits = TIER_LIMITS[currentTier];
  const usagePercentage = tierLimits.monthlyDiscussions === -1 
    ? 0 
    : Math.round((subscriptionInfo?.monthlyUsage || 0) / tierLimits.monthlyDiscussions * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">
              ダッシュボード
            </h1>
            <p className="text-gray-300 mt-2">
              ようこそ、{session?.user?.name || session?.user?.email} さん
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm text-gray-300">プラン: </span>
              <span className="font-medium text-white capitalize">
                {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
              </span>
            </div>
            
            {currentTier === UserTier.FREE ? (
              <Link href="/pricing">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                  アップグレード
                </button>
              </Link>
            ) : (
              <button 
                onClick={() => {
                  // Handle subscription management
                  const event = new CustomEvent('openSubscriptionManager');
                  window.dispatchEvent(event);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                サブスクリプション管理
              </button>
            )}
          </div>
        </div>

        {/* Usage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">月間利用回数</p>
                <p className="text-2xl font-bold text-white">
                  {subscriptionInfo?.monthlyUsage || 0}
                  <span className="text-sm text-gray-400 ml-1">
                    / {tierLimits.monthlyDiscussions === -1 ? '∞' : tierLimits.monthlyDiscussions}
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                📊
              </div>
            </div>
            
            {tierLimits.monthlyDiscussions !== -1 && (
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      usagePercentage > 80 ? 'bg-red-500' : 
                      usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {usagePercentage}% 使用済み
                </p>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">本日の利用回数</p>
                <p className="text-2xl font-bold text-white">
                  {subscriptionInfo?.dailyUsage || 0}
                  <span className="text-sm text-gray-400 ml-1">
                    / {tierLimits.dailyLimit === -1 ? '∞' : tierLimits.dailyLimit}
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                📈
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">総議論回数</p>
                <p className="text-2xl font-bold text-white">
                  {usageStats?.totalDiscussions || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                💬
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">成功率</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(usageStats?.successRate || 0)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                ✅
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              よく使用するエージェント
            </h3>
            <div className="space-y-3">
              {(usageStats?.topAgents || []).map((agent, index) => (
                <div key={agent} className="flex items-center justify-between">
                  <span className="text-gray-300">{agent}</span>
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-gray-700 rounded-full mr-3">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${100 - (index * 20)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-400">#{index + 1}</span>
                  </div>
                </div>
              ))}
              
              {(!usageStats?.topAgents || usageStats.topAgents.length === 0) && (
                <p className="text-gray-400 text-center py-8">
                  まだ議論を開始していません
                </p>
              )}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              よく使用する検討モード
            </h3>
            <div className="space-y-3">
              {(usageStats?.topModes || []).map((mode, index) => (
                <div key={mode} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">{mode}</span>
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-gray-700 rounded-full mr-3">
                      <div 
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${100 - (index * 25)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-400">#{index + 1}</span>
                  </div>
                </div>
              ))}
              
              {(!usageStats?.topModes || usageStats.topModes.length === 0) && (
                <p className="text-gray-400 text-center py-8">
                  まだ議論を開始していません
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Management */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {currentTier === UserTier.FREE ? 'プランをアップグレード' : 'サブスクリプション管理'}
          </h3>
          <div className="bg-white rounded-lg p-6">
            <SubscriptionManager 
              currentTier={currentTier} 
              showUpgradeOnly={currentTier === UserTier.FREE}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            クイックアクション
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
            >
              新しい議論を開始
            </a>
            <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              議論履歴を表示
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              使用状況をエクスポート
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}