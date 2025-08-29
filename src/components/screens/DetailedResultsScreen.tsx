'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  ShareIcon, 
  DocumentTextIcon,
  ClockIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { DiscussionStorageManager } from '@/lib/discussion-storage';

interface Message {
  id: string;
  agent: string;
  message: string;
  timestamp: Date;
}

interface DetailedResultsScreenProps {
  topic: string;
  messages: Message[];
  duration: string;
  costInfo?: {
    totalCostJPY: number;
    model: string;
  };
  onNewDiscussion: () => void;
  onHome: () => void;
}

interface AgentSummary {
  agent: string;
  avatar: string;
  color: string;
  keyPoints: string[];
  messageCount: number;
  totalWords: number;
}

const agentAvatars: Record<string, string> = {
  'CEO AI': '👑',
  'CFO AI': '💰',
  'CMO AI': '📈',
  'CTO AI': '⚡',
  'COO AI': '⚙️',
  '悪魔の代弁者': '😈',
  '議論総括': '📋'
};

const agentColors: Record<string, string> = {
  'CEO AI': 'from-purple-600 to-purple-700',
  'CFO AI': 'from-green-600 to-green-700',
  'CMO AI': 'from-blue-600 to-blue-700',
  'CTO AI': 'from-orange-600 to-orange-700',
  'COO AI': 'from-red-600 to-red-700',
  '悪魔の代弁者': 'from-gray-600 to-gray-700',
  '議論総括': 'from-indigo-600 to-indigo-700'
};

