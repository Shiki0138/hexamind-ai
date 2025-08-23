'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';

interface Message {
  id: string;
  agentId: string;
  agentName: string;
  content: string;
  timestamp: number;
  avatar: string;
  color: string;
}

interface DiscussionScreenProps {
  question: string;
  selectedAgents: string[];
  mode: string;
  onComplete: (conclusion: any) => void;
}

// モックAIエージェント応答
const AGENT_INFO = {
  ceo: { name: '山田CEO', avatar: '🎯', color: 'bg-blue-500' },
  cfo: { name: '佐藤CFO', avatar: '💰', color: 'bg-purple-500' },
  cmo: { name: '田中CMO', avatar: '📊', color: 'bg-pink-500' },
  cto: { name: '鈴木CTO', avatar: '💻', color: 'bg-cyan-500' },
  coo: { name: '高橋COO', avatar: '⚙️', color: 'bg-green-500' },
  devil: { name: '悪魔の代弁者', avatar: '😈', color: 'bg-red-500' }
};

const MOCK_RESPONSES = {
  ceo: [
    "戦略的観点から見ると、この投資は中長期的な成長に重要だと考えます。",
    "市場機会は確実に存在しており、競合優位性を築く絶好のチャンスです。",
    "ただし、実行計画を段階的に進め、リスクを分散することを提案します。"
  ],
  cfo: [
    "財務分析の結果、ROIは3年で15%程度を見込んでいます。",
    "キャッシュフローへの影響を考慮すると、分割投資が現実的でしょう。",
    "税制上の優遇措置も活用できるため、財務的には妥当な判断です。"
  ],
  devil: [
    "しかし、この市場には既に強力な競合が存在します。差別化は本当に可能でしょうか？",
    "楽観的な予測が多すぎるのではないでしょうか。最悪のシナリオも検討すべきです。",
    "投資資金を他の確実性の高い事業に回す選択肢も検討しましたか？"
  ]
};

export default function DiscussionScreen({ 
  question, 
  selectedAgents, 
  mode, 
  onComplete 
}: DiscussionScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // モック議論シミュレーション
  useEffect(() => {
    const simulateDiscussion = async () => {
      const totalRounds = mode === 'speed' ? 1 : mode === 'balanced' ? 2 : 3;
      let messageId = 0;

      for (let round = 0; round < totalRounds; round++) {
        for (const agentId of selectedAgents) {
          if (AGENT_INFO[agentId as keyof typeof AGENT_INFO] && MOCK_RESPONSES[agentId as keyof typeof MOCK_RESPONSES]) {
            const agent = AGENT_INFO[agentId as keyof typeof AGENT_INFO];
            const responses = MOCK_RESPONSES[agentId as keyof typeof MOCK_RESPONSES];
            
            // エージェントが話し始める
            setCurrentSpeaker(agentId);
            
            // 2秒待機（考えている時間）
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // メッセージを追加
            const message: Message = {
              id: `${messageId++}`,
              agentId,
              agentName: agent.name,
              content: responses[round] || responses[responses.length - 1],
              timestamp: Date.now(),
              avatar: agent.avatar,
              color: agent.color
            };
            
            setMessages(prev => [...prev, message]);
            setCurrentSpeaker(null);
            
            // プログレス更新
            setProgress((messageId / (selectedAgents.length * totalRounds)) * 100);
            
            // メッセージ間の間隔
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      // 議論完了
      setTimeout(() => {
        onComplete({
          conclusion: "段階的投資を推奨",
          summary: "市場機会は確実に存在するが、リスク分散のため段階的なアプローチを取ることで、成功確率を高めつつROIを最大化できる",
          votes: {
            approve: selectedAgents.filter(id => id !== 'devil').length,
            conditional: 1,
            reject: selectedAgents.includes('devil') ? 1 : 0
          }
        });
      }, 2000);
    };

    simulateDiscussion();
  }, [selectedAgents, mode, onComplete]);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ヘッダー */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold text-gray-900">
              議論中...
            </h1>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}%
            </span>
          </div>
          
          {/* プログレスバー */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {question}
          </p>
        </div>
      </div>

      {/* 議論内容 */}
      <div className="px-4 py-6">
        <div className="mx-auto max-w-md space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full ${message.color} flex items-center justify-center text-white text-sm font-semibold shrink-0`}>
                      <span className="text-lg">{message.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {message.agentName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* 現在話している人の表示 */}
          {currentSpeaker && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-4 border-2 border-blue-200 bg-blue-50">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-blue-700 font-medium">
                    {AGENT_INFO[currentSpeaker as keyof typeof AGENT_INFO]?.name}が考えています...
                  </span>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}