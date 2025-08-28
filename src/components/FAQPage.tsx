'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  DocumentTextIcon,
  BoltIcon,
  MoonIcon,
  SunIcon,
  PresentationChartLineIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

const FAQPage = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };


  // FAQ データ
  const faqData = [
    {
      category: "基本機能",
      icon: <QuestionMarkCircleIcon className="w-6 h-6" />,
      questions: [
        {
          q: "AI経営軍師はどのようなシステムですか？",
          a: "AI経営軍師は、6人のAI軍師たち（CEO、CFO、CMO、CTO、COO、悪魔の代弁者）が相互に議論し、ビジネス課題に対する包括的な解決策を提供するバーチャル役員会議システムです。単一のAIでは得られない、多角的で深い洞察を提供します。"
        },
        {
          q: "どのような課題に対応できますか？",
          a: "新事業立ち上げ、投資判断、マーケティング戦略、DX推進、組織改革、危機管理など、経営全般の課題に対応可能です。特に複数の専門領域にまたがる複雑な意思決定に威力を発揮します。"
        },
        {
          q: "議論にはどの程度の時間がかかりますか？",
          a: "議論の複雑さにもよりますが、通常5-15分で完了します。AI軍師たちは同時並行で分析・議論を行うため、人間の会議と比べて大幅な時間短縮が可能です。"
        }
      ]
    },
    {
      category: "使用方法",
      icon: <UserGroupIcon className="w-6 h-6" />,
      questions: [
        {
          q: "夜間に議論を依頼して、朝に結果を受け取ることはできますか？",
          a: "はい、可能です。夜寝る前に課題を投稿すれば、AI軍師たちが夜中の間に議論を行い、朝起きた時には詳細なレポートが完成しています。24時間365日稼働するため、時間を有効活用できます。"
        },
        {
          q: "緊急の商談前に戦略を立てたい場合はどうすればよいですか？",
          a: "「緊急役員会議」機能をご利用ください。商談相手の情報、提案内容、競合状況などを入力すると、15-20分で最適なアプローチ戦略、価格設定、想定質問への回答などを含む商談戦略を作成します。"
        },
        {
          q: "財務諸表などの資料をアップロードできますか？",
          a: "はい、PDF、Excel、CSVなどの形式でアップロード可能です。財務諸表、市場調査データ、競合分析資料などをアップロードすると、AI軍師たちがデータを分析し、より具体的で実践的な提案を行います。"
        },
        {
          q: "株主総会の準備にも使えますか？",
          a: "非常に効果的です。財務データをアップロードし、「株主総会での想定質問対応」を依頼すると、CFO AIが財務分析を行い、CEO AIが株主への説明戦略を提案。悪魔の代弁者が厳しい質問を想定し、完璧な準備ができます。"
        }
      ]
    },
    {
      category: "セキュリティ・品質",
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      questions: [
        {
          q: "アップロードしたデータのセキュリティは大丈夫ですか？",
          a: "エンタープライズレベルのセキュリティを確保しています。すべてのデータは暗号化され、AI処理後は自動的に削除されます。また、データは議論の目的以外には一切使用されません。"
        },
        {
          q: "議論の品質はどの程度信頼できますか？",
          a: "各AI軍師たちは世界トップレベルの戦略フレームワークと統計手法を活用し、確信度付きで回答します。また、悪魔の代弁者による批判的検証により、バイアスを排除した客観的な分析を提供します。"
        },
        {
          q: "結果に責任を持ってもらえますか？",
          a: "AI経営軍師は意思決定支援ツールであり、最終的な判断と責任は利用者にあります。ただし、統計的有意性（p < 0.05）に基づく分析と、複数の専門家による検証により、高品質な提案を保証します。"
        }
      ]
    },
    {
      category: "料金・プラン",
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
      questions: [
        {
          q: "シンプルプランの内容を教えてください",
          a: "月9,800円で月30回までAI軍師たちによる議論が可能です。基本的な6名のAI軍師と概要版レポートをご利用いただけ、個人事業主や小規模企業に適しています。"
        },
        {
          q: "従来のコンサルティングと比較してコストはどうですか？",
          a: "従来のコンサルティング（1プロジェクト数百万円〜数千万円）と比較して、1/100以下のコストで同等以上の品質の戦略立案が可能です。特に継続的な意思決定支援において圧倒的にコスト効率が優れています。"
        },
        {
          q: "プランの変更や解約はいつでもできますか？",
          a: "はい、プランの変更・解約はいつでも可能です。解約時の違約金等は一切ありません。また、議論履歴は解約後も1年間保存され、いつでも再開できます。"
        }
      ]
    },
    {
      category: "技術・機能",
      icon: <BuildingOfficeIcon className="w-6 h-6" />,
      questions: [
        {
          q: "資料のアップロード・分析機能について",
          a: "現在開発中の機能です。将来的にはPDF、Excel、CSVなどの財務諸表や市場調査データをアップロードし、AI軍師たちが分析できるようになる予定です。"
        },
        {
          q: "現在利用できる機能は何ですか？",
          a: "テキストベースでの課題入力とAI軍師たちの議論、議論結果のレポート作成、議論履歴の保存が主な機能です。将来的にはより高度な分析機能を追加予定です。"
        },
        {
          q: "モバイルでも利用できますか？",
          a: "はい、Webブラウザ版はモバイル最適化されており、スマートフォンからも快適にご利用いただけます。専用モバイルアプリは2025年春リリース予定です。"
        }
      ]
    }
  ];

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
            <h1 className="text-xl font-bold">よくある質問</h1>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-4 max-w-6xl mx-auto pb-16">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
            よくある<span className="text-blue-400">質問</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
            AI経営軍師の機能や使い方について、よくお寄せいただくご質問にお答えします
          </p>
        </div>


        {/* FAQ Section */}
        <section className="px-4">
          <h3 className="text-2xl sm:text-3xl font-bold mb-6 md:mb-8 text-center">
            よくある<span className="text-blue-400">ご質問</span>
          </h3>
          
          <div className="space-y-4 md:space-y-6">
            {faqData.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center mb-3 md:mb-4">
                  <div className="text-blue-400 mr-2 sm:mr-3">{category.icon}</div>
                  <h4 className="text-lg sm:text-xl font-bold">{category.category}</h4>
                </div>
                
                <div className="space-y-2 md:space-y-3">
                  {category.questions.map((faq, questionIndex) => {
                    const itemIndex = categoryIndex * 100 + questionIndex;
                    const isOpen = openItems.includes(itemIndex);
                    
                    return (
                      <Card key={questionIndex} className="bg-slate-800/50 border-slate-700">
                        <button
                          onClick={() => toggleItem(itemIndex)}
                          className="w-full p-4 sm:p-5 md:p-6 text-left flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                        >
                          <span className="font-semibold pr-3 sm:pr-4 text-sm sm:text-base">{faq.q}</span>
                          {isOpen ? (
                            <ChevronUpIcon className="w-5 h-5 flex-shrink-0 text-blue-400" />
                          ) : (
                            <ChevronDownIcon className="w-5 h-5 flex-shrink-0 text-slate-400" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-0">
                                <div className="border-t border-slate-600 pt-3 sm:pt-4">
                                  <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{faq.a}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="mt-12 md:mt-16 text-center px-4">
          <Card className="p-4 sm:p-6 md:p-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/50">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 md:mb-4">他にご質問がございますか？</h3>
            <p className="text-slate-300 mb-4 md:mb-6 text-sm sm:text-base">
              こちらに記載されていない質問や、個別のご相談がございましたら、お気軽にお問い合わせください
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
              <Link href="/demo" className="inline-block w-full sm:w-auto">
                <button className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors text-sm sm:text-base">
                  まずはデモを体験
                </button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors text-sm sm:text-base">
                  お問い合わせ
                </button>
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default FAQPage;