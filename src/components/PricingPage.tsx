'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  BoltIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { UNIFIED_PRICING } from '@/lib/pricing';
import Link from 'next/link';

const PricingPage = () => {
  const plans = [
    {
      name: UNIFIED_PRICING.basic.name,
      description: "個人事業主・小規模企業向け",
      price: UNIFIED_PRICING.basic.priceDisplay,
      icon: <SparklesIcon className="w-8 h-8" />,
      features: UNIFIED_PRICING.basic.features,
      limitations: UNIFIED_PRICING.basic.restrictions || [],
      cta: "ベーシックで始める",
      ctaVariant: "outline" as const,
      highlight: false
    },
    {
      name: UNIFIED_PRICING.pro.name,
      description: "成長企業・中堅企業向け",
      price: UNIFIED_PRICING.pro.priceDisplay,
      icon: <BoltIcon className="w-8 h-8" />,
      features: UNIFIED_PRICING.pro.features,
      limitations: [],
      cta: "プロで始める",
      ctaVariant: "primary" as const,
      highlight: true
    },
    {
      name: UNIFIED_PRICING.enterprise.name,
      description: "大企業・上場企業向け",
      price: UNIFIED_PRICING.enterprise.priceDisplay,
      icon: <FireIcon className="w-8 h-8" />,
      features: UNIFIED_PRICING.enterprise.features,
      limitations: [],
      cta: "お問い合わせ",
      ctaVariant: "primary" as const,
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI経営軍師
              </h1>
            </Link>
            <div className="flex items-center space-x-4 md:space-x-8">
              <Link href="/" className="text-slate-300 hover:text-white transition-colors text-sm md:text-base">
                ホーム
              </Link>
              <Link href="/demo">
                <Button size="sm">デモを試す</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              あなたのビジネスに最適な
            </span>
            <br />
            <span className="text-white">
              プランをお選びください
            </span>
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            すべてのプランで7日間の無料トライアルが可能です
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
              >
                <Card
                  className={`relative p-8 h-full ${
                    plan.highlight
                      ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500'
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                        人気No.1
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4">
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-slate-400 text-sm">{plan.description}</p>
                  </div>

                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-slate-400 ml-2">/月</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <h4 className="font-semibold text-sm text-slate-400">含まれる機能</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {plan.limitations.length > 0 && (
                      <>
                        <h4 className="font-semibold text-sm text-slate-400 mt-6">制限事項</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-slate-500 mr-3">-</span>
                              <span className="text-sm text-slate-500">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>

                  <Link href={plan.name === "プロフェッショナル" ? "/contact" : "/demo"}>
                    <Button
                      variant={plan.ctaVariant}
                      size="lg"
                      className="w-full min-h-[48px]"
                    >
                      {plan.cta}
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-700">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            料金に関するよくある質問
          </h2>
          
          <div className="space-y-6">
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h3 className="text-xl font-semibold mb-3">プランの変更は可能ですか？</h3>
              <p className="text-slate-300">
                はい、いつでも上位プランへのアップグレードが可能です。
                日割り計算で差額をお支払いいただきます。
                ダウングレードは次回更新時に適用されます。
              </p>
            </Card>

            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h3 className="text-xl font-semibold mb-3">支払い方法について教えてください</h3>
              <p className="text-slate-300">
                クレジットカード（Visa、Mastercard、JCB、American Express）および
                銀行振込（年間契約のみ）をご利用いただけます。
                請求書払いにも対応しております。
              </p>
            </Card>

            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h3 className="text-xl font-semibold mb-3">解約はいつでもできますか？</h3>
              <p className="text-slate-300">
                はい、いつでも解約可能です。
                解約しても、お支払い済みの期間の終了まではサービスをご利用いただけます。
                日割り返金は行っておりません。
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            まずは無料でお試しください
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            クレジットカード不要で、すぐにAI経営軍師の威力を体験できます
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo">
              <Button size="lg" className="min-h-[56px] px-8">
                無料デモを試す
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="min-h-[56px] px-8">
                お問い合わせ
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;