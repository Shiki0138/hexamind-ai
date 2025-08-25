'use client'

import React, { useState } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';

interface QuestionClarificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  originalQuestion: string;
  clarificationQuestion: string;
  suggestedAspects?: string[];
  onSubmit: (response: string) => void;
}

export default function QuestionClarificationDialog({
  isOpen,
  onClose,
  originalQuestion,
  clarificationQuestion,
  suggestedAspects,
  onSubmit
}: QuestionClarificationDialogProps) {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(response);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">CEOからの確認</h2>
              <p className="text-sm text-gray-400">より良い議論のために詳細をお聞かせください</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-200px)]">
          {/* 元の質問 */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">あなたの質問:</p>
            <p className="text-white">{originalQuestion}</p>
          </div>

          {/* CEOからの確認質問 */}
          <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">CEO</span>
              </div>
              <div className="flex-1">
                <p className="text-white mb-3">{clarificationQuestion}</p>
                
                {/* 提案された確認観点 */}
                {suggestedAspects && suggestedAspects.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-400">考慮いただきたい点:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {suggestedAspects.map((aspect, index) => (
                        <li key={index} className="text-sm text-gray-300">
                          {aspect}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 回答フォーム */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                詳細情報をご記入ください
              </label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 
                  focus:outline-none focus:ring-2 focus:ring-purple-500 
                  placeholder-gray-400 resize-none"
                rows={5}
                placeholder="背景情報、具体的な目標、制約条件など..."
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            {/* アクションボタン */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-gray-300 hover:text-white 
                  transition-colors"
                disabled={isSubmitting}
              >
                スキップ
              </button>
              <button
                type="submit"
                disabled={!response.trim() || isSubmitting}
                className="px-5 py-2 bg-purple-600 text-white rounded-lg 
                  hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed 
                  transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? '送信中...' : '回答を送信'}</span>
              </button>
            </div>
          </form>

          {/* ヒント */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
            <p className="text-sm text-blue-300">
              💡 ヒント: より具体的な情報を提供いただくことで、6人のAIエージェントがより実践的で価値のある議論を展開できます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}