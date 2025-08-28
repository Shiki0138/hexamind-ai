'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  PlayIcon, 
  PauseIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  ArrowRightIcon,
  ClockIcon,
  PresentationChartLineIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  LightBulbIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

// デモ用の固定ディスカッションデータ
const demoDiscussion = {
  topic: "新規ECプラットフォーム事業への参入戦略",
  clarifiedQuestion: "当社（中堅IT企業、年商50億円）が、中小企業向けECプラットフォーム事業に新規参入する戦略について検討したい。初期投資予算は3億円、目標は3年でシェア10%獲得。",
  messages: [
    {
      agent: "CEO AI",
      role: "経営戦略担当",
      message: "ECプラットフォーム市場への参入は、当社の技術力を活かせる戦略的に妥当な選択です。現在の市場規模は約500億円で年率15%成長しており（参考：経済産業省『電子商取引に関する市場調査』2023年版）、特に中小企業向けセグメントは未成熟です。\n\n我々の強みである開発力とB2B営業経験を活かせば、3年でシェア10%は現実的な目標です（参考：BCG『日本のB2B EC市場分析』2023年）。",
      timestamp: "10:00:15",
      confidence: 0.85,
      replyTo: null
    },
    {
      agent: "悪魔の代弁者",
      role: "批判的分析担当",
      message: "CEOの楽観的な見解に異議を申し立てます。以下の重大なリスクを考慮すべきです：\n\n1. 既存大手（Shopify、BASE等）との差別化が不明確\n2. 初期投資3億円では開発とマーケティングの両立が困難\n3. 中小企業の解約率は平均30%/年と高く（出典：SaaS業界レポート2023、矢野経済研究所）、収益安定化に時間がかかる",
      timestamp: "10:00:45",
      confidence: 0.90,
      replyTo: "CEO AI"
    },
    {
      agent: "CFO AI",
      role: "財務分析担当",
      message: "悪魔の代弁者の指摘は的確です。財務面から詳細に分析します。\n\n初期投資3億円では、開発に1.5億円、マーケティングに1億円、運転資金0.5億円が限界です。競合のShopifyは年間マーケティング費用だけで10億円以上投入しています（出典：Shopify Annual Report 2023）。\n\n追加資金調達なしでは、市場での存在感を確立することは困難でしょう。",
      timestamp: "10:01:20",
      confidence: 0.88,
      replyTo: "悪魔の代弁者"
    },
    {
      agent: "CTO AI",
      role: "技術戦略担当",
      message: "CFOの懸念は理解しますが、技術面での差別化は可能です。\n\nAI活用による自動化機能に特化すれば、開発コストを抑えながら競合優位性を確保できます：\n- 在庫最適化AI（精度95%以上、参考：MIT Sloan Review『AI in Supply Chain』2023）\n- 価格設定AI（売上20%向上実績、参考：McKinsey『Dynamic Pricing with AI』2023）\n- 顧客行動予測AI（参考：Gartner『AI Trends in E-commerce』2024）\n\n最小構成なら6ヶ月、1.2億円で実現可能です。",
      timestamp: "10:01:55",
      confidence: 0.82,
      replyTo: "CFO AI"
    },
    {
      agent: "CMO AI",
      role: "マーケティング担当",
      message: "CTOのAI機能は魅力的ですが、それだけでは顧客獲得は困難です。\n\n中小企業オーナーの多くはAIより「簡単さ」と「サポート」を重視します（出典：中小企業白書2023、中小企業庁）。提案として：\n1. 業界特化型アプローチ（まず飲食店に集中）\n2. 地域密着型の対面サポート\n3. 成功報酬型の料金体系\n\nこれなら限られた予算でも効果的な顧客獲得が可能です（参考：HubSpot『SMB Marketing Report』2023）。",
      timestamp: "10:02:30",
      confidence: 0.80,
      replyTo: "CTO AI"
    },
    {
      agent: "CEO AI",
      role: "経営戦略担当",
      message: "CMOの業界特化戦略に賛同します。加えて、戦略的パートナーシップも検討すべきです。\n\n例えば、飲食店向けPOSシステム大手との提携により：\n- 初期顧客獲得コストを50%削減\n- 既存顧客基盤へのアクセス\n- 技術統合によるシナジー効果\n\nこれにより、限られたリソースでも市場参入が現実的になります。",
      timestamp: "10:03:05",
      confidence: 0.87,
      replyTo: "CMO AI"
    },
    {
      agent: "COO AI",
      role: "事業運営担当",
      message: "CEOの提携戦略は有効ですが、実行面での課題があります。\n\n組織体制として：\n- 開発10名、営業5名、CS 3名の最小構成でスタート\n- 6ヶ月以内にPOC（概念実証）完了\n- パートナー企業との共同開発体制\n\nただし、優秀な人材確保が最大の課題です。現在の人材市場では、必要なスキルセットを持つ人材の採用に時間がかかります。",
      timestamp: "10:03:40",
      confidence: 0.83,
      replyTo: "CEO AI"
    },
    {
      agent: "悪魔の代弁者",
      role: "批判的分析担当",
      message: "COOの人材課題は深刻です。さらに以下のリスクも考慮すべきです：\n\n1. パートナー企業への過度な依存リスク\n2. 飲食店特化では市場規模が限定的（TAM 50億円程度、参考：飲食業界動向調査2023）\n3. 競合が同様の戦略を取った場合の対抗策が不明\n\n撤退基準を明確に設定しておくべきです。例：1年後に月間20社獲得できなければ撤退（参考：『Lean Startup』Eric Ries）。",
      timestamp: "10:04:15",
      confidence: 0.91,
      replyTo: "COO AI"
    },
    {
      agent: "CFO AI",
      role: "財務分析担当",
      message: "悪魔の代弁者の撤退基準設定は重要です。財務的な観点から具体的な基準を提案します：\n\n【Go/No-Go基準】\n- 6ヶ月後：POC完了、パートナー契約1社以上\n- 12ヶ月後：MRR 500万円達成\n- 18ヶ月後：単月黒字化\n- 24ヶ月後：累積投資回収開始\n\n各マイルストーンで未達の場合は戦略見直しが必要です。",
      timestamp: "10:04:50",
      confidence: 0.89,
      replyTo: "悪魔の代弁者"
    },
    {
      agent: "CTO AI",
      role: "技術戦略担当",
      message: "CFOの基準に技術的な観点を追加します。\n\n成功のための技術KPI：\n- システム稼働率99.9%以上\n- ページ読み込み速度2秒以内\n- AI機能の精度90%以上\n- APIレスポンス時間200ms以内\n\nこれらを達成するには、クラウドインフラへの初期投資3000万円が必要です。この投資により、スケーラビリティも確保できます。",
      timestamp: "10:05:25",
      confidence: 0.84,
      replyTo: "CFO AI"
    },
    {
      agent: "CMO AI",
      role: "マーケティング担当",
      message: "技術KPIも重要ですが、顧客満足度の指標も設定すべきです。\n\n【顧客関連KPI】\n- NPS（ネットプロモータースコア）50以上\n- 月次解約率5%以下\n- カスタマーサポート応答時間1時間以内\n- オンボーディング完了率80%以上\n\n特に初期100社の成功体験が、その後の成長を左右します。",
      timestamp: "10:06:00",
      confidence: 0.81,
      replyTo: "CTO AI"
    },
    {
      agent: "CEO AI",
      role: "経営戦略担当",
      message: "皆さんの意見を統合し、修正戦略を提案します。\n\n【段階的参入戦略】\nPhase1（0-6ヶ月）：飲食店特化型MVPの開発\nPhase2（7-12ヶ月）：パートナー経由での顧客獲得\nPhase3（13-24ヶ月）：横展開と自社獲得強化\n\n初期投資を2億円に抑え、マイルストーン達成時に追加投資を検討。これにより、リスクを最小化しながら市場機会を探れます。",
      timestamp: "10:06:35",
      confidence: 0.88,
      replyTo: null
    }
  ],
  consensus: {
    decision: "段階的参入を推奨（初期投資を抑えてリスクヘッジ）",
    keyPoints: [
      "飲食店特化型ECプラットフォームとしてスタート",
      "POSシステム企業との戦略的提携を前提",
      "AI機能による差別化（在庫最適化、価格設定等）",
      "初期投資を2億円に抑え、段階的に拡大",
      "明確な撤退基準の設定（各フェーズでGo/No-Go判断）"
    ],
    risks: [
      "人材確保の困難さ（特にAIエンジニア）",
      "パートナー企業への依存リスク",
      "飲食店市場の規模的制約（TAM 50億円）",
      "競合の追随リスク",
      "初期顧客の解約率管理"
    ],
    financials: {
      initialInvestment: "2億円（開発1億円、マーケティング0.7億円、運転資金0.3億円）",
      breakEven: "18ヶ月後（月間顧客数200社達成時）",
      targetRevenue: "3年後に年商15億円（シェア3%相当）",
      roi: "5年間でROI 250%（追加投資含む）"
    },
    nextActions: [
      "飲食店向けPOSシステム大手3社との提携交渉開始（2週間以内）",
      "AI エンジニア3名の採用活動開始（即時）",
      "飲食店オーナー30名への詳細ヒアリング実施（1ヶ月以内）",
      "技術要件定義書の作成（2週間以内）",
      "Phase1の詳細事業計画策定（3週間以内）"
    ],
    kpis: {
      sixMonths: {
        tech: "MVP完成、稼働率99%達成",
        business: "POC顧客10社獲得",
        finance: "投資額8000万円以内"
      },
      twelveMonths: {
        tech: "AI精度90%以上、API応答200ms以内",
        business: "有料顧客50社、MRR 500万円",
        finance: "単月収支-1000万円以内"
      },
      twentyFourMonths: {
        tech: "マルチテナント対応、自動スケーリング実装",
        business: "有料顧客500社、NPS 50以上",
        finance: "単月黒字化、累積投資3億円"
      }
    }
  }
};

