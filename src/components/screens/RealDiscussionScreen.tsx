'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AIDiscussionEngine, AI_AGENTS, ThinkingMode } from '@/lib/ai-agents';
import { analyzeQuestionClarity, createDiscussionPromptWithContext, ClarificationContext } from '@/lib/question-clarification';
import QuestionClarificationDialog from '@/components/QuestionClarificationDialog';
import DiscussionVisualizer from '@/components/DiscussionVisualizer';
import { ChatHistoryManager } from '../../lib/chat-history';
import CostIndicator from '@/components/CostIndicator';
import { calculateDiscussionCost } from '@/lib/cost-calculator';
import DetailedResultsScreen from './DetailedResultsScreen';
import { DiscussionStorageManager } from '@/lib/discussion-storage';

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
  onComplete: (sessionId?: string) => void;
  onHome?: () => void;
  onNewDiscussion?: () => void;
}

export default function RealDiscussionScreen({
  topic,
  agents,
  thinkingMode = 'normal',
  onComplete,
  onHome,
  onNewDiscussion
}: RealDiscussionScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showClarification, setShowClarification] = useState(false);
  const [clarificationQuestion, setClarificationQuestion] = useState('');
  const [suggestedAspects, setSuggestedAspects] = useState<string[]>([]);
  const [clarificationContext, setClarificationContext] = useState<ClarificationContext | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [discussionSummary, setDiscussionSummary] = useState<{
    summary: string;
    decisions: string[];
    actionItems: string[];
    agentSummaries: { agent: string; keyPoints: string[] }[];
  } | null>(null);
  const [lastExecutionTime, setLastExecutionTime] = useState<number>(0);
  const [isThrottled, setIsThrottled] = useState(false);
  const [throttleMessage, setThrottleMessage] = useState('');
  const [currentCostJPY, setCurrentCostJPY] = useState(0);
  const [maxBudgetJPY, setMaxBudgetJPY] = useState(100); // デフォルト100円
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [discussionDuration, setDiscussionDuration] = useState<string>('0分');

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

  // 各エージェントのメッセージから要点を抽出
  const extractAgentKeyPoints = (messages: Message[]): { agent: string; keyPoints: string[] }[] => {
    const agentMessages = new Map<string, string[]>();
    
    // エージェントごとにメッセージをグループ化（議論総括は除外）
    messages.forEach(msg => {
      if (msg.agent !== '議論総括') {
        if (!agentMessages.has(msg.agent)) {
          agentMessages.set(msg.agent, []);
        }
        agentMessages.get(msg.agent)!.push(msg.message);
      }
    });

    // 各エージェントの要点を抽出
    const summaries: { agent: string; keyPoints: string[] }[] = [];
    
    agentMessages.forEach((messages, agent) => {
      const keyPoints: string[] = [];
      
      messages.forEach(message => {
        // 重要な文を抽出（句読点で区切って、重要なキーワードを含む文を選択）
        const sentences = message.split(/[。！？]/).filter(s => s.trim().length > 20);
        
        sentences.forEach(sentence => {
          const trimmed = sentence.trim();
          // 重要なキーワードを含む文を要点として抽出
          if (
            trimmed.includes('必要') ||
            trimmed.includes('重要') ||
            trimmed.includes('リスク') ||
            trimmed.includes('提案') ||
            trimmed.includes('べき') ||
            trimmed.includes('推奨') ||
            trimmed.includes('懸念') ||
            trimmed.includes('機会') ||
            trimmed.includes('効果') ||
            trimmed.includes('戦略') ||
            trimmed.length < 100 // 短くて要点がまとまっている文
          ) {
            keyPoints.push(trimmed);
          }
        });
      });

      // 重複を除いて最大3つの要点に絞る
      const uniqueKeyPoints = Array.from(new Set(keyPoints)).slice(0, 3);
      
      if (uniqueKeyPoints.length > 0) {
        summaries.push({ agent, keyPoints: uniqueKeyPoints });
      }
    });

    return summaries;
  };

  // 議論総括メッセージから要約情報を抽出
  const extractDiscussionSummary = (summaryText: string, allMessages: Message[]) => {
    const sections = summaryText.split(/\n\n/);
    let summary = '';
    let decisions: string[] = [];
    let actionItems: string[] = [];

    sections.forEach(section => {
      if (section.includes('合意事項') || section.includes('決定事項')) {
        const items = section.split('\n').slice(1);
        decisions = items.filter(item => item.trim().startsWith('-') || item.trim().startsWith('・'))
          .map(item => item.replace(/^[-・]\s*/, '').trim());
      } else if (section.includes('アクション') || section.includes('実行項目')) {
        const items = section.split('\n').slice(1);
        actionItems = items.filter(item => item.trim().match(/^\d+\.|^[-・]/))
          .map(item => item.replace(/^\d+\.\s*|^[-・]\s*/, '').trim());
      } else if (section.includes('総括') || section.includes('まとめ')) {
        summary = section.split('\n').slice(1).join(' ').trim();
      }
    });

    // サマリーが空の場合は全体から抽出
    if (!summary) {
      summary = summaryText.split('\n')[0].trim();
    }

    // 各エージェントの要点を抽出
    const agentSummaries = extractAgentKeyPoints(allMessages);

    return { summary, decisions, actionItems, agentSummaries };
  };

  // 最初に質問の明確性を分析
  const analyzeAndStartDiscussion = async () => {
    // クライアント側スロットリング
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutionTime;
    const throttleTime = 30000; // 30秒のクールダウン
    
    if (timeSinceLastExecution < throttleTime) {
      const remainingTime = Math.ceil((throttleTime - timeSinceLastExecution) / 1000);
      setIsThrottled(true);
      setThrottleMessage(`次の議論まで${remainingTime}秒お待ちください`);
      setError(`次の議論まで${remainingTime}秒お待ちください`);
      setTimeout(() => {
        setIsThrottled(false);
        setThrottleMessage('');
        setError(null);
      }, throttleTime - timeSinceLastExecution);
      return;
    }
    
    setLastExecutionTime(now);
    setIsAnalyzing(true);
    setError(null);

    try {
      const analysisResult = await analyzeQuestionClarity(topic);
      
      if (analysisResult.needsClarification && analysisResult.clarificationQuestion) {
        // 確認が必要な場合
        setClarificationQuestion(analysisResult.clarificationQuestion);
        setSuggestedAspects(analysisResult.suggestedAspects || []);
        setShowClarification(true);
      } else {
        // 確認不要の場合は直接ディスカッション開始
        await startRealDiscussion();
      }
    } catch (error) {
      console.error('Question analysis error:', error);
      // 分析エラーの場合は直接ディスカッション開始
      await startRealDiscussion();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 確認質問への回答を受けてディスカッション開始
  const handleClarificationSubmit = async (response: string) => {
    const context: ClarificationContext = {
      originalQuestion: topic,
      clarificationQuestion: clarificationQuestion,
      userResponse: response
    };
    
    setClarificationContext(context);
    setShowClarification(false);
    
    // 拡張された質問でディスカッション開始
    await startRealDiscussion(context);
  };

  const startRealDiscussion = async (context?: ClarificationContext) => {
    setIsRunning(true);
    setError(null);
    setMessages([]);
    setProgress(0);
    setShowDetailedResults(false);
    const startTime = Date.now();

    try {
      const engine = new AIDiscussionEngine();
      
      // ChatHistoryManagerの初期化とエラーハンドリング
      let chatHistory: ChatHistoryManager | null = null;
      let newSessionId: string | null = null;
      
      try {
        chatHistory = new ChatHistoryManager();
        // コンテキストがある場合は拡張された質問を使用
        const discussionTopic = context 
          ? createDiscussionPromptWithContext(topic, context)
          : topic;
        
        // セッション開始
        newSessionId = chatHistory.startSession(discussionTopic, agents, thinkingMode, 'real');
        setSessionId(newSessionId);
      } catch (historyError) {
        console.error('ChatHistory initialization error:', historyError);
        // 履歴機能が使えなくても議論は続行
      }
      
      // コンテキストがある場合は拡張された質問を使用
      const discussionTopic = context 
        ? createDiscussionPromptWithContext(topic, context)
        : topic;
      
      const discussionGenerator = engine.startDiscussion(discussionTopic, agents, thinkingMode, context, maxBudgetJPY);
      
      let messageCount = 0;
      const expectedMessages = agents.length * 4; // 各エージェント約4回発言
      let allMessages: Message[] = [];
      let summaryMessage: Message | null = null;

      for await (const result of discussionGenerator) {
        // 現在の発言者を設定
        setCurrentSpeaker(result.agent);
        
        const newMessage: Message = {
          id: `msg-${result.agent}-${messages.length + 1}-${result.timestamp}`,
          agent: result.agent,
          message: result.message,
          timestamp: result.timestamp
        };
        
        // コスト情報の更新
        if (result.costInfo) {
          setCurrentCostJPY(result.costInfo.totalCostJPY);
        }

        allMessages.push(newMessage);
        setMessages(prev => [...prev, newMessage]);
        
        // チャット履歴に追加
        if (chatHistory) {
          try {
            chatHistory.addMessage({
              role: 'agent' as const,
              agentId: result.agent,
              content: result.message,
              timestamp: result.timestamp
            });
          } catch (error) {
            console.error('Failed to add message to history:', error);
          }
        }
        
        // 議論総括の場合は保存
        if (result.agent === '議論総括') {
          summaryMessage = newMessage;
        }
        
        messageCount++;
        setProgress((messageCount / expectedMessages) * 100);

        // UIの更新を少し待つ
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // 議論終了時に発言者をクリア
      setCurrentSpeaker(undefined);

      // 議論結果から要約を抽出
      if (summaryMessage) {
        const extractedSummary = extractDiscussionSummary(summaryMessage.message, allMessages);
        setDiscussionSummary(extractedSummary);
        
        // セッション終了と保存
        if (chatHistory && newSessionId) {
          try {
            chatHistory.endSession(
              newSessionId,
              extractedSummary.summary,
              extractedSummary.decisions,
              extractedSummary.actionItems
            );
          } catch (error) {
            console.error('Failed to end session:', error);
          }
        }
      }

      setProgress(100);
      
      // 議論時間を計算
      const duration = Math.round((Date.now() - startTime) / 1000 / 60);
      setDiscussionDuration(`${duration}分`);
      
      // 議論内容を永続化保存
      try {
        const storage = new DiscussionStorageManager();
        const savedDiscussion = {
          id: newSessionId || `discussion-${Date.now()}`,
          topic: context ? createDiscussionPromptWithContext(topic, context) : topic,
          agents: agents,
          thinkingMode: thinkingMode,
          messages: allMessages.map(msg => ({
            id: msg.id,
            agent: msg.agent,
            message: msg.message,
            timestamp: msg.timestamp
          })),
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: duration,
          costInfo: {
            totalCostJPY: currentCostJPY,
            model: 'gpt-4o',
            totalTokens: Math.round(currentCostJPY / 0.0025)
          },
          summary: discussionSummary ? {
            consensus: discussionSummary.summary,
            keyDecisions: discussionSummary.decisions,
            actionItems: discussionSummary.actionItems,
            risks: [],
            agentSummaries: discussionSummary.agentSummaries.map(summary => ({
              agent: summary.agent,
              keyPoints: summary.keyPoints,
              messageCount: allMessages.filter(m => m.agent === summary.agent).length,
              averageMessageLength: Math.round(
                allMessages.filter(m => m.agent === summary.agent)
                  .reduce((sum, m) => sum + m.message.length, 0) / 
                allMessages.filter(m => m.agent === summary.agent).length
              ),
              expertise: []
            }))
          } : undefined
        };
        
        storage.saveDiscussion(savedDiscussion);
        console.log(`[Storage] 議論を保存しました: ${savedDiscussion.id}`);
      } catch (storageError) {
        console.error('議論の保存に失敗しました:', storageError);
      }
      
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

  // 詳細結果画面を表示
  if (showDetailedResults && messages.length > 0) {
    return (
      <DetailedResultsScreen
        topic={topic}
        messages={messages}
        duration={discussionDuration}
        costInfo={{
          totalCostJPY: currentCostJPY,
          model: 'gpt-4o'
        }}
        onNewDiscussion={() => {
          if (onNewDiscussion) {
            onNewDiscussion();
          } else {
            setShowDetailedResults(false);
            setMessages([]);
            setProgress(0);
          }
        }}
        onHome={() => {
          if (onHome) {
            onHome();
          } else {
            setShowDetailedResults(false);
          }
        }}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
        <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">AIボード会議</h1>
          <p className="text-slate-300 mb-4">{topic}</p>
          
          {/* コストインジケーター */}
          {false && isRunning && (
            <div className="mb-4">
              <CostIndicator 
                currentCostJPY={currentCostJPY}
                budgetJPY={maxBudgetJPY}
                showDetails={true}
              />
            </div>
          )}
          
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
              onClick={analyzeAndStartDiscussion}
              disabled={isRunning || isAnalyzing || isThrottled}
              className={`flex-1 ${isThrottled ? 'bg-gray-600 cursor-not-allowed' : ''}`}
            >
              {isThrottled ? throttleMessage : isAnalyzing ? '質問を分析中...' : isRunning ? '実行中...' : 'リアルAI議論を開始'}
            </Button>
            <Button
              onClick={startMockDiscussion}
              disabled={isRunning || isAnalyzing}
              variant="outline"
              className="flex-1"
            >
              {isRunning ? '実行中...' : 'モック議論を開始'}
            </Button>
          </div>
        </div>

        {/* ディスカッションビジュアライザー */}
        <DiscussionVisualizer 
          isActive={isRunning}
          currentSpeaker={currentSpeaker}
          messages={messages}
        />

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

        {/* 議論結果サマリー */}
        {!isRunning && discussionSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-700/50">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                議論結果サマリー
              </h3>
              
              {/* 各エージェントの要点 */}
              {discussionSummary.agentSummaries.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-yellow-300 mb-3">各部門の主要な見解</h4>
                  <div className="space-y-3">
                    {discussionSummary.agentSummaries.map((agentSummary, index) => (
                      <div key={index} className="bg-slate-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{agentAvatars[agentSummary.agent] || '🤖'}</span>
                          <span className="font-semibold text-sm">{agentSummary.agent}</span>
                        </div>
                        <ul className="space-y-1 text-sm text-gray-300">
                          {agentSummary.keyPoints.map((point, pointIndex) => (
                            <li key={pointIndex} className="flex items-start gap-2">
                              <span className="text-gray-500 mt-0.5">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 総括 */}
              <div className="mb-6">
                <h4 className="font-semibold text-purple-300 mb-2">全体総括</h4>
                <p className="text-gray-300 leading-relaxed">{discussionSummary.summary}</p>
              </div>

              {/* 決定事項 */}
              {discussionSummary.decisions.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-green-300 mb-2">決定事項</h4>
                  <ul className="space-y-2">
                    {discussionSummary.decisions.map((decision, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">✓</span>
                        <span className="text-gray-300">{decision}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* アクションアイテム */}
              {discussionSummary.actionItems.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-300 mb-2">アクションアイテム</h4>
                  <ol className="space-y-2">
                    {discussionSummary.actionItems.map((action, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-gray-300">{action}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* 完了ボタン */}
        {!isRunning && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              onClick={() => setShowDetailedResults(true)} 
              className="flex-1 max-w-md"
            >
              📄 詳細な議事録を表示
            </Button>
            <Button 
              onClick={() => onComplete(sessionId || undefined)} 
              variant="outline"
              className="flex-1 max-w-md"
            >
              簡易結果を表示
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

    {/* 質問確認ダイアログ */}
    <QuestionClarificationDialog
      isOpen={showClarification}
      onClose={() => {
        setShowClarification(false);
        // スキップした場合は直接ディスカッション開始
        startRealDiscussion();
      }}
      originalQuestion={topic}
      clarificationQuestion={clarificationQuestion}
      suggestedAspects={suggestedAspects}
      onSubmit={handleClarificationSubmit}
    />
  </>
  );
}