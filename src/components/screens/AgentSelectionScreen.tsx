'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
  emoji: string;
  category: string;
}

const AGENTS: Agent[] = [
  {
    id: 'ceo',
    name: 'CEO（戦略責任者）',
    role: '全体戦略・経営判断',
    description: '長期ビジョンと戦略的思考で全体を統括',
    color: 'bg-blue-500',
    emoji: '🎯',
    category: '経営・戦略'
  },
  {
    id: 'cfo',
    name: 'CFO（財務責任者）',
    role: '財務分析・投資判断',
    description: 'ROIと財務リスクを数値で分析',
    color: 'bg-purple-500',
    emoji: '💰',
    category: '財務・投資'
  },
  {
    id: 'cmo',
    name: 'CMO（マーケティング責任者）',
    role: '市場分析・顧客戦略',
    description: '市場トレンドと顧客ニーズを分析',
    color: 'bg-pink-500',
    emoji: '📊',
    category: 'マーケティング'
  },
  {
    id: 'cto',
    name: 'CTO（技術責任者）',
    role: '技術戦略・イノベーション',
    description: '技術トレンドとシステム最適化',
    color: 'bg-cyan-500',
    emoji: '💻',
    category: '技術・システム'
  },
  {
    id: 'coo',
    name: 'COO（執行責任者）',
    role: '業務効率・組織運営',
    description: 'オペレーションとプロセス改善',
    color: 'bg-green-500',
    emoji: '⚙️',
    category: '運営・効率化'
  },
  {
    id: 'devil',
    name: '悪魔の代弁者',
    role: '批判的検証・リスク指摘',
    description: '反対意見と隠れたリスクを発見',
    color: 'bg-red-500',
    emoji: '😈',
    category: '特別アドバイザー'
  }
];

interface AgentSelectionScreenProps {
  onBack: () => void;
  onNext?: (selectedAgents: string[]) => void;
  onAgentsSelected?: (selectedAgents: string[]) => void;
}

export default function AgentSelectionScreen({ onBack, onNext, onAgentsSelected }: AgentSelectionScreenProps) {
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['ceo', 'cfo', 'devil']);

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => {
      if (prev.includes(agentId)) {
        return prev.filter(id => id !== agentId);
      } else {
        return [...prev, agentId];
      }
    });
  };

  const groupedAgents = AGENTS.reduce((acc, agent) => {
    if (!acc[agent.category]) {
      acc[agent.category] = [];
    }
    acc[agent.category].push(agent);
    return acc;
  }, {} as Record<string, Agent[]>);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-8"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto max-w-md space-y-6">
        {/* ヘッダー */}
        <header className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
          >
            戻る
          </Button>
          <h1 className="flex-1 text-xl font-bold text-gray-900">
            相談メンバーを選ぶ
          </h1>
        </header>

        <p className="text-gray-600 text-sm">
          誰に相談しますか？（複数選択可）
        </p>

        {/* エージェント選択 */}
        <div className="space-y-6">
          {Object.entries(groupedAgents).map(([category, agents]) => (
            <div key={category}>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                {category}
              </h3>
              <div className="space-y-2">
                {agents.map((agent) => {
                  const isSelected = selectedAgents.includes(agent.id);
                  return (
                    <Card
                      key={agent.id}
                      className={`p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleAgent(agent.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full ${agent.color} mt-1`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{agent.emoji}</span>
                            <h4 className="font-medium text-gray-900">
                              {agent.name}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {agent.description}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 次へボタン */}
        <div className="pt-4">
          <Button
            className="w-full"
            disabled={selectedAgents.length === 0}
            onClick={() => {
              console.log('Button clicked with agents:', selectedAgents);
              console.log('onNext:', onNext);
              console.log('onAgentsSelected:', onAgentsSelected);
              const handler = onNext || onAgentsSelected;
              if (handler) {
                handler(selectedAgents);
              } else {
                console.error('No handler found for next button');
              }
            }}
            rightIcon={<ArrowRightIcon className="h-4 w-4" />}
          >
            次へ（{selectedAgents.length}名選択中）
          </Button>
        </div>
      </div>
    </motion.div>
  );
}