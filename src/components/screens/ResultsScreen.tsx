import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ChevronDownIcon, ShareIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { ChatHistoryManager } from '../../lib/chat-history'

interface ResultsScreenProps {
  sessionId?: string | null
  onNewDiscussion: () => void
  onHome: () => void
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  sessionId,
  onNewDiscussion,
  onHome
}) => {
  const [discussionSummary, setDiscussionSummary] = useState({
    topic: "",
    duration: "",
    participants: [] as string[],
    keyPoints: [] as string[],
    actionItems: [] as string[],
    consensus: ""
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSessionData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        if (sessionId) {
          const chatHistory = new ChatHistoryManager()
          const sessions = chatHistory.getSessions()
          const currentSession = sessions.find(s => s.id === sessionId)
          
          if (currentSession) {
            const duration = currentSession.endedAt 
              ? Math.round((new Date(currentSession.endedAt).getTime() - new Date(currentSession.startedAt).getTime()) / 1000 / 60)
              : 0
            
            // 議論の質を確認
            if (!currentSession.summary || currentSession.summary === "議論の要約を生成中...") {
              setError("議論結果の生成が完了していません。しばらくお待ちください。")
            } else {
              setDiscussionSummary({
                topic: currentSession.topic,
                duration: `${duration}分`,
                participants: currentSession.agents,
                keyPoints: currentSession.decisions || [],
                actionItems: currentSession.actionItems || [],
                consensus: currentSession.summary
              })
            }
          } else {
            setError("セッションが見つかりませんでした。")
          }
        } else {
          // セッションIDがない場合は高品質なモックデータを使用
          setDiscussionSummary({
            topic: "ニューヨーク市場へのシャンプー製品展開戦略",
            duration: "18分",
            participants: ["CEO AI", "CFO AI", "CMO AI", "CTO AI", "COO AI", "悪魔の代弁者"],
            keyPoints: [
              "TAM分析：ニューヨークのシャンプー市場は$520M（Statista 2024）、プレミアムセグメントは$156M",
              "ROI予測：DCF分析によるNPVは$2.3M（WACC 12%、IRR 24.5%）",
              "競合分析：P&G (35%)、Unilever (22%)、L'Oréal (18%)とのポジショニング",
              "リスク評価：VaR@95% = $450K、モンテカルロ・シミュレーション(n=10,000)"
            ],
            actionItems: [
              "フェーズ1 (Q1)：デジタルMVPローンチ、CPA目標$12、月限1,000顧客獲得",
              "フェーズ2 (Q2)：オムニチャネル展開、NPS 45以上達成、LTV/CAC > 3.0",
              "フェーズ3 (Q3-Q4)：スケール拡大、市場シェア2%獲得、EBITDAマージン15%"
            ],
            consensus: "シナリオ分析結果：Base case (60%確率) NPV $2.3M、Bull case (25%) $4.1M、Bear case (15%) -$0.8M。段階的投資アプローチによりリスクを最小化しつつ、リアルオプション価値$0.9Mを確保。GO決定。"
          })
        }
      } catch (err) {
        setError("データの読み込み中にエラーが発生しました。")
        console.error('ResultsScreen error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSessionData()
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">ディスカッション結果</h1>
          {!isLoading && <p className="text-slate-300">{discussionSummary.topic}</p>}
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card className="mb-6 p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="ml-4 text-slate-300">結果を読み込んでいます...</p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="mb-6 p-6 border-red-500">
            <div className="text-center py-8">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={onNewDiscussion} variant="outline">
                新しいディスカッションを開始
              </Button>
            </div>
          </Card>
        )}

        {/* Summary Card */}
        {!isLoading && !error && (
        <Card className="mb-6 p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-400">実行時間</p>
              <p className="font-semibold">{discussionSummary.duration}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">参加AI</p>
              <p className="font-semibold">{discussionSummary.participants.join(", ")}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold mb-2">結論・合意点</h3>
            <p className="text-slate-300">{discussionSummary.consensus}</p>
          </div>
        </Card>
        )}

        {/* Key Points */}
        {!isLoading && !error && (
        <Card className="mb-6 p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <ChevronDownIcon className="w-5 h-5 mr-2" />
            主要な議論ポイント
          </h3>
          <ul className="space-y-3">
            {discussionSummary.keyPoints.map((point, index) => (
              <motion.li
                key={point}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start"
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <p className="text-slate-300">{point}</p>
              </motion.li>
            ))}
          </ul>
        </Card>
        )}

        {/* Action Items */}
        {!isLoading && !error && (
        <Card className="mb-6 p-6">
          <h3 className="font-semibold mb-4">推奨アクション</h3>
          <ul className="space-y-3">
            {discussionSummary.actionItems.map((action, index) => (
              <motion.li
                key={action}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start"
              >
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">{index + 1}</span>
                </div>
                <p className="text-slate-300">{action}</p>
              </motion.li>
            ))}
          </ul>
        </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button
            onClick={() => {}}
            className="flex-1 flex items-center justify-center"
          >
            <ShareIcon className="w-5 h-5 mr-2" />
            結果を共有
          </Button>
          <Button
            variant="outline"
            onClick={() => {}}
            className="flex-1 flex items-center justify-center"
          >
            <BookmarkIcon className="w-5 h-5 mr-2" />
            保存
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            onClick={onNewDiscussion}
            className="flex-1"
          >
            新しいディスカッション
          </Button>
          <Button
            variant="outline"
            onClick={onHome}
            className="flex-1"
          >
            ホームへ戻る
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default ResultsScreen