export default function DetailedResultsScreen({
  topic,
  messages,
  duration,
  costInfo,
  onNewDiscussion,
  onHome
}: DetailedResultsScreenProps) {
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // エージェント別サマリーを生成
  const generateAgentSummary = (): AgentSummary[] => {
    const agentMap = new Map<string, {
      messages: Message[];
      keyPoints: string[];
    }>();

    // メッセージをエージェント別に分類
    messages.forEach(msg => {
      if (msg.agent !== '議論総括') {
        if (!agentMap.has(msg.agent)) {
          agentMap.set(msg.agent, { messages: [], keyPoints: [] });
        }
        agentMap.get(msg.agent)!.messages.push(msg);
      }
    });

    // 各エージェントの要点を抽出
    const summaries: AgentSummary[] = [];
    agentMap.forEach((data, agent) => {
      const keyPoints: string[] = [];
      let totalWords = 0;

      data.messages.forEach(msg => {
        totalWords += msg.message.length;
        
        // 重要な文を抽出
        const sentences = msg.message.split(/[。！？]/).filter(s => s.trim().length > 15);
        sentences.forEach(sentence => {
          const trimmed = sentence.trim();
          if (
            trimmed.includes('重要') ||
            trimmed.includes('必要') ||
            trimmed.includes('提案') ||
            trimmed.includes('推奨') ||
            trimmed.includes('リスク') ||
            trimmed.includes('機会') ||
            trimmed.includes('%') ||
            trimmed.includes('円') ||
            trimmed.includes('$') ||
            trimmed.includes('億')
          ) {
            keyPoints.push(trimmed);
          }
        });
      });

      summaries.push({
        agent,
        avatar: agentAvatars[agent] || '🤖',
        color: agentColors[agent] || 'from-gray-600 to-gray-700',
        keyPoints: Array.from(new Set(keyPoints)).slice(0, 3),
        messageCount: data.messages.length,
        totalWords: Math.round(totalWords / data.messages.length)
      });
    });

    return summaries;
  };

  const agentSummaries = generateAgentSummary();
  const filteredMessages = selectedAgent 
    ? messages.filter(msg => msg.agent === selectedAgent)
    : messages;

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(timestamp);
  };

  const truncateMessage = (message: string, maxLength: number = 150) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center text-white">
            <DocumentTextIcon className="w-8 h-8 mr-3 text-white" />
            議論詳細レポート
          </h1>
          <p className="text-slate-300 mb-4">{topic}</p>
          
          {/* 基本情報 */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center bg-slate-800 rounded-lg px-3 py-2">
              <ClockIcon className="w-4 h-4 mr-2" />
              実行時間: {duration}
            </div>
            <div className="flex items-center bg-slate-800 rounded-lg px-3 py-2">
              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
              発言数: {messages.length}件
            </div>
            <div className="flex items-center bg-slate-800 rounded-lg px-3 py-2">
              <UserGroupIcon className="w-4 h-4 mr-2" />
              参加者: {agentSummaries.length}名
            </div>
            {false && costInfo && (
              <div className="flex items-center bg-slate-800 rounded-lg px-3 py-2">
                <span className="text-green-400">💰</span>
                <span className="ml-2">コスト: ¥{costInfo.totalCostJPY.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* エージェント別サマリー */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <UserGroupIcon className="w-6 h-6 mr-2" />
            参加者サマリー
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {agentSummaries.map((summary) => (
              <div
                key={summary.agent}
                className={`p-4 rounded-lg bg-gradient-to-r ${summary.color} cursor-pointer transition-all hover:scale-105 ${
                  selectedAgent === summary.agent ? 'ring-2 ring-white' : ''
                }`}
                onClick={() => setSelectedAgent(selectedAgent === summary.agent ? null : summary.agent)}
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{summary.avatar}</span>
                  <span className="font-semibold text-sm text-white">{summary.agent}</span>
                </div>
                <div className="text-xs space-y-1 text-white">
                  <div>発言: {summary.messageCount}回</div>
                  <div>平均文字数: {summary.totalWords}</div>
                </div>
                {summary.keyPoints.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-medium mb-1 text-white">主要論点:</div>
                    {summary.keyPoints.slice(0, 2).map((point, idx) => (
                      <div key={idx} className="text-xs opacity-90 line-clamp-2 text-white">
                        • {point.substring(0, 60)}...
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedAgent && (
            <div className="mb-4 p-3 bg-blue-900/30 rounded-lg">
              <p className="text-sm text-blue-300">
                {selectedAgent}の発言のみを表示中 
                <button 
                  onClick={() => setSelectedAgent(null)}
                  className="ml-2 text-blue-400 hover:text-blue-300 underline"
                >
                  すべて表示
                </button>
              </p>
            </div>
          )}
        </Card>

        {/* 詳細な議事録 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2" />
            詳細議事録
            <span className="ml-2 text-sm text-slate-400">
              ({filteredMessages.length}件の発言)
            </span>
          </h2>
          
          <div className="space-y-4">
            <AnimatePresence>
              {filteredMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-slate-700 rounded-lg overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 bg-slate-800/50">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {agentAvatars[message.agent] || '🤖'}
                      </span>
                      <div>
                        <div className="font-semibold">{message.agent}</div>
                        <div className="text-xs text-slate-400">
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedMessage(
                        expandedMessage === message.id ? null : message.id
                      )}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      {expandedMessage === message.id ? (
                        <ChevronUpIcon className="w-5 h-5" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  
                  <div className="p-4 bg-white">
                    <div className="prose prose-slate max-w-none text-gray-900">
                      {expandedMessage === message.id ? (
                        <div className="whitespace-pre-wrap text-gray-900">{message.message}</div>
                      ) : (
                        <div className="text-gray-900">
                          {truncateMessage(message.message)}
                          {message.message.length > 150 && (
                            <button
                              onClick={() => setExpandedMessage(message.id)}
                              className="ml-2 text-blue-600 hover:text-blue-700 text-sm"
                            >
                              続きを読む
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => {
              // 概要版テキストを生成してコピー
              const storage = new DiscussionStorageManager();
              const savedDiscussion = {
                id: `temp-${Date.now()}`,
                topic,
                agents: [...new Set(messages.map(m => m.agent))].filter(a => a !== '議論総括'),
                thinkingMode: 'normal',
                messages: messages.map(msg => ({
                  id: msg.id,
                  agent: msg.agent,
                  message: msg.message,
                  timestamp: msg.timestamp
                })),
                startTime: messages[0]?.timestamp || new Date(),
                endTime: messages[messages.length - 1]?.timestamp || new Date(),
                duration: parseInt(duration.replace('分', '')) || 0,
                costInfo: {
                  totalCostJPY: costInfo?.totalCostJPY || 0,
                  model: costInfo?.model || 'gpt-4o',
                  totalTokens: Math.round((costInfo?.totalCostJPY || 0) / 0.0025)
                }
              };
              
              const summaryText = storage.generateSummaryText(savedDiscussion);
              navigator.clipboard.writeText(summaryText);
            }}
            className="flex-1 flex items-center justify-center"
          >
            <ShareIcon className="w-5 h-5 mr-2" />
            概要をコピー
          </Button>
          
          <Button
            onClick={() => {
              // 詳細版テキストを生成してコピー
              const storage = new DiscussionStorageManager();
              const savedDiscussion = {
                id: `temp-${Date.now()}`,
                topic,
                agents: [...new Set(messages.map(m => m.agent))].filter(a => a !== '議論総括'),
                thinkingMode: 'normal',
                messages: messages.map(msg => ({
                  id: msg.id,
                  agent: msg.agent,
                  message: msg.message,
                  timestamp: msg.timestamp
                })),
                startTime: messages[0]?.timestamp || new Date(),
                endTime: messages[messages.length - 1]?.timestamp || new Date(),
                duration: parseInt(duration.replace('分', '')) || 0,
                costInfo: {
                  totalCostJPY: costInfo?.totalCostJPY || 0,
                  model: costInfo?.model || 'gpt-4o',
                  totalTokens: Math.round((costInfo?.totalCostJPY || 0) / 0.0025)
                }
              };
              
              const detailedText = storage.generateDetailedText(savedDiscussion);
              navigator.clipboard.writeText(detailedText);
            }}
            variant="outline"
            className="flex-1 flex items-center justify-center"
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            詳細レポートをコピー
          </Button>
          
          <Button
            onClick={onNewDiscussion}
            variant="outline"
            className="flex-1"
          >
            新しいディスカッション
          </Button>
          
          <Button
            onClick={onHome}
            variant="outline" 
            className="flex-1"
          >
            ホームへ戻る
          </Button>
        </div>
      </motion.div>
    </div>
  );
}