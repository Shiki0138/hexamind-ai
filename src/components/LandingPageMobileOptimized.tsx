'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  LightBulbIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  PlayIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ClockIcon,
  TrophyIcon,
  MoonIcon,
  BoltIcon,
  DocumentTextIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

const LandingPageMobileOptimized = () => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const searchParams = useSearchParams();
  const modeParam = (searchParams.get('mode') || searchParams.get('presentation') || '').toLowerCase();
  const isPresentation = modeParam === 'presentation' || modeParam === '1' || modeParam === 'true';
  const bgParam = (searchParams.get('bg') || searchParams.get('video') || '').toLowerCase();
  const useVideoBg = bgParam === 'video' || bgParam === '1' || bgParam === 'true';

  // Detect mobile device
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Slide navigation (presentation mode)
  const [activeSlide, setActiveSlide] = useState(0);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const registerSlideRef = (idx: number) => (el: HTMLDivElement | null) => {
    slideRefs.current[idx] = el;
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const demoMessages = [
    { agent: 'CEO AI', message: '新規事業の戦略的価値は高いと判断します。ただし、実行フェーズでの組織体制構築が成功の鍵となります。' },
    { agent: '悪魔の代弁者', message: 'CEOの楽観的な見解に異議があります。競合の反撃シナリオを3つ想定すべきです。特に価格戦争のリスクは...' },
    { agent: 'CFO AI', message: '悪魔の代弁者の指摘は重要です。価格戦争になった場合、営業利益率が5%低下し、投資回収期間が2年延長される可能性があります。' },
  ];

  const features = [
    {
      icon: <TrophyIcon className="w-6 h-6 md:w-8 md:h-8" />,
      title: "AI同士の相互議論",
      description: "6人のAI軍師たちが互いに意見を交換し、深い洞察を生み出す"
    },
    {
      icon: <UserGroupIcon className="w-6 h-6 md:w-8 md:h-8" />,
      title: "明確な役割分担",
      description: "各AI軍師が専門領域を持ち、ChatGPT単体では得られない専門的議論を展開"
    },
    {
      icon: <ClockIcon className="w-6 h-6 md:w-8 md:h-8" />,
      title: "リスクの早期発見",
      description: "悪魔の代弁者を含む多角的議論で、見逃しがちなリスクを事前に察知"
    },
    {
      icon: <CurrencyDollarIcon className="w-6 h-6 md:w-8 md:h-8" />,
      title: "革新的な戦略立案",
      description: "異なる視点の衝突から生まれる、これまでにない経営戦略の発見"
    }
  ];

  const plans = [
    {
      name: "シンプル",
      price: "¥9,800",
      period: "/月",
      description: "個人・小規模事業者向け",
      features: [
        "月30回利用可能",
        "基本的な6エージェント",
        "概要版レポート",
        "議論履歴保存",
        "メールサポート"
      ],
      cta: "始める",
      highlight: false
    },
    {
      name: "ベーシック",
      price: "¥29,800",
      period: "/月",
      description: "中小企業向け",
      features: [
        "月100回利用可能",
        "全エージェント利用",
        "詳細版レポート",
        "ビジュアルレポート",
        "チャットサポート"
      ],
      cta: "今すぐ始める",
      highlight: true
    },
    {
      name: "プロフェッショナル",
      price: "¥49,800", 
      period: "/月",
      description: "中堅・大企業向け",
      features: [
        "無制限利用",
        "優先処理",
        "経営データ学習機能",
        "カスタムAI軍師作成",
        "専任サポート担当"
      ],
      cta: "お問い合わせ",
      highlight: false
    }
  ];

  return (
    <div className={`${isPresentation && !isMobile ? 'h-screen overflow-y-scroll snap-y snap-mandatory' : 'min-h-screen'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white relative`}>
      {/* Background video with reduced opacity for better readability */}
      {useVideoBg && (
        <>
          {/* Desktop Video */}
          <video
            className="pointer-events-none fixed inset-0 z-0 w-full h-full object-cover hidden md:block"
            src="/meeting-bg.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            style={{ opacity: 0.25 }}
          />
          {/* Mobile Video - reduced opacity for better text contrast */}
          <video
            className="pointer-events-none fixed inset-0 z-0 w-full h-full object-cover block md:hidden"
            src="/videos/20250827_2258_Confident_CEOs_Vision_storyboard_01k3nx3ktmeqnb1jhk9dxbmtth.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            style={{ opacity: 0.20 }}
          />
        </>
      )}
      
      {/* Background overlays for better contrast */}
      <div className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-900/60" />
      
      <div className="relative z-10">
      {/* Navigation - Mobile optimized */}
      <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex items-center">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(255,255,255,0.2)]">
                AI経営軍師
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/faq" className="text-slate-300 hover:text-white transition-colors text-sm md:text-base">FAQ</Link>
              <Button className="text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2 min-h-[36px] md:min-h-[40px]">
                ログイン
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Mobile optimized */}
      <motion.section 
        className="pt-24 pb-16 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Main title with better mobile sizing */}
          <motion.h1 
            className="leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)]">
              24時間の経営参謀
            </span>
            <span className="block text-base sm:text-lg md:text-2xl lg:text-3xl font-light mb-1 text-slate-300 tracking-wide">
              誰にも相談できない
            </span>
            <span className="block text-base sm:text-lg md:text-2xl lg:text-3xl font-light mb-6 text-slate-300 tracking-wide">
              そんな経営者のために
            </span>
            <span className="block text-lg sm:text-xl md:text-3xl lg:text-4xl mb-1 font-medium text-white">
              6人のエキスパートが
            </span>
            <span className="block text-lg sm:text-xl md:text-3xl lg:text-4xl mb-2 font-medium text-white">
              24時間365日議論を重ね
            </span>
            <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]">
              答えを導き出す
            </span>
          </motion.h1>
          
          {/* CTA buttons with proper touch targets */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center mb-12 md:mb-24 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link href="/demo" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto text-base md:text-lg px-6 py-3 md:px-10 md:py-5 min-h-[48px] hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl"
              >
                デモを体験
                <ArrowRightIcon className="w-5 h-5 md:w-6 md:h-6 ml-3" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto text-base md:text-lg px-6 py-3 md:px-10 md:py-5 min-h-[48px] hover:scale-105 active:scale-95 transition-all duration-300"
              onClick={() => setActiveDemo((prev) => (prev + 1) % demoMessages.length)}
            >
              <PlayIcon className="w-5 h-5 md:w-6 md:h-6 mr-3" />
              AIの会話を見る
            </Button>
          </motion.div>

          {/* Scroll indicator for mobile */}
          {isMobile && (
            <motion.div 
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronDownIcon className="w-8 h-8 text-slate-400" />
            </motion.div>
          )}

          {/* Live Demo Preview - Simplified for mobile */}
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Card className="p-4 sm:p-6 bg-slate-800/60 backdrop-blur-sm border-slate-700">
              <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4 text-slate-200 text-center">
                AI軍師たちによる議論の様子
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-3 text-center">
                ※実際の議論は「デモを体験」からご覧いただけます
              </p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDemo}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-start space-x-3"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                    {demoMessages[activeDemo].agent.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs sm:text-sm text-slate-300 mb-1">
                      {demoMessages[activeDemo].agent}
                    </div>
                    <div className="text-slate-200 leading-relaxed text-sm sm:text-base">
                      {demoMessages[activeDemo].message}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* Problem Section - Mobile optimized */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              こんなお悩み<span className="text-red-400">ありませんか？</span>
            </h2>
            <div className="grid gap-4 md:gap-8 max-w-4xl mx-auto">
              {[
                "ChatGPTに相談しても、一面的な回答しか得られない",
                "ビジネスの重要な決定に、単一AIの意見では不安",
                "多角的な視点からのリスク分析が欲しい", 
                "専門家同士の議論から生まれる新しい発想が必要"
              ].map((problem, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-3 p-3 md:p-4 rounded-lg bg-red-900/20 border border-red-800/30"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-400 font-bold text-sm">!</span>
                  </div>
                  <span className="text-slate-200 text-sm md:text-base leading-relaxed">{problem}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Mobile optimized grid */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8" id="features">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              <span className="text-green-400">6人のAI経営軍師の議論</span>が解決
            </h2>
            <p className="text-base md:text-xl text-slate-300 max-w-3xl mx-auto">
              18種類のAI経営軍師から課題に最適な6名を選び、相互議論で新たな戦略を発見
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="p-5 md:p-6 h-full bg-gradient-to-b from-slate-800/50 to-slate-900/50 border-slate-700 hover:border-blue-500/50 transition-colors">
                  <div className="text-blue-400 mb-3 md:mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Mobile optimized */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8" id="pricing">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              シンプルな<span className="text-green-400">料金体系</span>
            </h2>
            <p className="text-base md:text-xl text-slate-300 max-w-3xl mx-auto">
              あなたのビジネス規模に合わせて最適なプランをお選びください
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className={`p-6 md:p-8 h-full ${
                  plan.highlight 
                    ? 'border-blue-500 bg-gradient-to-b from-blue-900/20 to-purple-900/20 scale-105' 
                    : 'border-slate-700 bg-slate-800/50'
                }`}>
                  {plan.highlight && (
                    <div className="text-center mb-4">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                        人気No.1
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6 md:mb-8">
                    <h3 className="text-xl md:text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-3xl md:text-4xl font-bold">{plan.price}</span>
                      <span className="text-slate-400 ml-1 text-sm md:text-base">{plan.period}</span>
                    </div>
                    <p className="text-slate-400 text-sm md:text-base">{plan.description}</p>
                  </div>

                  <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-200 text-sm md:text-base">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full min-h-[44px] active:scale-95 transition-all ${
                      plan.highlight 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile optimized */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              今すぐ始めませんか？
            </h2>
            <p className="text-base md:text-xl text-slate-300 mb-8 md:mb-12">
              本格的なAI経営会議で意思決定を革新
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button size="lg" className="text-base md:text-xl px-8 py-4 md:px-12 md:py-6 min-h-[48px] active:scale-95 transition-all">
                  デモを体験する
                  <ArrowRightIcon className="w-5 h-5 md:w-6 md:h-6 ml-2" />
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" className="text-base md:text-xl px-8 py-4 md:px-12 md:py-6 min-h-[48px] active:scale-95 transition-all">
                  ログイン
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Mobile optimized */}
      <footer className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI経営軍師
              </h3>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                世界水準のAI役員会議で、
                あなたの意思決定を革新する
              </p>
            </div>
            <div>
              <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-white">製品</h4>
              <ul className="space-y-2 text-slate-400 text-sm md:text-base">
                <li><a href="#features" className="hover:text-white transition-colors">機能</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">料金</a></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">デモ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-white">サポート</h4>
              <ul className="space-y-2 text-slate-400 text-sm md:text-base">
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">お問い合わせ</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">ヘルプ</a></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-white">会社情報</h4>
              <ul className="space-y-1 text-slate-400 text-xs md:text-sm">
                <li>合同会社Leadfive</li>
                <li>〒530-0001</li>
                <li>大阪府大阪市北区梅田１-１３-１</li>
                <li>大阪梅田ツインタワーズ・サウス１５階</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-6 md:pt-8 text-center text-slate-400 text-xs md:text-sm">
            <p>&copy; 2025 合同会社Leadfive. All rights reserved.</p>
            <div className="flex justify-center space-x-4 mt-3">
              <a href="#" className="hover:text-white transition-colors">利用規約</a>
              <a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a>
            </div>
          </div>
        </div>
      </footer>

      </div>
    </div>
  );
};

export default LandingPageMobileOptimized;