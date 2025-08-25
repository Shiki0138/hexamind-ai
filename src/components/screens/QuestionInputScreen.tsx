'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowLeftIcon, MicrophoneIcon, PlayIcon } from '@heroicons/react/24/outline';

type DiscussionMode = 'speed' | 'balanced' | 'thorough';
type ThinkingMode = 'normal' | 'deepthink' | 'creative' | 'critical';

const DISCUSSION_MODES = {
  speed: {
    title: '🚀 スピード重視（5分）',
    description: '要点を素早く整理',
    duration: '約5分',
    suitable: 'すぐに判断したい時'
  },
  balanced: {
    title: '⚖️ バランス型（15分）',
    description: '適度な深さで議論',
    duration: '約15分',
    suitable: '一般的な相談に最適'
  },
  thorough: {
    title: '🔍 徹底討論（60分）',
    description: 'あらゆる角度から検証',
    duration: '約60分',
    suitable: '重要な戦略決定時'
  }
};

const THINKING_MODES = {
  normal: {
    title: '💼 通常モード',
    description: '標準的な議論スタイル',
    icon: '💼',
    approach: 'バランスの取れた意見交換'
  },
  deepthink: {
    title: '🧠 Deep Think',
    description: '深層的な分析と洞察',
    icon: '🧠',
    approach: '根本原因から徹底的に分析'
  },
  creative: {
    title: '💡 クリエイティブ',
    description: '革新的なアイデア重視',
    icon: '💡',
    approach: '従来の枠を超えた発想'
  },
  critical: {
    title: '⚔️ 批判的検討',
    description: 'リスクと問題を徹底追及',
    icon: '⚔️',
    approach: 'あらゆる問題点を洗い出し'
  }
};

const SAMPLE_QUESTIONS = [
  '新規事業に3億円投資すべきか？',
  '競合A社の新製品にどう対応すべきか？',
  'このM&A案件は実行すべきか？',
  'コスト削減の優先順位をつけたい',
  '海外展開の可能性を検討したい'
];

interface QuestionInputScreenProps {
  selectedAgents: string[];
  onBack: () => void;
  onStartDiscussion: (question: string, mode: DiscussionMode, thinkingMode: ThinkingMode, realAI?: boolean, premium?: boolean, context?: string) => void;
}

export default function QuestionInputScreen({ 
  selectedAgents, 
  onBack, 
  onStartDiscussion 
}: QuestionInputScreenProps) {
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState<DiscussionMode>('balanced');
  const [thinkingMode, setThinkingMode] = useState<ThinkingMode>('normal');
  const [context, setContext] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (premium = false) => {
    if (question.trim()) {
      // premiumがtrueの場合はrealAIもtrueにする
      const useRealAI = premium || true; // 常にreal AIを使用
      onStartDiscussion(question.trim(), mode, thinkingMode, useRealAI, premium, context.trim() || undefined);
    }
  };

  const handleSampleQuestion = (sampleQuestion: string) => {
    setQuestion(sampleQuestion);
  };

  const handleVoiceInput = () => {
    // 音声入力の実装（今回はデモ用にアラート）
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setQuestion('新しいAI技術への投資について相談したいのですが、ROIが見込めるでしょうか？');
    }, 2000);
  };

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
            質問を入力
          </h1>
        </header>

        {/* 選択されたエージェント表示 */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            選択されたメンバー（{selectedAgents.length}名）
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedAgents.map((agentId) => (
              <span
                key={agentId}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md"
              >
                {agentId.toUpperCase()}
              </span>
            ))}
          </div>
        </Card>

        {/* 質問入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            何について相談しますか？
          </label>
          <div className="relative">
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="例：新規事業に3億円投資すべきか"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute bottom-2 right-2"
              onClick={handleVoiceInput}
              loading={isListening}
              leftIcon={<MicrophoneIcon className="h-4 w-4" />}
            >
              {isListening ? '聞き取り中...' : '音声入力'}
            </Button>
          </div>
        </div>

        {/* よくある質問 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            よくある質問
          </h3>
          <div className="space-y-2">
            {SAMPLE_QUESTIONS.map((sampleQuestion, index) => (
              <button
                key={index}
                className="w-full text-left p-3 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => handleSampleQuestion(sampleQuestion)}
              >
                • {sampleQuestion}
              </button>
            ))}
          </div>
        </div>

        {/* 検討モード選択 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            検討アプローチ
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(Object.entries(THINKING_MODES) as [ThinkingMode, typeof THINKING_MODES[ThinkingMode]][]).map(([key, modeConfig]) => (
              <motion.div
                key={key}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`p-3 cursor-pointer transition-all ${
                    thinkingMode === key 
                      ? 'ring-2 ring-purple-500 bg-purple-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setThinkingMode(key)}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{modeConfig.icon}</div>
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      {modeConfig.title}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {modeConfig.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-purple-600 mb-6 text-center bg-purple-50 p-2 rounded">
            📝 {THINKING_MODES[thinkingMode].approach}
          </p>
        </div>

        {/* 議論の深さ選択 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            議論の深さ
          </h3>
          <div className="space-y-2">
            {Object.entries(DISCUSSION_MODES).map(([modeKey, modeInfo]) => (
              <Card
                key={modeKey}
                className={`p-3 cursor-pointer transition-all ${
                  mode === modeKey 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setMode(modeKey as DiscussionMode)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {modeInfo.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {modeInfo.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {modeInfo.suitable}
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    mode === modeKey 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {mode === modeKey && (
                      <div className="w-full h-full bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 追加コンテキスト */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            背景情報（任意）
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="会社の状況や前提条件があれば入力してください"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>

        {/* 開始ボタン */}
        <div className="space-y-3">
          <Button
            className="w-full h-12 text-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
            disabled={!question.trim()}
            onClick={() => handleSubmit(true)} // Premium mode
            leftIcon={<span className="text-xl">🏆</span>}
          >
            プレミアム議論を開始
          </Button>
          <div className="text-xs text-center text-gold-600 mb-2">
            Claude Pro + ChatGPT Plus + Gemini Ultra で最高品質の分析
          </div>
          
          <Button
            className="w-full h-12 text-lg"
            disabled={!question.trim()}
            onClick={() => handleSubmit(false)} // Regular mode
            leftIcon={<PlayIcon className="h-5 w-5" />}
          >
            通常議論を開始
          </Button>
        </div>
      </div>
    </motion.div>
  );
}