'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AIDiscussionEngine, AI_AGENTS, ThinkingMode } from '@/lib/ai-agents';

interface Message {
  id: string;
  agent: string;
  message: string;
  timestamp: Date;
}

interface RealDiscussionScreenProps {
  topic: string;
  agents: string[];
  thinkingMode?: ThinkingMode;
  onComplete: () => void;
}

export default function RealDiscussionScreen({
  topic,
  agents,
  thinkingMode = 'normal',
  onComplete
}: RealDiscussionScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const agentColors: Record<string, string> = {
    'CEO AI': 'bg-purple-500',
    'CFO AI': 'bg-green-500', 
    'CMO AI': 'bg-blue-500',
    'CTO AI': 'bg-orange-500',
    'COO AI': 'bg-red-500',
    '悪魔の代弁者': 'bg-gray-700',
    '議論総括': 'bg-indigo-600'
  };

  const agentAvatars: Record<string, string> = {
    'CEO AI': '👑',
    'CFO AI': '💰',
    'CMO AI': '📈',
    'CTO AI': '⚡',
    'COO AI': '⚙️',
    '悪魔の代弁者': '😈',
    '議論総括': '📋'
  };

  const startRealDiscussion = async () => {
    setIsRunning(true);
    setError(null);
    setMessages([]);
    setProgress(0);

    try {
      const engine = new AIDiscussionEngine();
      const discussionGenerator = engine.startDiscussion(topic, agents, thinkingMode);
      
      let messageCount = 0;
      const expectedMessages = agents.length * 4; // 各エージェント約4回発言

      for await (const result of discussionGenerator) {
        const newMessage: Message = {
          id: Date.now().toString() + Math.random(),
          agent: result.agent,
          message: result.message,
          timestamp: result.timestamp
        };

        setMessages(prev => [...prev, newMessage]);
        messageCount++;
        setProgress((messageCount / expectedMessages) * 100);

        // UIの更新を少し待つ
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setProgress(100);
    } catch (error) {
      console.error('Discussion error:', error);
      setError('ディスカッション中にエラーが発生しました: ' + (error as Error).message);
    } finally {
      setIsRunning(false);
    }
  };

  const startMockDiscussion = () => {
    setIsRunning(true);
    setError(null);
    setMessages([]);
    setProgress(0);

    const mockMessages = [
      { agent: 'CEO AI', message: 'この案件について、全体戦略の観点から検討しましょう。市場への影響と長期的な成長性を重視すべきです。', delay: 1000 },
      { agent: 'CFO AI', message: '財務的には慎重な検討が必要です。初期投資額と予想ROIを詳細に分析する必要があります。', delay: 2500 },
      { agent: 'CMO AI', message: '顧客の反応を見る限り、市場ニーズは確実に存在します。ブランド価値向上にも繋がると考えます。', delay: 4000 },
      { agent: 'CTO AI', message: '技術的な実現性は高いです。ただし、スケーラビリティを考慮したアーキテクチャが重要になります。', delay: 5500 },
      { agent: 'COO AI', message: '実行面では、現在のチーム体制で対応可能です。ただし、追加リソースの確保が必要になる可能性があります。', delay: 7000 },
      { agent: '悪魔の代弁者', message: '競合他社の動向を考慮すると、リスクが過小評価されている可能性があります。市場飽和の懸念もあります。', delay: 8500 },
      { agent: 'CEO AI', message: '皆様の意見を踏まえ、段階的なアプローチを提案します。まずは小規模なパイロット実施から始めましょう。', delay: 10000 },
      { agent: '議論総括', message: 'チーム全体として、慎重かつ戦略的なアプローチで進める方針で合意しました。リスク管理を重視しつつ、市場機会を活用していきます。', delay: 11500 }
    ];

    mockMessages.forEach((mockMsg, index) => {
      setTimeout(() => {
        const newMessage: Message = {
          id: Date.now().toString() + Math.random(),
          agent: mockMsg.agent,
          message: mockMsg.message,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setProgress(((index + 1) / mockMessages.length) * 100);

        if (index === mockMessages.length - 1) {
          setIsRunning(false);
        }
      }, mockMsg.delay);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">AIボード会議</h1>
          <p className="text-slate-300 mb-4">{topic}</p>
          
          {/* 進行状況 */}
          <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* 参加者 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {agents.map(agentId => {
              const agent = AI_AGENTS[agentId];
              return agent ? (
                <div
                  key={agentId}
                  className="flex items-center bg-slate-700 rounded-full px-3 py-1 text-sm"
                >
                  <span className="mr-2">{agentAvatars[agent.name] || '🤖'}</span>
                  {agent.name}
                </div>
              ) : null;
            })}
          </div>

          {/* コントロールボタン */}
          <div className="flex gap-4 mb-6">
            <Button
              onClick={startRealDiscussion}
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? '実行中...' : 'リアルAI議論を開始'}
            </Button>
            <Button
              onClick={startMockDiscussion}
              disabled={isRunning}
              variant="outline"
              className="flex-1"
            >
              {isRunning ? '実行中...' : 'モック議論を開始'}
            </Button>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <Card className="mb-4 p-4 bg-red-900 border-red-700">
            <p className="text-red-200">{error}</p>
          </Card>
        )}

        {/* メッセージ一覧 */}
        <div className="space-y-4 mb-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${agentColors[message.agent] || 'bg-gray-500'}`}>
                      <span className="text-lg">
                        {agentAvatars[message.agent] || '🤖'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-white">{message.agent}</h4>
                        <span className="text-xs text-slate-400">
                          {message.timestamp.toLocaleTimeString('ja-JP', { 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            second: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-slate-200 mt-1 leading-relaxed">
                        {message.message}
                      </p>
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
            <Button onClick={onComplete} className="w-full max-w-md">
              結果を確認する
            </Button>
          </motion.div>
        )}

        {/* 使用方法の説明 */}
        {messages.length === 0 && !isRunning && (
          <Card className="p-6">
            <h3 className="font-semibold mb-3">使用方法</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p><strong>リアルAI議論：</strong> OpenAI APIを使用して実際のAIエージェントが議論を行います。</p>
              <p><strong>モック議論：</strong> 事前に用意されたサンプル議論を表示します。</p>
              {!process.env.NEXT_PUBLIC_OPENAI_API_KEY && (
                <p className="mt-4 p-3 bg-yellow-900 border border-yellow-700 rounded">
                  <strong>注意：</strong> リアルAI議論を使用するには、環境変数にOPENAI_API_KEYを設定してください。
                </p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}