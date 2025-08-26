'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { calculateDiscussionCost, estimateMonthlyCost } from '@/lib/cost-calculator';
import { AI_MODELS } from '@/lib/model-config';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface CostEstimateScreenProps {
  onClose: () => void;
}

export default function CostEstimateScreen({ onClose }: CostEstimateScreenProps) {
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [selectedAgentCount, setSelectedAgentCount] = useState(6);
  const [selectedThinkingMode, setSelectedThinkingMode] = useState('normal');
  const [dailyDiscussions, setDailyDiscussions] = useState(3);

  const costBreakdown = calculateDiscussionCost(
    selectedModel,
    selectedAgentCount,
    selectedThinkingMode
  );

  const monthlyCost = estimateMonthlyCost(
    dailyDiscussions,
    selectedModel,
    selectedAgentCount
  );

  const formatCurrency = (jpy: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(jpy);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* ヘッダー */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">コスト見積もり</h1>
            <p className="text-slate-300">AIディスカッションの予想コストを計算します</p>
          </div>

          {/* 設定セクション */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">設定</h2>
            
            {/* モデル選択 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">AIモデル</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-slate-700 rounded-lg px-4 py-2 text-white"
              >
                <optgroup label="OpenAI">
                  <option value="gpt-4o">GPT-4o (最高品質) - ¥0.75/1K tokens</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (バランス) - ¥0.06/1K tokens</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (高速) - ¥0.15/1K tokens</option>
                </optgroup>
                <optgroup label="Google Gemini">
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (最安値) - ¥0.01/1K tokens</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (高品質) - ¥0.19/1K tokens</option>
                </optgroup>
              </select>
            </div>

            {/* エージェント数 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                参加エージェント数: {selectedAgentCount}人
              </label>
              <input
                type="range"
                min="3"
                max="6"
                value={selectedAgentCount}
                onChange={(e) => setSelectedAgentCount(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* 思考モード */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">思考モード</label>
              <select
                value={selectedThinkingMode}
                onChange={(e) => setSelectedThinkingMode(e.target.value)}
                className="w-full bg-slate-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="normal">通常モード（標準的な議論）</option>
                <option value="deepthink">深い思考モード（詳細な分析）</option>
                <option value="creative">クリエイティブモード（革新的アイデア）</option>
                <option value="critical">批判的モード（リスク重視）</option>
              </select>
            </div>

            {/* 1日の議論回数 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                1日の議論回数: {dailyDiscussions}回
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={dailyDiscussions}
                onChange={(e) => setDailyDiscussions(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </Card>

          {/* 1議論あたりのコスト */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">1議論あたりの推定コスト</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">メッセージ数</p>
                <p className="text-2xl font-bold">{costBreakdown.totalMessages}件</p>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">推定コスト</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(costBreakdown.estimatedCost.jpy)}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">入力トークン</span>
                <span>{costBreakdown.estimatedTokens.input.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">出力トークン</span>
                <span>{costBreakdown.estimatedTokens.output.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">合計トークン</span>
                <span>{costBreakdown.estimatedTokens.total.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* 月額コスト予測 */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">使用量別コスト予測</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">日額</p>
                <p className="text-xl font-bold text-blue-400">
                  {formatCurrency(monthlyCost.daily.jpy)}
                </p>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">週額</p>
                <p className="text-xl font-bold text-purple-400">
                  {formatCurrency(monthlyCost.weekly.jpy)}
                </p>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">月額</p>
                <p className="text-xl font-bold text-orange-400">
                  {formatCurrency(monthlyCost.monthly.jpy)}
                </p>
              </div>
            </div>
          </Card>

          {/* 推奨事項 */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">コスト削減のヒント</h2>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">•</span>
                <span>通常の議論には「GPT-4o Mini」を使用し、重要な意思決定時のみ「GPT-4o」を使用</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">•</span>
                <span>議論の長さを最適化し、不要な繰り返しを避ける</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">•</span>
                <span>定型的な議論にはテンプレートを活用する</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">•</span>
                <span>Gemini 2.0 Flashは最安値だが、レート制限（15req/分）に注意</span>
              </li>
            </ul>
          </Card>

          {/* アクションボタン */}
          <div className="flex justify-end">
            <Button onClick={onClose}>
              閉じる
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}