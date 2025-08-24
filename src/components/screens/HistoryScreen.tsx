'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowLeftIcon, TrashIcon, DocumentArrowDownIcon, ClockIcon } from '@heroicons/react/24/outline';
import { chatHistory, DiscussionSession } from '@/lib/chat-history';

interface HistoryScreenProps {
  onBack: () => void;
  onViewSession: (sessionId: string) => void;
}

export default function HistoryScreen({ onBack, onViewSession }: HistoryScreenProps) {
  const [sessions, setSessions] = useState<DiscussionSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const allSessions = chatHistory.getSessions();
    setSessions(allSessions);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('この会話履歴を削除しますか？')) {
      chatHistory.deleteSession(sessionId);
      loadSessions();
    }
  };

  const handleExport = () => {
    const data = chatHistory.exportSessions();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hexamind_history_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (confirm('すべての会話履歴を削除しますか？この操作は取り消せません。')) {
      chatHistory.clearAllSessions();
      loadSessions();
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = (start: Date, end?: Date) => {
    if (!end) return '進行中';
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分`;
  };

  const getAgentEmoji = (agentId: string) => {
    const emojiMap: Record<string, string> = {
      ceo: '🎯',
      cfo: '💰',
      cmo: '📊',
      cto: '💻',
      coo: '⚙️',
      devil: '😈'
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
      <div className="mx-auto max-w-2xl space-y-6">
        {/* ヘッダー */}
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            >
              戻る
            </Button>
            <h1 className="text-xl font-bold text-gray-900">
              会話履歴
            </h1>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
            >
              エクスポート
            </Button>
            {sessions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-red-600 hover:bg-red-50"
                leftIcon={<TrashIcon className="h-4 w-4" />}
              >
                すべて削除
              </Button>
            )}
          </div>
        </header>

        {/* 履歴リスト */}
        {sessions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">会話履歴がありません</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onViewSession(session.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {session.topic}
                    </h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{formatDate(session.startedAt)}</span>
                      </div>
                      <span>·</span>
                      <span>{formatDuration(session.startedAt, session.endedAt)}</span>
                      <span>·</span>
                      <span>{session.messages.length} メッセージ</span>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      {session.agents.map((agentId) => (
                        <span key={agentId} className="text-lg">
                          {getAgentEmoji(agentId)}
                        </span>
                      ))}
                      {session.isPremium && (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          Premium
                        </span>
                      )}
                    </div>
                    {session.summary && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {session.summary}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="ml-4 text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}