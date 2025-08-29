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
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

const LandingPage = () => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const modeParam = (searchParams.get('mode') || searchParams.get('presentation') || '').toLowerCase();
  // デフォルトでプレゼンテーションモードを有効に（PC・スマホ両方）
  const isPresentation = true;
  const bgParam = (searchParams.get('bg') || searchParams.get('video') || '').toLowerCase();
  const useVideoBg = bgParam === 'video' || bgParam === '1' || bgParam === 'true' || !searchParams.get('bg'); // デフォルトでtrue
  


  // Slide navigation (presentation mode)
  const [activeSlide, setActiveSlide] = useState(0);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const registerSlideRef = (idx: number) => (el: HTMLDivElement | null) => {
    slideRefs.current[idx] = el;
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Observe slides to update progress (presentation mode only)
  useEffect(() => {
    if (!isPresentation) return;
    const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[];
    if (slides.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = slides.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActiveSlide(idx);
          }
        });
      },
      { threshold: [0.6] }
    );
    slides.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isPresentation]);

  // Keyboard navigation (Up/Down) in presentation mode
  useEffect(() => {
    if (!isPresentation) return;
    const onKey = (e: KeyboardEvent) => {
      const keysNext = ['ArrowDown', 'PageDown', ' '];
      const keysPrev = ['ArrowUp', 'PageUp'];
      if (keysNext.includes(e.key)) {
        e.preventDefault();
        const next = Math.min(activeSlide + 1, slideRefs.current.length - 1);
        slideRefs.current[next]?.scrollIntoView({ behavior: 'smooth' });
      } else if (keysPrev.includes(e.key)) {
        e.preventDefault();
        const prev = Math.max(activeSlide - 1, 0);
        slideRefs.current[prev]?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPresentation, activeSlide]);

  const demoMessages = [
    { agent: 'CEO AI', message: '新規事業の戦略的価値は高いと判断します。ただし、実行フェーズでの組織体制構築が成功の鍵となります。' },
    { agent: '悪魔の代弁者', message: 'CEOの楽観的な見解に異議があります。競合の反撃シナリオを3つ想定すべきです。特に価格戦争のリスクは...' },
    { agent: 'CFO AI', message: '悪魔の代弁者の指摘は重要です。価格戦争になった場合、営業利益率が5%低下し、投資回収期間が2年延長される可能性があります。' },
  ];

  const features = [
    {
      icon: <TrophyIcon className="w-8 h-8" />,
      title: "AI同士の相互議論",
      description: "12人のAI軍師から選べる。選んだ6人が互いに意見を交換し、深い洞察を生み出す"
    },
    {
      icon: <UserGroupIcon className="w-8 h-8" />,
      title: "明確な役割分担",
      description: "各AI軍師が専門領域を持ち、ChatGPT単体では得られない専門的議論を展開"
    },
    {
      icon: <ClockIcon className="w-8 h-8" />,
      title: "リスクの早期発見",
      description: "悪魔の代弁者を含む多角的議論で、見逃しがちなリスクを事前に察知"
    },
    {
      icon: <CurrencyDollarIcon className="w-8 h-8" />,
      title: "革新的な戦略立案",
      description: "異なる視点の衝突から生まれる、これまでにない経営戦略の発見"
    }
  ];

  const useCases = [
    "新事業立ち上げの意思決定",
    "投資判断・M&A検討", 
    "マーケティング戦略策定",
    "DX推進・技術導入検討",
    "組織改革・人事戦略",
    "危機管理・リスク対応"
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
    <div className={`min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white relative flex flex-col ${isPresentation ? 'overflow-y-auto snap-y snap-mandatory h-screen' : ''}`}>
      {/* Background: image or video (faint) */}
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
            style={{ opacity: 0.35, objectPosition: '50% 20%' }}
          />
          {/* Mobile Video */}
          <video
            className="pointer-events-none fixed inset-0 z-0 w-full h-full object-cover block md:hidden"
            src="/videos/20250827_2258_Confident_CEOs_Vision_storyboard_01k3nx3ktmeqnb1jhk9dxbmtth.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            style={{ opacity: 0.5, objectPosition: '50% 30%' }}
          />
        </>
      )}
      
      {/* Additional Background Effects (light overlays) */}
      <div className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-b from-slate-900/30 via-slate-900/10 to-slate-900/40" />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-r from-slate-900/15 via-transparent to-slate-900/15" />
      {/* Center highlight to reveal image around hero */}
      <div
        className="pointer-events-none fixed inset-0 z-[2]"
        style={{
          background:
            'radial-gradient(60% 40% at 50% 32%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 60%, rgba(0,0,0,0.0) 100%)'
        }}
      />
      
      {/* Subtle animated overlay for depth */}
      <motion.div 
        className="fixed inset-0"
        animate={{ 
          opacity: [0.02, 0.05, 0.02]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
      </motion.div>
      <div className={`relative z-10 flex-1 ${isPresentation ? 'overflow-y-auto snap-y snap-mandatory h-screen' : ''}`}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/90 backdrop-blur-sm border-b border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI経営軍師
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-slate-300 hover:text-white transition-colors">機能</a>
                <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors">料金</Link>
                <Link href="/faq" className="text-slate-300 hover:text-white transition-colors">FAQ</Link>
                <Link href="/auth/signin">
                  <Button className="ml-4">ログイン</Button>
                </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Slide */}
      <div ref={registerSlideRef(0)} className={isPresentation ? 'min-h-screen snap-start snap-always flex items-center' : ''}>
      <motion.section 
        className={`${isPresentation ? 'w-full pt-32 pb-20' : 'pt-40 pb-32'} px-4 sm:px-6 lg:px-8`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-5xl mx-auto text-center px-4">
          <motion.h1 
            className="leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 tracking-tight">
              24時間の経営参謀
            </span>
            <span className="block text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl font-light mb-2 text-slate-400 tracking-wide">
              誰にも相談できない
            </span>
            <span className="block text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl font-light mb-10 text-slate-400 tracking-wide">
              そんな経営者のために
            </span>
            <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-2 font-medium">
              12人から選んだ6人のエキスパートが
            </span>
            <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-3 font-medium">
              24時間365日議論を重ね
            </span>
            <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              答えを導き出す
            </span>
          </motion.h1>
          

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mt-8 mb-32 md:mb-32 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link href="/demo" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base md:text-lg px-6 py-4 sm:px-8 sm:py-4 md:px-10 md:py-5 hover:scale-105 transition-all duration-300 shadow-xl">
                無料で試してみる
                <ArrowRightIcon className="w-5 h-5 md:w-6 md:h-6 ml-3" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto text-base md:text-lg px-6 py-4 sm:px-8 sm:py-4 md:px-10 md:py-5 hover:scale-105 transition-all duration-300"
              onClick={() => setActiveDemo((prev) => (prev + 1) % demoMessages.length)}
            >
              <PlayIcon className="w-5 h-5 md:w-6 md:h-6 mr-3" />
              AIの会話を見る
            </Button>
          </motion.div>

          {/* Live Demo Preview - デスクトップでのみ表示、モバイルでは2番目のスライドに移動 */}
          {!isPresentation && (
            <motion.div 
              className="max-w-4xl mx-auto px-4 hidden md:block"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Card className="p-4 sm:p-6 bg-slate-800/50 border-slate-700">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-slate-200 text-center">AI軍師たちによる議論の様子</h3>
                <p className="text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4 text-center">※実際の議論の全体像は「デモを体験」からご覧いただけます</p>
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
          )}
          
          {/* スクロールインジケーター */}
          <motion.div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </div>
      </motion.section>
      </div>

      {/* AI Demo Slide */}
      {isPresentation && (
        <div ref={registerSlideRef(1)} className="min-h-screen snap-start snap-always flex items-center">
          <section className="w-full py-16 px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="max-w-4xl mx-auto px-4"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-6 text-center">AI軍師たちによる議論の様子</h2>
              <Card className="p-4 sm:p-6 bg-slate-800/50 border-slate-700">
                <p className="text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4 text-center">※実際の議論の全体像は「デモを体験」からご覧いただけます</p>
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
              <div className="mt-4 flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setActiveDemo((prev) => (prev + 1) % demoMessages.length)}
                >
                  <PlayIcon className="w-4 h-4 mr-2" />
                  次の会話を見る
                </Button>
              </div>
            </motion.div>
          </section>
        </div>
      )}

      {/* Problem Slide */}
      <div ref={registerSlideRef(2)} className={isPresentation ? 'min-h-screen snap-start snap-always flex items-center' : ''}>
      <section className={`${isPresentation ? 'w-full py-16' : 'py-20'} px-4 sm:px-6 lg:px-8 bg-slate-800/30`}>
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              <span className="block sm:inline">こんなお悩み</span>
              <span className="text-red-400 block sm:inline">ありませんか？</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                "ChatGPTに相談しても、一面的な回答しか得られない",
                "ビジネスの重要な決定に、単一AIの意見では不安",
                "多角的な視点からのリスク分析が欲しい", 
                "専門家同士の議論から生まれる新しい発想が必要"
              ].map((problem, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-4 p-4 rounded-lg bg-red-900/20 border border-red-800/30"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-400 font-bold">!</span>
                  </div>
                  <span className="text-slate-200">{problem}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      </div>

      {/* Solution Slide */}
      <div ref={registerSlideRef(3)} className={isPresentation ? 'min-h-screen snap-start snap-always flex items-center' : ''}>
      <section className={`${isPresentation ? 'w-full py-16' : 'py-20'} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-green-400 block mb-2">6人のAI経営軍師の議論で</span>
              <span className="block">解決します</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              CEO、CFO、CMO、CTO、COO、悪魔の代弁者など18種類のAI経営軍師から<br />
              課題に最適な6名を選び、相互に議論させることで単一AIでは見逃すリスクや<br />
              新たな戦略を発見します。
            </p>
            <div className="mt-4 text-sm text-slate-400">
              選択可能なAI経営軍師：CSO（戦略）、CIO（投資）、CXO（顧客体験）、CBO（ブランド）、<br />
              CDO（デジタル）、CAIO（AI）、CHRO（人事）、CLO（学習）、CSCO（サプライチェーン）、<br />
              CRO（リスク管理）、CCO（コンプライアンス）、リサーチャー（リサーチ）など
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" id="features">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full bg-gradient-to-b from-slate-800/50 to-slate-900/50 border-slate-700 hover:border-blue-500/50 transition-colors">
                  <div className="text-blue-400 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </div>

      {/* Use Cases Slide */}
      <div ref={registerSlideRef(4)} className={isPresentation ? 'min-h-screen snap-start snap-always flex items-center' : ''}>
      <section className={`${isPresentation ? 'w-full py-16' : 'py-20'} px-4 sm:px-6 lg:px-8 bg-slate-800/30`}>
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              こんな<span className="text-green-400">使い方</span>がおすすめ
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              24時間365日稼働するAI軍師たちを最大限活用する方法
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="p-0 overflow-hidden bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 group-hover:scale-105">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src="/images/1.png"
                    alt="Night time executive planning"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <MoonIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">夜間自動議論</h3>
                  <p className="text-blue-300 font-semibold mb-3">寝る前に課題を投げかけ、朝に完璧な戦略を</p>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    夜寝る前に「新サービス戦略を検討したい」と投稿。夜中の間にAI軍師たちが徹底議論し、朝起きれば詳細なレポートが完成しています。
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              className="group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="p-0 overflow-hidden bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-all duration-300 group-hover:scale-105">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src="/images/2.png"
                    alt="Urgent business meeting"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                      <BoltIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">緊急商談対策</h3>
                  <p className="text-orange-300 font-semibold mb-3">重要な商談前に、即座に最適戦略を立案</p>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    明日の商談前に「競合A社に勝つ戦略」を依頼。15分で相手企業分析、価格戦略、想定質問対策を含む完璧な商談戦略が完成。
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              className="group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="p-0 overflow-hidden bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-all duration-300 group-hover:scale-105">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src="/images/3.png"
                    alt="Financial documents and reports"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                      <DocumentTextIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">株主総会準備</h3>
                  <p className="text-green-300 font-semibold mb-3">財務資料で想定質問への完璧な回答を</p>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    決算書類をアップロードし「株主総会対策」を依頼。CFO AIが財務分析、CEO AIが説明戦略を提案し、想定質問への回答まで準備完了。
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>

        </div>
      </section>
      </div>

      {/* Pricing Slide */}
      <div ref={registerSlideRef(5)} className={isPresentation ? 'min-h-screen snap-start snap-always flex items-center' : ''}>
      <section className={`${isPresentation ? 'w-full py-16' : 'py-20'} px-4 sm:px-6 lg:px-8`} id="pricing">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              シンプルな<span className="text-green-400">料金体系</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              あなたのビジネス規模に合わせて最適なプランをお選びください。
              全プランで同じ高品質なAI分析をご利用いただけます。
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className={`p-8 h-full ${
                  plan.highlight 
                    ? 'border-blue-500 bg-gradient-to-b from-blue-900/20 to-purple-900/20 scale-105' 
                    : 'border-slate-700 bg-slate-800/50'
                }`}>
                  {plan.highlight && (
                    <div className="text-center mb-4">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        人気No.1
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-slate-400 ml-1">{plan.period}</span>
                    </div>
                    <p className="text-slate-400">{plan.description}</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-200">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/contact">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      お問い合わせ
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </div>

      {/* CTA Section */}
      {/* CTA Slide */}
      <div ref={registerSlideRef(6)} className={isPresentation ? 'min-h-screen snap-start snap-always flex items-center' : ''}>
      <section className={`${isPresentation ? 'w-full py-16' : 'py-20'} px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20`}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              今すぐ始めませんか？
            </h2>
            <p className="text-xl text-slate-300 mb-12">
              本格的なAI経営会議で意思決定を革新
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button size="lg" className="text-base sm:text-lg md:text-xl px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 min-h-[48px]">
                  デモを体験する
                  <ArrowRightIcon className="w-5 h-5 md:w-6 md:h-6 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline" className="text-base sm:text-lg md:text-xl px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 min-h-[48px]">
                  ログイン
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      </div>

      {/* Footer */}

      {/* Presentation progress dots */}
      {isPresentation && (
        <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
          {[0,1,2,3,4,5,6,7].map((i) => (
            <button
              key={i}
              onClick={() => slideRefs.current[i]?.scrollIntoView({ behavior: 'smooth' })}
              className={`w-3 h-3 rounded-full transition-all ${activeSlide === i ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`}
              aria-label={`Go to slide ${i+1}`}
            />
          ))}
        </div>
      )}
      
      
      {/* Footer Slide */}
      <div ref={registerSlideRef(7)} className={isPresentation ? 'min-h-screen snap-start snap-always flex items-center' : ''}>
      <footer className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI経営軍師
              </h3>
              <p className="text-slate-400 leading-relaxed">
                世界水準のAI役員会議で、
                あなたの意思決定を革新する
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">製品</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">機能</a></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">料金</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">デモ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">サポート</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">お問い合わせ</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">デモを体験</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">会社情報</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>合同会社Leadfive</li>
                <li>〒530-0001</li>
                <li>大阪府大阪市北区梅田１-１３-１</li>
                <li>大阪梅田ツインタワーズ・サウス１５階</li>
                <li className="pt-2"><Link href="/terms" className="hover:text-white transition-colors">利用規約</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
            <p>&copy; 2025 合同会社Leadfive. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
      
      </div>
    </div>
  );
};

export default LandingPage;
