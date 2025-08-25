'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PremiumSubscriptionEngine } from '@/lib/premium-subscription-integration';

interface PremiumMessage {
  id: string;
  agent: string;
  message: string;
  timestamp: Date;
  provider: string;
}

interface PremiumDiscussionScreenProps {
  topic: string;
  agents: string[];
  thinkingMode: string;
  onComplete: () => void;
}

export default function PremiumDiscussionScreen({
  topic,
  agents,
  thinkingMode,
  onComplete
}: PremiumDiscussionScreenProps) {
  const [messages, setMessages] = useState<PremiumMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [usageStats, setUsageStats] = useState<any[]>([]);
  const [engine] = useState(() => new PremiumSubscriptionEngine());

  const providerColors: Record<string, string> = {
    'claude-pro': 'bg-gradient-to-r from-orange-500 to-red-500',
    'chatgpt-plus': 'bg-gradient-to-r from-green-500 to-teal-500',
    'gemini-ultra': 'bg-gradient-to-r from-blue-500 to-purple-500',
    'error': 'bg-gray-500'
  };

  const providerIcons: Record<string, string> = {
    'claude-pro': '🧠',
    'chatgpt-plus': '⚡',
    'gemini-ultra': '✨',
    'error': '❌'
  };

  const startPremiumDiscussion = async () => {
    setIsRunning(true);
    setMessages([]);
    setCurrentStep('プレミアムAIサービスを初期化中...');

    try {
      // 使用状況を更新
      setUsageStats(engine.getUsageReport());

      const discussionGenerator = engine.runPremiumDiscussion(topic, agents, thinkingMode);
      
      for await (const result of discussionGenerator) {
        setCurrentStep(`${result.agent} が ${result.provider} で分析中...`);
        
        const newMessage: PremiumMessage = {
          id: `premium-msg-${result.agent}-${messages.length + 1}-${result.timestamp}`,
          agent: result.agent,
          message: result.message,
          timestamp: result.timestamp,
          provider: result.provider
        };

        setMessages(prev => [...prev, newMessage]);

        // 使用状況を更新
        setUsageStats(engine.getUsageReport());

        // UI更新のための間隔
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setCurrentStep('プレミアム議論完了');
    } catch (error) {
      console.error('Premium discussion error:', error);
      setCurrentStep(`エラー: ${(error as Error).message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                🏆 プレミアムAIボード会議
              </h1>
              <p className="text-slate-300 mb-4">{topic}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">使用中のサービス</div>
              <div className="flex space-x-2">
                <span className="px-2 py-1 bg-orange-600 rounded text-xs">Claude Pro</span>
                <span className="px-2 py-1 bg-green-600 rounded text-xs">ChatGPT Plus</span>
                <span className="px-2 py-1 bg-blue-600 rounded text-xs">Gemini Ultra</span>
              </div>
            </div>
          </div>

          {/* プログレス表示 */}
          {isRunning && (
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold-400"></div>
                <span className="text-sm text-gold-400">{currentStep}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1">
                <motion.div
                  className="bg-gradient-to-r from-gold-400 to-gold-600 h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(messages.length / (agents.length * 6)) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* 使用状況ダッシュボード */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {usageStats.map((stat, index) => (
              <Card key={index} className="p-4 bg-slate-800 border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-300">{stat.service}</h3>
                  <span className={`text-2xl ${
                    stat.service.includes('Claude') ? '' :
                    stat.service.includes('ChatGPT') ? '' :
                    stat.service.includes('Gemini') ? '' : ''
                  }`}>
                    {stat.service.includes('Claude') ? '🧠' :
                     stat.service.includes('ChatGPT') ? '⚡' :
                     stat.service.includes('Gemini') ? '✨' : '🤖'}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-xs text-slate-400 mb-1">
                    {stat.used.toLocaleString()} / {stat.limit.toLocaleString()} 使用
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        stat.percentage > 80 ? 'bg-red-500' :
                        stat.percentage > 60 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    残り {stat.remaining.toLocaleString()} 回
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 参加エージェント */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">参加エージェント</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {agents.map(agentId => (
              <div key={agentId} className="p-3 bg-slate-800 rounded-lg text-center">
                <div className="text-2xl mb-1">
                  {agentId === 'ceo' ? '👑' :
                   agentId === 'cfo' ? '💰' :
                   agentId === 'cmo' ? '📈' :
                   agentId === 'cto' ? '⚡' :
                   agentId === 'coo' ? '⚙️' :
                   agentId === 'devil' ? '😈' : '🤖'}
                </div>
                <div className="text-xs text-slate-300">{agentId.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 開始ボタン */}
        {!isRunning && messages.length === 0 && (
          <div className="text-center mb-8">
            <Button
              onClick={startPremiumDiscussion}
              className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold px-8 py-4 text-lg shadow-2xl"
            >
              🏆 プレミアム議論を開始
            </Button>
            <p className="text-sm text-slate-400 mt-2">
              最高品質のAIサービスで深い洞察を得ましょう
            </p>
          </div>
        )}

        {/* メッセージ一覧 */}
        <div className="space-y-4 mb-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="p-6 bg-slate-800 border-slate-700 shadow-xl">
                  <div className="flex items-start space-x-4">
                    {/* プロバイダーバッジ */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${providerColors[message.provider] || 'bg-gray-500'} shadow-lg`}>
                      <span className="text-lg">
                        {providerIcons[message.provider] || '🤖'}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* エージェント名とタイムスタンプ */}
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-lg text-white">
                          {message.agent}
                        </h4>
                        <div className="text-right">
                          <div className="text-xs text-slate-400">
                            {message.timestamp.toLocaleTimeString('ja-JP', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            message.provider === 'claude-pro' ? 'bg-orange-900 text-orange-200' :
                            message.provider === 'chatgpt-plus' ? 'bg-green-900 text-green-200' :
                            message.provider === 'gemini-ultra' ? 'bg-blue-900 text-blue-200' :
                            'bg-gray-900 text-gray-200'
                          }`}>
                            {message.provider === 'claude-pro' ? 'Claude Pro' :
                             message.provider === 'chatgpt-plus' ? 'ChatGPT Plus' :
                             message.provider === 'gemini-ultra' ? 'Gemini Ultra' :
                             'Unknown'}
                          </div>
                        </div>
                      </div>
                      
                      {/* メッセージ内容 */}
                      <div className="prose prose-invert max-w-none">
                        <p className="text-slate-200 leading-relaxed">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 完了ボタン */}
        {!isRunning && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Button 
              onClick={onComplete} 
              className="w-full max-w-md bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
            >
              プレミアム結果を確認する
            </Button>
          </motion.div>
        )}

        {/* 価値提案 */}
        {messages.length === 0 && !isRunning && (
          <Card className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 border-gold-600 border">
            <h3 className="text-xl font-bold mb-4 text-gold-400">🏆 プレミアム議論の価値</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🧠</div>
                <h4 className="font-semibold text-white mb-2">Claude Pro</h4>
                <p className="text-sm text-slate-300">200K context window<br/>最高品質の戦略分析</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-semibold text-white mb-2">ChatGPT Plus</h4>
                <p className="text-sm text-slate-300">GPT-4 + Custom GPTs<br/>高速で実務的な洞察</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">✨</div>
                <h4 className="font-semibold text-white mb-2">Gemini Ultra</h4>
                <p className="text-sm text-slate-300">1M token context<br/>革新的なアイデア創出</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}