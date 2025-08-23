import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ChevronDownIcon, ShareIcon, BookmarkIcon } from '@heroicons/react/24/outline'

interface ResultsScreenProps {
  onNewDiscussion: () => void
  onHome: () => void
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  onNewDiscussion,
  onHome
}) => {
  const discussionSummary = {
    topic: "Q4マーケティング戦略の見直し",
    duration: "15分",
    participants: ["CEO AI", "CMO AI", "CFO AI"],
    keyPoints: [
      "デジタルマーケティング予算を30%増加させる提案",
      "新規顧客獲得コストの最適化が急務",
      "競合他社の価格戦略に対する対応策が必要",
      "ブランド認知度向上のための長期投資を検討"
    ],
    actionItems: [
      "マーケティング部門との詳細な予算会議を来週設定",
      "競合分析レポートを2週間以内に作成",
      "顧客獲得コストの分析データを収集"
    ],
    consensus: "短期的な売上向上と長期的なブランド価値向上のバランスを取った戦略が必要"
  }

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
          <p className="text-slate-300">{discussionSummary.topic}</p>
        </div>

        {/* Summary Card */}
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

        {/* Key Points */}
        <Card className="mb-6 p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <ChevronDownIcon className="w-5 h-5 mr-2" />
            主要な議論ポイント
          </h3>
          <ul className="space-y-3">
            {discussionSummary.keyPoints.map((point, index) => (
              <motion.li
                key={index}
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

        {/* Action Items */}
        <Card className="mb-6 p-6">
          <h3 className="font-semibold mb-4">推奨アクション</h3>
          <ul className="space-y-3">
            {discussionSummary.actionItems.map((action, index) => (
              <motion.li
                key={index}
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