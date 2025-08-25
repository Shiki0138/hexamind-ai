'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Lightbulb, MessageSquare, Zap, TrendingUp, Target } from 'lucide-react';

interface KeyPoint {
  id: string;
  text: string;
  agentName: string;
  type: 'insight' | 'question' | 'decision' | 'concern' | 'opportunity';
  timestamp: number;
}

interface DiscussionVisualizerProps {
  isActive: boolean;
  currentSpeaker?: string;
  messages: Array<{
    agent: string;
    message: string;
    timestamp: Date;
  }>;
}

export default function DiscussionVisualizer({ 
  isActive, 
  currentSpeaker,
  messages 
}: DiscussionVisualizerProps) {
  const [keyPoints, setKeyPoints] = useState<KeyPoint[]>([]);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  // キーワードから要点タイプを判定
  const extractKeyPointType = (message: string): 'insight' | 'question' | 'decision' | 'concern' | 'opportunity' => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('リスク') || lowerMessage.includes('懸念') || lowerMessage.includes('注意')) {
      return 'concern';
    }
    if (lowerMessage.includes('チャンス') || lowerMessage.includes('機会') || lowerMessage.includes('可能性')) {
      return 'opportunity';
    }
    if (lowerMessage.includes('決定') || lowerMessage.includes('実行') || lowerMessage.includes('承認')) {
      return 'decision';
    }
    if (lowerMessage.includes('？') || lowerMessage.includes('どう') || lowerMessage.includes('なぜ')) {
      return 'question';
    }
    return 'insight';
  };

  // メッセージから要点を抽出
  const extractKeyPoints = (message: string, agentName: string): string[] => {
    const sentences = message.split(/[。！？]/);
    return sentences
      .filter(s => s.trim().length > 10 && s.trim().length < 50)
      .slice(0, 2); // 最大2つの要点
  };

  // 新しいメッセージから要点を追加
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      const points = extractKeyPoints(latestMessage.message, latestMessage.agent);
      
      points.forEach((point, index) => {
        setTimeout(() => {
          const newPoint: KeyPoint = {
            id: `${Date.now()}-${index}`,
            text: point.trim(),
            agentName: latestMessage.agent,
            type: extractKeyPointType(latestMessage.message),
            timestamp: Date.now()
          };
          
          setKeyPoints(prev => {
            const updated = [...prev, newPoint];
            // 最大10個まで保持
            return updated.slice(-10);
          });
        }, index * 500);
      });

      // パルスエフェクト
      setPulseIntensity(1);
      setTimeout(() => setPulseIntensity(0), 1000);
    }
  }, [messages]);

  // 古い要点を削除
  useEffect(() => {
    const timer = setInterval(() => {
      setKeyPoints(prev => 
        prev.filter(point => Date.now() - point.timestamp < 15000) // 15秒保持
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getIconForType = (type: KeyPoint['type']) => {
    switch (type) {
      case 'insight': return <Lightbulb className="w-4 h-4" />;
      case 'question': return <MessageSquare className="w-4 h-4" />;
      case 'decision': return <Target className="w-4 h-4" />;
      case 'concern': return <Zap className="w-4 h-4" />;
      case 'opportunity': return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getColorForType = (type: KeyPoint['type']) => {
    switch (type) {
      case 'insight': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'question': return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      case 'decision': return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'concern': return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'opportunity': return 'bg-purple-500/20 border-purple-500/50 text-purple-300';
    }
  };

  if (!isActive) return null;

  return (
    <div className="relative h-48 mb-6 overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700">
      {/* 背景アニメーション */}
      <div className="absolute inset-0">
        {/* パルスエフェクト */}
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-purple-500/20 to-transparent"
          animate={{
            opacity: pulseIntensity,
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 1 }}
        />

        {/* 動的な線のアニメーション */}
        <svg className="absolute inset-0 w-full h-full">
          {keyPoints.map((point, index) => (
            <motion.line
              key={`line-${point.id}`}
              x1={`${(index * 10) % 100}%`}
              y1="50%"
              x2={`${((index + 1) * 15) % 100}%`}
              y2="50%"
              stroke="rgba(168, 85, 247, 0.3)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
            />
          ))}
        </svg>
      </div>

      {/* 中央のAIブレインアイコン */}
      <motion.div
        className="absolute top-4 left-1/2 transform -translate-x-1/2"
        animate={{
          rotate: isActive ? 360 : 0,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Brain className="w-8 h-8 text-purple-400 opacity-50" />
      </motion.div>

      {/* 現在の発言者 */}
      {currentSpeaker && (
        <motion.div
          className="absolute top-4 right-4 bg-purple-600/30 px-3 py-1 rounded-full"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <span className="text-xs text-purple-200">{currentSpeaker} が発言中...</span>
        </motion.div>
      )}

      {/* 要点の表示 */}
      <div className="relative h-full p-4 flex flex-wrap gap-2 items-center justify-center">
        <AnimatePresence>
          {keyPoints.map((point, index) => (
            <motion.div
              key={point.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getColorForType(point.type)} backdrop-blur-sm`}
              initial={{ 
                opacity: 0, 
                scale: 0.5,
                x: Math.random() * 100 - 50,
                y: Math.random() * 50 - 25
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: 0,
                y: 0
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.8,
                y: -20
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              style={{
                zIndex: keyPoints.length - index
              }}
            >
              {getIconForType(point.type)}
              <span className="text-xs font-medium max-w-[200px] truncate">
                {point.text}
              </span>
              <span className="text-xs opacity-60">
                - {point.agentName}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ステータスインジケーター */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
        <motion.div
          className="w-2 h-2 bg-green-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
        <span className="text-xs text-gray-400">議論進行中</span>
      </div>
    </div>
  );
}