'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  ClockIcon,
  ChartBarIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { getStoredDiscussion, getAllStoredDiscussions, deleteStoredDiscussion } from '@/lib/storage';
import Link from 'next/link';

interface DiscussionHistoryScreenProps {
  onBack: () => void;
  onLoadDiscussion?: (id: string) => void;
}

export default function DiscussionHistoryScreen({ onBack, onLoadDiscussion }: DiscussionHistoryScreenProps) {
  const [discussions, setDiscussions] = useState<Array<{
    id: string;
    topic: string;
    timestamp: string;
    messageCount: number;
    agents: string[];
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiscussions();
  }, []);

  const loadDiscussions = () => {
    setLoading(true);
    const allDiscussions = getAllStoredDiscussions();
    
    const discussionList = allDiscussions.map(id => {
      const data = getStoredDiscussion(id);
      if (!data) return null;
      
      return {
        id,
        topic: data.topic || '無題の議論',
        timestamp: data.timestamp,
        messageCount: data.messages?.length || 0,
        agents: data.selectedAgents || []
      };
    }).filter(Boolean);

    setDiscussions(discussionList as any);
    setLoading(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('この議論を削除してもよろしいですか？')) {
      deleteStoredDiscussion(id);
      loadDiscussions();
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAgentEmoji = (agentId: string) => {
    const emojiMap: { [key: string]: string } = {
      'ceo': '🎯',
      'cfo': '💰',
      'cmo': '📊',
      'cto': '💻',
      'coo': '⚙️',
      'devil': '😈',
      'researcher': '🔍'
    };
    return emojiMap[agentId] || '👤';
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-8"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
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
            保存された議論
          </h1>
        </header>

        {/* Discussion List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        ) : discussions.length === 0 ? (
          <Card className="p-8 text-center">
            <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">保存された議論がありません</p>
            <Button onClick={onBack}>
              新しい議論を始める
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Card
                key={discussion.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onLoadDiscussion?.(discussion.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {discussion.topic}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {formatDate(discussion.timestamp)}
                      </div>
                      <div className="flex items-center">
                        <ChartBarIcon className="w-4 h-4 mr-1" />
                        {discussion.messageCount}件の発言
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {discussion.agents.map((agentId) => (
                        <span key={agentId} className="text-lg">
                          {getAgentEmoji(agentId)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoadDiscussion?.(discussion.id);
                      }}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(discussion.id, e)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}