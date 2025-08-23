'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircleIcon, XCircleIcon, CogIcon } from '@heroicons/react/24/outline';

interface ProviderStatus {
  name: string;
  type: 'free' | 'subscription' | 'api';
  status: 'available' | 'limited' | 'unavailable';
  remaining?: number;
  dailyLimit?: number;
  cost?: string;
  description: string;
  setupInstructions?: string;
}

export default function AIProviderSettings() {
  const [providers, setProviders] = useState<ProviderStatus[]>([
    {
      name: 'Google Gemini (無料)',
      type: 'free',
      status: 'available',
      remaining: 45,
      dailyLimit: 60,
      cost: '無料',
      description: '1日60回まで無料で利用可能。基本的な議論に最適。'
    },
    {
      name: 'OpenAI API (従量課金)',
      type: 'api', 
      status: 'available',
      cost: '約$0.05/議論',
      description: 'GPT-4o-miniを使用。高品質で低コスト。',
      setupInstructions: '1. OpenAIアカウント作成\n2. APIキー取得\n3. $5クレジット追加'
    },
    {
      name: 'Claude Pro (月額$20)',
      type: 'subscription',
      status: 'unavailable',
      cost: '$20/月',
      description: '無制限議論、最高品質の分析。プロフェッショナル向け。',
      setupInstructions: '1. Claude.aiでProアップグレード\n2. APIキー取得\n3. 即座に利用開始'
    },
    {
      name: 'ChatGPT Plus (月額$20)',
      type: 'subscription',
      status: 'limited',
      remaining: 12,
      dailyLimit: 40,
      cost: '$20/月',
      description: '3時間で40メッセージまで。安定した高品質議論。'
    }
  ]);

  const [selectedProvider, setSelectedProvider] = useState<string>('Google Gemini (無料)');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'limited': return 'text-yellow-600 bg-yellow-100';
      case 'unavailable': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'limited': return <CogIcon className="w-5 h-5 text-yellow-600" />;
      case 'unavailable': return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI プロバイダー設定</h1>
          <p className="text-gray-600">
            利用可能なAIサービスの状況を確認し、最適なプランを選択してください。
          </p>
        </motion.div>

        {/* コスト比較表 */}
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">💰 コスト比較</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {providers.map((provider, index) => (
              <motion.div
                key={provider.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedProvider === provider.name 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedProvider(provider.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{provider.name}</h3>
                  {getStatusIcon(provider.status)}
                </div>
                
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getStatusColor(provider.status)}`}>
                  {provider.status === 'available' && '利用可能'}
                  {provider.status === 'limited' && '制限あり'}
                  {provider.status === 'unavailable' && '未設定'}
                </div>

                <p className="text-lg font-bold text-blue-600 mb-2">{provider.cost}</p>
                
                {provider.remaining && provider.dailyLimit && (
                  <div className="mb-2">
                    <div className="text-xs text-gray-600 mb-1">
                      残り: {provider.remaining}/{provider.dailyLimit}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(provider.remaining / provider.dailyLimit) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-600">{provider.description}</p>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* 推奨プラン */}
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">🎯 あなたに最適なプラン</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
              <h3 className="font-semibold text-green-800 mb-2">🌱 スタータープラン</h3>
              <p className="text-sm text-green-600 mb-3">まずは無料で体験</p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Google Gemini無料枠</li>
                <li>• 1日最大60回の議論</li>
                <li>• 基本的な機能をすべて体験</li>
              </ul>
              <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                無料で開始
              </Button>
            </div>

            <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <h3 className="font-semibold text-blue-800 mb-2">⚡ パワーユーザー</h3>
              <p className="text-sm text-blue-600 mb-3">高品質×低コスト</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• OpenAI API ($5でスタート)</li>
                <li>• 約100回の高品質議論</li>
                <li>• 従量課金で無駄なし</li>
              </ul>
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                APIキー設定
              </Button>
            </div>

            <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
              <h3 className="font-semibold text-purple-800 mb-2">👑 プロフェッショナル</h3>
              <p className="text-sm text-purple-600 mb-3">無制限×最高品質</p>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Claude Pro ($20/月)</li>
                <li>• 無制限の深い議論</li>
                <li>• ファイル分析対応</li>
              </ul>
              <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                プロアップグレード
              </Button>
            </div>
          </div>
        </Card>

        {/* セットアップ手順 */}
        {selectedProvider && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">🔧 {selectedProvider} セットアップ手順</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">
                {providers.find(p => p.name === selectedProvider)?.setupInstructions || 
                 '選択したプロバイダーはすぐに利用可能です。'}
              </pre>
            </div>
            
            <div className="mt-6 flex gap-4">
              <Button className="flex-1">
                設定を開始
              </Button>
              <Button variant="outline" className="flex-1">
                後で設定
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}