// ビジュアルレポート用のデータ
const visualData = {
  marketSize: [
    { label: "全体市場", value: 500, color: "#3B82F6" },
    { label: "飲食店向け", value: 50, color: "#10B981" },
    { label: "目標シェア", value: 5, color: "#F59E0B" }
  ],
  timeline: [
    { phase: "Phase 1", months: "0-6", label: "MVP開発", color: "#3B82F6" },
    { phase: "Phase 2", months: "7-12", label: "市場参入", color: "#10B981" },
    { phase: "Phase 3", months: "13-24", label: "拡大期", color: "#F59E0B" }
  ],
  investment: [
    { category: "開発", amount: 100, percentage: 50 },
    { category: "マーケティング", amount: 70, percentage: 35 },
    { category: "運転資金", amount: 30, percentage: 15 }
  ],
  riskMatrix: [
    { risk: "人材確保", impact: 4, probability: 4 },
    { risk: "競合追随", impact: 3, probability: 3 },
    { risk: "技術課題", impact: 3, probability: 2 },
    { risk: "資金不足", impact: 5, probability: 2 }
  ]
};

const DemoPage = () => {
  const [currentStep, setCurrentStep] = useState<'intro' | 'quick-input' | 'discussion' | 'report'>('intro');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);
  const [showConsensus, setShowConsensus] = useState(false);
  const [reportView, setReportView] = useState<'text' | 'visual'>('text');
  const [userQuestion, setUserQuestion] = useState('');

  // Auto-play discussion messages
  useEffect(() => {
    if (isPlaying && currentStep === 'discussion' && currentMessageIndex < demoDiscussion.messages.length) {
      const timer = setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
        if (currentMessageIndex === demoDiscussion.messages.length - 1) {
          setIsPlaying(false);
          setTimeout(() => setShowConsensus(true), 500);
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentMessageIndex, currentStep]);

  const handleStartDemo = () => {
    setCurrentStep('discussion');
    setIsPlaying(true);
    setCurrentMessageIndex(0);
  };

  const handleViewReport = () => {
    setCurrentStep('report');
  };

  const handleRestart = () => {
    setCurrentStep('intro');
    setCurrentMessageIndex(-1);
    setShowConsensus(false);
    setIsPlaying(false);
    setReportView('text');
  };

  const getAgentColor = (agent: string) => {
    const colors: { [key: string]: string } = {
      "CEO AI": "from-blue-500 to-blue-600",
      "CFO AI": "from-green-500 to-green-600",
      "CMO AI": "from-purple-500 to-purple-600",
      "CTO AI": "from-cyan-500 to-cyan-600",
      "COO AI": "from-orange-500 to-orange-600",
      "悪魔の代弁者": "from-red-500 to-red-600"
    };
    return colors[agent] || "from-gray-500 to-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/90 backdrop-blur-sm border-b border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 text-slate-300 hover:text-white transition-colors">
              <ArrowLeftIcon className="w-5 h-5" />
              <span>トップページに戻る</span>
            </Link>
            <h1 className="text-xl font-bold">AI経営軍師 デモ</h1>
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {/* Quick Input Screen */}
        {currentStep === 'quick-input' && (
          <motion.div
            key="quick-input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-24 px-4 max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                あなたの経営課題を教えてください
              </h2>
              <p className="text-slate-400">
                AI軍師たちがこの課題を元に議論します
              </p>
            </div>
            
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <textarea
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="例：新規ECプラットフォーム事業への参入を検討しています"
                className="w-full h-32 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={handleStartDemo}
                  disabled={!userQuestion.trim()}
                  className="flex-1"
                >
                  AI軍師に相談する
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleStartDemo}
                  className="flex-1"
                >
                  デモを見る
                </Button>
              </div>
              
              <p className="text-xs text-slate-400 mt-4 text-center">
                ※ デモ版では事前に準備された議論をご覧いただけます
              </p>
            </Card>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400 mb-4">または</p>
              <button
                onClick={() => setCurrentStep('intro')}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                詳しい説明を見る
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Intro Screen */}
        {currentStep === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-24 px-4 max-w-4xl mx-auto"
          >
            <div className="text-center mb-8 md:mb-12 px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
                実際の<span className="text-blue-400">AI役員会議</span>を体験
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-slate-300">
                <span className="block mb-2">6人のAI軍師たちが建設的な議論を重ね、</span>
                <span className="block">実践的なビジネス戦略を導き出す様子をご覧ください</span>
              </p>
            </div>

            <Card className="p-4 sm:p-6 md:p-8 bg-slate-800/50 border-slate-700">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 md:mb-4 text-blue-300">デモシナリオ</h3>
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                <div>
                  <h4 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">議題</h4>
                  <p className="text-slate-300 text-sm sm:text-base">{demoDiscussion.topic}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">背景</h4>
                  <p className="text-slate-300 text-sm sm:text-base">{demoDiscussion.clarifiedQuestion}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">参加AI軍師たち</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                    {['CEO AI', 'CFO AI', 'CMO AI', 'CTO AI', 'COO AI', '悪魔の代弁者'].map(agent => (
                      <div key={agent} className="bg-slate-700/50 rounded-lg px-3 py-2 text-center text-sm sm:text-base">
                        {agent}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-blue-300">
                    <strong>デモの特徴：</strong>相互に意見を交換し、批判的検証を行いながら、建設的な結論を導き出します
                  </p>
                </div>
              </div>

              <div className="flex justify-center px-4">
                <Button 
                  size="lg" 
                  onClick={() => setCurrentStep('quick-input')}
                  className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg"
                >
                  <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  今すぐ試す
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Discussion Screen */}
        {currentStep === 'discussion' && (
          <motion.div
            key="discussion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-20 pb-8 px-4 max-w-7xl mx-auto"
          >
            <div className="mb-4 md:mb-6 px-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold">AI役員会議 進行中</h2>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-3 py-2"
                  >
                    {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                  </Button>
                  <span className="text-xs sm:text-sm text-slate-400">
                    <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                    {currentMessageIndex + 1} / {demoDiscussion.messages.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-4 lg:gap-6 px-4">
              {/* Main Discussion Area */}
              <div className="lg:col-span-3">
                <Card className="h-[400px] sm:h-[500px] lg:h-[600px] bg-slate-800/30 border-slate-700 overflow-hidden">
                  <div className="p-3 sm:p-4 border-b border-slate-700">
                    <h3 className="font-semibold text-sm sm:text-base">{demoDiscussion.topic}</h3>
                  </div>
                  <div className="p-3 sm:p-4 h-[340px] sm:h-[440px] lg:h-[520px] overflow-y-auto space-y-3 sm:space-y-4">
                    <AnimatePresence>
                      {demoDiscussion.messages.slice(0, currentMessageIndex + 1).map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start space-x-2 sm:space-x-3"
                        >
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r ${getAgentColor(msg.agent)} flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0`}>
                            {msg.agent.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
                              <span className="font-semibold text-xs sm:text-sm">{msg.agent}</span>
                              <span className="text-xs text-slate-400 hidden sm:inline">{msg.role}</span>
                              {msg.replyTo && (
                                <span className="text-xs text-blue-400 hidden sm:inline">→ {msg.replyTo}への返答</span>
                              )}
                              <span className="text-xs text-slate-500 hidden sm:inline">{msg.timestamp}</span>
                            </div>
                            <div className="bg-slate-700/50 rounded-lg p-2 sm:p-3">
                              <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">{msg.message}</p>
                              <div className="mt-1 sm:mt-2 flex items-center justify-between">
                                <span className="text-xs text-slate-400">確信度: {(msg.confidence * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {showConsensus && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-green-900/20 border border-green-700/50 rounded-lg"
                      >
                        <h4 className="font-bold text-green-400 mb-2">合意形成完了</h4>
                        <p className="text-sm text-slate-300">
                          全AI軍師たちによる建設的な議論が終了し、実行可能な戦略が策定されました。
                        </p>
                        <p className="mt-2 font-semibold text-green-300">
                          決定事項：{demoDiscussion.consensus.decision}
                        </p>
                        <Button
                          size="sm"
                          className="mt-3"
                          onClick={handleViewReport}
                        >
                          詳細レポートを見る
                          <ArrowRightIcon className="w-4 h-4 ml-1" />
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Agent Status Panel */}
              <div className="space-y-4">
                <Card className="p-4 bg-slate-800/50 border-slate-700">
                  <h3 className="font-semibold mb-3">参加エージェント</h3>
                  <div className="space-y-2">
                    {['CEO AI', 'CFO AI', 'CMO AI', 'CTO AI', 'COO AI', '悪魔の代弁者'].map((agent) => {
                      const agentMessages = demoDiscussion.messages.filter(m => m.agent === agent);
                      const hasSpoken = agentMessages.some((_, idx) => 
                        demoDiscussion.messages.indexOf(agentMessages[idx]) <= currentMessageIndex
                      );
                      
                      return (
                        <div 
                          key={agent}
                          className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                            hasSpoken ? 'bg-slate-700/50' : 'bg-slate-800/30'
                          }`}
                        >
                          <span className="text-sm">{agent}</span>
                          {hasSpoken && (
                            <span className="text-xs text-green-400">
                              {agentMessages.filter((_, idx) => 
                                demoDiscussion.messages.indexOf(agentMessages[idx]) <= currentMessageIndex
                              ).length}回発言
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card className="p-4 bg-slate-800/50 border-slate-700">
                  <h3 className="font-semibold mb-3">議論の特徴</h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      <span>専門家同士の建設的な対話</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      <span>批判的検証と改善提案</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      <span>データに基づく客観的分析</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      <span>実行可能な戦略立案</span>
                    </li>
                  </ul>
                </Card>

                {currentMessageIndex >= 5 && (
                  <Card className="p-4 bg-blue-900/20 border-blue-700/50">
                    <h3 className="font-semibold mb-2 text-blue-300">議論のポイント</h3>
                    <p className="text-sm text-slate-300">
                      各AIが相互に意見を交換し、リスクを指摘しながらも建設的な解決策を提示しています
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Report Screen */}
        {currentStep === 'report' && (
          <motion.div
            key="report"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-20 pb-8 px-4 max-w-7xl mx-auto"
          >
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold">AI役員会議 報告書</h2>
                <Button
                  variant="outline"
                  onClick={handleRestart}
                >
                  最初から見る
                </Button>
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center space-x-4">
                <Button
                  variant={reportView === 'text' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setReportView('text')}
                >
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  テキストレポート
                </Button>
                <Button
                  variant={reportView === 'visual' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setReportView('visual')}
                >
                  <PresentationChartLineIcon className="w-4 h-4 mr-2" />
                  ビジュアルレポート
                </Button>
              </div>
            </div>

            {/* Text Report View */}
            {reportView === 'text' && (
              <div className="space-y-6">
                {/* Executive Summary */}
                <Card className="p-8 bg-slate-800/50 border-slate-700">
                  <div className="flex items-center mb-6">
                    <DocumentChartBarIcon className="w-8 h-8 mr-3 text-blue-400" />
                    <div>
                      <h3 className="text-2xl font-bold">エグゼクティブサマリー</h3>
                      <p className="text-sm text-slate-400">議題：{demoDiscussion.topic}</p>
                    </div>
                  </div>

                  {/* Decision */}
                  <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg mb-6">
                    <h4 className="font-bold text-green-400 mb-2">最終決定</h4>
                    <p className="text-lg">{demoDiscussion.consensus.decision}</p>
                  </div>

                  {/* Key Points */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-xl mb-3 flex items-center">
                        <CheckBadgeIcon className="w-5 h-5 mr-2 text-blue-400" />
                        戦略的要点
                      </h4>
                      <ul className="space-y-2">
                        {demoDiscussion.consensus.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-blue-400 mr-2 mt-1">•</span>
                            <span className="text-sm">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-xl mb-3 flex items-center">
                        <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-orange-400" />
                        リスクと対策
                      </h4>
                      <ul className="space-y-2">
                        {demoDiscussion.consensus.risks.map((risk, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-orange-400 mr-2 mt-1">⚠</span>
                            <span className="text-sm">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Financial Analysis */}
                <Card className="p-8 bg-slate-800/50 border-slate-700">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <CurrencyDollarIcon className="w-8 h-8 mr-3 text-green-400" />
                    財務分析
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-400 mb-1">初期投資</h4>
                        <p className="text-xl">{demoDiscussion.consensus.financials.initialInvestment}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-400 mb-1">損益分岐点</h4>
                        <p className="text-xl">{demoDiscussion.consensus.financials.breakEven}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-400 mb-1">目標収益（3年後）</h4>
                        <p className="text-xl">{demoDiscussion.consensus.financials.targetRevenue}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-400 mb-1">投資収益率（ROI）</h4>
                        <p className="text-xl">{demoDiscussion.consensus.financials.roi}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Market Environment Analysis */}
                <Card className="p-8 bg-slate-800/50 border-slate-700">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <ChartBarIcon className="w-8 h-8 mr-3 text-blue-400" />
                    市場環境分析
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-xl mb-3 text-blue-300">市場規模と成長性</h4>
                      <p className="text-sm text-slate-300 mb-4">
                        国内ECプラットフォーム市場は2023年時点で約500億円規模（経済産業省『電子商取引に関する市場調査』2023年版）。
                        年平均成長率（CAGR）は15%と高成長を維持しており、2026年には約760億円市場に拡大見込み。
                        特に中小企業向けセグメントは従来のBtoCプラットフォームとは異なる独自のニーズがあり、参入機会が大きい。
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <h5 className="font-semibold text-green-400 mb-2">成長要因</h5>
                          <ul className="text-sm space-y-1">
                            <li>• DX推進による中小企業のデジタル化需要増大</li>
                            <li>• コロナ禍による非接触型商取引へのシフト</li>
                            <li>• 人手不足解決のためのシステム自動化需要</li>
                            <li>• インボイス制度対応によるシステム刷新機会</li>
                          </ul>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <h5 className="font-semibold text-orange-400 mb-2">市場課題</h5>
                          <ul className="text-sm space-y-1">
                            <li>• 既存プラットフォームの機能過多による使いにくさ</li>
                            <li>• 中小企業の予算制約と投資対効果への厳しい評価</li>
                            <li>• 業界特化型ソリューションの不足</li>
                            <li>• カスタマーサクセスの体制不足</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-xl mb-3 text-purple-300">競合状況分析</h4>
                      <div className="space-y-4">
                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <h5 className="font-semibold text-red-400 mb-2">直接競合</h5>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-semibold mb-1">Shopify（カナダ）</p>
                              <p className="text-slate-300">• 世界最大手、月額$29-$2000の幅広い料金体系</p>
                              <p className="text-slate-300">• 強み：豊富なアプリエコシステム、グローバル対応</p>
                              <p className="text-slate-300">• 弱み：日本語対応の不完全さ、高価格帯</p>
                            </div>
                            <div>
                              <p className="font-semibold mb-1">BASE（日本）</p>
                              <p className="text-slate-300">• 国内シェア約30%、初期費用無料モデル</p>
                              <p className="text-slate-300">• 強み：シンプルなUI、日本市場への特化</p>
                              <p className="text-slate-300">• 弱み：B2B機能の不足、カスタマイズ性の限界</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <h5 className="font-semibold text-yellow-400 mb-2">競合優位性の構築</h5>
                          <div className="text-sm">
                            <p className="mb-2">AI機能による差別化により、以下の競合優位性を確立：</p>
                            <ul className="space-y-1 ml-4">
                              <li>• 在庫最適化AI：需要予測精度95%以上（参考：MIT Sloan Review『AI in Supply Chain』2023）</li>
                              <li>• 動的価格設定AI：売上20%向上実績（参考：McKinsey『Dynamic Pricing with AI』2023）</li>
                              <li>• 顧客行動分析AI：購買確率予測と個人化推奨（参考：Gartner『AI Trends in E-commerce』2024）</li>
                              <li>• 業務自動化：注文処理から配送まで70%の作業時間削減</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Technical Feasibility Deep Dive */}
                <Card className="p-8 bg-slate-800/50 border-slate-700">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <ShieldCheckIcon className="w-8 h-8 mr-3 text-cyan-400" />
                    技術実現性詳細分析
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-xl mb-3 text-cyan-300">システムアーキテクチャ</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <h5 className="font-semibold text-green-400 mb-2">技術スタック</h5>
                          <ul className="text-sm space-y-1">
                            <li>• フロントエンド：React/Next.js (高速なSPA実現)</li>
                            <li>• バックエンド：Node.js/Express (スケーラブル)</li>
                            <li>• データベース：MongoDB + Redis (高速アクセス)</li>
                            <li>• AI/ML：Python/TensorFlow, OpenAI API</li>
                            <li>• インフラ：AWS/Docker (自動スケーリング)</li>
                          </ul>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-400 mb-2">パフォーマンス指標</h5>
                          <ul className="text-sm space-y-1">
                            <li>• ページ読み込み速度：1.5秒以内（目標）</li>
                            <li>• API応答時間：200ms以内</li>
                            <li>• システム稼働率：99.9%以上</li>
                            <li>• データ処理能力：10,000リクエスト/秒</li>
                            <li>• AI推論速度：100ms以内</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-xl mb-3 text-orange-300">開発フェーズ詳細</h4>
                      <div className="space-y-4">
                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-400 mb-2">Phase 1: MVP開発 (0-6ヶ月)</h5>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-semibold mb-1">開発内容</p>
                              <ul className="space-y-1">
                                <li>• 基本EC機能（商品管理、注文処理、決済）</li>
                                <li>• シンプルなAI在庫管理機能</li>
                                <li>• 飲食店特化UI/UX</li>
                                <li>• 基本的な分析ダッシュボード</li>
                              </ul>
                            </div>
                            <div>
                              <p className="font-semibold mb-1">技術的課題と対策</p>
                              <ul className="space-y-1">
                                <li>• レスポンシブデザイン実装</li>
                                <li>• セキュリティ対応（PCI DSS準拠）</li>
                                <li>• 決済システム連携（Stripe/PayPal）</li>
                                <li>• 負荷テストと最適化</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <h5 className="font-semibold text-green-400 mb-2">Phase 2: AI機能強化 (7-12ヶ月)</h5>
                          <div className="text-sm">
                            <p className="mb-2">高度なAI機能の実装により競合との差別化を図る：</p>
                            <ul className="space-y-1 ml-4">
                              <li>• 機械学習による需要予測モデル（過去データ + 外部要因分析）</li>
                              <li>• 動的価格設定アルゴリズム（競合価格、在庫状況、需要予測を統合）</li>
                              <li>• 顧客セグメンテーションと個人化推奨</li>
                              <li>• 自動発注システム（在庫切れリスクの最小化）</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Detailed Risk Assessment */}
                <Card className="p-8 bg-slate-800/50 border-slate-700">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <ExclamationTriangleIcon className="w-8 h-8 mr-3 text-red-400" />
                    詳細リスク分析と対策
                  </h3>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                        <h4 className="font-bold text-red-400 mb-3">高リスク要因</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="font-semibold mb-1">1. 人材確保困難（影響度：高、発生確率：高）</p>
                            <p className="text-slate-300 mb-2">AI/ML専門エンジニアの需要が供給を大幅に上回る状況（参考：経済産業省『IT人材需給に関する調査』2023）</p>
                            <p className="text-green-400 font-semibold">対策：</p>
                            <ul className="ml-4 space-y-1">
                              <li>• 外部開発パートナーとの業務提携（3社と事前交渉済み）</li>
                              <li>• リモートワーク制度による採用範囲の拡大</li>
                              <li>• 海外フリーランスエンジニアの活用（東南アジア中心）</li>
                              <li>• 段階的内製化（初期は外注、徐々に内製）</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                        <h4 className="font-bold text-orange-400 mb-3">中リスク要因</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="font-semibold mb-1">2. 競合の追随（影響度：中、発生確率：中）</p>
                            <p className="text-slate-300 mb-2">大手企業による類似サービス投入の可能性</p>
                            <p className="text-green-400 font-semibold">対策：</p>
                            <ul className="ml-4 space-y-1">
                              <li>• 特許出願による技術保護（AI関連2件申請予定）</li>
                              <li>• 顧客との長期契約（年間契約による囲い込み）</li>
                              <li>• 継続的イノベーション（月次機能追加）</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-xl mb-3 text-yellow-300">シナリオ分析</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                          <h5 className="font-semibold text-green-400 mb-2">楽観シナリオ（30%確率）</h5>
                          <ul className="text-sm space-y-1">
                            <li>• 市場成長率20%で推移</li>
                            <li>• 競合参入が限定的</li>
                            <li>• AI機能が大幅な差別化に成功</li>
                            <li>• 3年後売上：20億円</li>
                            <li>• ROI：350%</li>
                          </ul>
                        </div>
                        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-400 mb-2">基準シナリオ（50%確率）</h5>
                          <ul className="text-sm space-y-1">
                            <li>• 市場成長率15%で推移</li>
                            <li>• 適度な競合参入</li>
                            <li>• 計画通りの事業進行</li>
                            <li>• 3年後売上：15億円</li>
                            <li>• ROI：250%</li>
                          </ul>
                        </div>
                        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                          <h5 className="font-semibold text-red-400 mb-2">悲観シナリオ（20%確率）</h5>
                          <ul className="text-sm space-y-1">
                            <li>• 市場成長鈍化（10%以下）</li>
                            <li>• 大手の本格参入</li>
                            <li>• 技術的課題の発生</li>
                            <li>• 3年後売上：8億円</li>
                            <li>• ROI：120%</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Implementation Roadmap */}
                <Card className="p-8 bg-slate-800/50 border-slate-700">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <LightBulbIcon className="w-8 h-8 mr-3 text-yellow-400" />
                    実行ロードマップ
                  </h3>
                  <div className="space-y-6">
                    {/* Next Actions */}
                    <div>
                      <h4 className="font-bold text-xl mb-3">即時アクション（今後1ヶ月）</h4>
                      <ul className="space-y-2">
                        {demoDiscussion.consensus.nextActions.map((action, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-green-400 mr-2 mt-1">✓</span>
                            <span className="text-sm">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* KPIs */}
                    <div>
                      <h4 className="font-bold text-xl mb-3">主要KPI</h4>
                      <div className="space-y-4">
                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-300 mb-2">6ヶ月後</h5>
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-slate-400">技術：</span> {demoDiscussion.consensus.kpis.sixMonths.tech}
                            </div>
                            <div>
                              <span className="text-slate-400">ビジネス：</span> {demoDiscussion.consensus.kpis.sixMonths.business}
                            </div>
                            <div>
                              <span className="text-slate-400">財務：</span> {demoDiscussion.consensus.kpis.sixMonths.finance}
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <h5 className="font-semibold text-green-300 mb-2">12ヶ月後</h5>
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-slate-400">技術：</span> {demoDiscussion.consensus.kpis.twelveMonths.tech}
                            </div>
                            <div>
                              <span className="text-slate-400">ビジネス：</span> {demoDiscussion.consensus.kpis.twelveMonths.business}
                            </div>
                            <div>
                              <span className="text-slate-400">財務：</span> {demoDiscussion.consensus.kpis.twelveMonths.finance}
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <h5 className="font-semibold text-yellow-300 mb-2">24ヶ月後</h5>
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-slate-400">技術：</span> {demoDiscussion.consensus.kpis.twentyFourMonths.tech}
                            </div>
                            <div>
                              <span className="text-slate-400">ビジネス：</span> {demoDiscussion.consensus.kpis.twentyFourMonths.business}
                            </div>
                            <div>
                              <span className="text-slate-400">財務：</span> {demoDiscussion.consensus.kpis.twentyFourMonths.finance}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Participant Analysis */}
                <Card className="p-8 bg-slate-800/50 border-slate-700">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <UserGroupIcon className="w-8 h-8 mr-3 text-purple-400" />
                    参加者分析
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['CEO AI', 'CFO AI', 'CMO AI', 'CTO AI', 'COO AI', '悪魔の代弁者'].map(agent => {
                      const agentMessages = demoDiscussion.messages.filter(m => m.agent === agent);
                      const avgConfidence = agentMessages.reduce((acc, msg) => acc + msg.confidence, 0) / agentMessages.length;
                      
                      return (
                        <div key={agent} className="bg-slate-700/30 rounded-lg p-4">
                          <h4 className="font-semibold mb-2">{agent}</h4>
                          <div className="text-sm space-y-1">
                            <p className="text-slate-400">発言回数: <span className="text-white">{agentMessages.length}回</span></p>
                            <p className="text-slate-400">平均確信度: <span className="text-white">{(avgConfidence * 100).toFixed(0)}%</span></p>
                            <p className="text-slate-400">主な貢献: <span className="text-white">{
                              agent === 'CEO AI' ? '戦略立案' :
                              agent === 'CFO AI' ? '財務分析' :
                              agent === 'CMO AI' ? '市場分析' :
                              agent === 'CTO AI' ? '技術評価' :
                              agent === 'COO AI' ? '実行計画' :
                              'リスク検証'
                            }</span></p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {/* Visual Report View */}
            {reportView === 'visual' && (
              <div className="space-y-6">
                {/* Market Analysis Chart */}
                <Card className="p-8 bg-slate-800/50 border-slate-700">
                  <h3 className="text-2xl font-bold mb-6">市場規模分析</h3>
                  <div className="flex items-end justify-around h-64">
                    {visualData.marketSize.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div 
                          className="w-24 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-1000"
                          style={{ height: `${(item.value / 500) * 200}px`, backgroundColor: item.color }}
                        ></div>
                        <p className="mt-2 text-sm">{item.label}</p>
                        <p className="text-xl font-bold">{item.value}億円</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Timeline Visualization */}
                <Card className="p-8 bg-slate-800/50 border-slate-700">
                  <h3 className="text-2xl font-bold mb-6">実行タイムライン</h3>
                  <div className="relative">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-600 -translate-y-1/2"></div>
                    <div className="relative flex justify-between">
                      {visualData.timeline.map((phase, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold relative z-10"
                            style={{ backgroundColor: phase.color }}
                          >
                            {phase.phase}
                          </div>
                          <p className="mt-2 text-sm font-semibold">{phase.label}</p>
                          <p className="text-xs text-slate-400">{phase.months}ヶ月</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Investment Breakdown */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-8 bg-slate-800/50 border-slate-700">
                    <h3 className="text-xl font-bold mb-6">投資配分</h3>
                    <div className="space-y-4">
                      {visualData.investment.map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">{item.category}</span>
                            <span className="text-sm font-bold">{item.amount}百万円</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-6">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ width: `${item.percentage}%` }}
                            >
                              {item.percentage}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-600">
                      <div className="flex justify-between">
                        <span className="font-bold">合計</span>
                        <span className="font-bold text-xl">200百万円</span>
                      </div>
                    </div>
                  </Card>

                  {/* Risk Matrix */}
                  <Card className="p-8 bg-slate-800/50 border-slate-700">
                    <h3 className="text-xl font-bold mb-6">リスクマトリックス</h3>
                    <div className="relative h-64 border-2 border-slate-600">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-xs text-slate-400 pb-2">インパクト →</div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full text-xs text-slate-400 pr-2 -rotate-90 origin-center">発生確率 →</div>
                      
                      {/* Grid lines */}
                      <div className="absolute inset-0 grid grid-cols-5 grid-rows-5">
                        {[...Array(25)].map((_, i) => (
                          <div key={i} className="border border-slate-700/50"></div>
                        ))}
                      </div>
                      
                      {/* Risk points */}
                      {visualData.riskMatrix.map((risk, idx) => (
                        <div
                          key={idx}
                          className="absolute w-4 h-4 bg-red-500 rounded-full cursor-pointer hover:scale-150 transition-transform"
                          style={{
                            left: `${(risk.probability / 5) * 100}%`,
                            bottom: `${(risk.impact / 5) * 100}%`,
                            transform: 'translate(-50%, 50%)'
                          }}
                          title={risk.risk}
                        ></div>
                      ))}
                      
                      {/* Risk labels */}
                      <div className="absolute inset-0 pointer-events-none">
                        {visualData.riskMatrix.map((risk, idx) => (
                          <div
                            key={idx}
                            className="absolute text-xs bg-slate-800/90 px-2 py-1 rounded"
                            style={{
                              left: `${(risk.probability / 5) * 100}%`,
                              bottom: `${(risk.impact / 5) * 100}%`,
                              transform: 'translate(-50%, -150%)'
                            }}
                          >
                            {risk.risk}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                      <span>低リスク</span>
                      <span>高リスク</span>
                    </div>
                  </Card>
                </div>

                {/* Success Metrics Dashboard */}
                <Card className="p-8 bg-slate-800/50 border-slate-700">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <ChartBarIcon className="w-8 h-8 mr-3 text-green-400" />
                    成功指標ダッシュボード
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            className="text-slate-700"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56 * 0.75} ${2 * Math.PI * 56}`}
                            className="text-blue-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold">75%</span>
                        </div>
                      </div>
                      <p className="mt-4 font-semibold">技術準備度</p>
                      <p className="text-sm text-slate-400">6ヶ月で達成可能</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            className="text-slate-700"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56 * 0.60} ${2 * Math.PI * 56}`}
                            className="text-green-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold">60%</span>
                        </div>
                      </div>
                      <p className="mt-4 font-semibold">市場適合性</p>
                      <p className="text-sm text-slate-400">ニーズ検証済み</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            className="text-slate-700"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56 * 0.85} ${2 * Math.PI * 56}`}
                            className="text-purple-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold">85%</span>
                        </div>
                      </div>
                      <p className="mt-4 font-semibold">投資効率性</p>
                      <p className="text-sm text-slate-400">ROI 250%見込み</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* CTA Section */}
            <div className="mt-8 text-center">
              <p className="text-slate-400 mb-6">
                このような詳細な分析とビジュアルレポートを、わずか数分で入手できます
              </p>
              <Link href="/">
                <Button size="lg" className="px-8 py-4 text-lg">
                  今すぐ始める
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DemoPage;