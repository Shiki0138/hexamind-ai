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
  TrophyIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const LandingPage = () => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const searchParams = useSearchParams();
  const modeParam = (searchParams.get('mode') || searchParams.get('presentation') || '').toLowerCase();
  const isPresentation = modeParam === 'presentation' || modeParam === '1' || modeParam === 'true' || !searchParams.get('mode'); // デフォルトでtrue
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
    { agent: 'CEO AI', message: '新市場参入について戦略的視点から分析します。TAM約50億円の市場で、競合優位性を確保するには...' },
    { agent: 'CFO AI', message: '財務的にはNPV約1.2億円、IRR18%で投資価値があります。ただし初期投資リスクを考慮すると...' },
    { agent: 'CMO AI', message: 'ターゲット顧客のペルソナ分析では、30-45歳のビジネスパーソンが最有望セグメントです...' },
  ];

  const features = [
    {
      icon: <TrophyIcon className="w-8 h-8" />,
      title: "世界水準の分析品質",
      description: "McKinsey、BCGレベルの戦略フレームワークと統計的分析（p < 0.05）"
    },
    {
      icon: <UserGroupIcon className="w-8 h-8" />,
      title: "6つの専門家視点",
      description: "CEO、CFO、CMO、CTO、COO、悪魔の代弁者による多角的分析"
    },
    {
      icon: <ClockIcon className="w-8 h-8" />,
      title: "即座の意思決定",
      description: "数分で包括的な分析レポートと実行可能なアクションプランを提供"
    },
    {
      icon: <CurrencyDollarIcon className="w-8 h-8" />,
      title: "圧倒的コスト効率",
      description: "従来のコンサルティングの1/100のコストで同等以上の品質を実現"
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
      name: "無料プラン",
      price: "¥0",
      period: "/月",
      description: "個人利用・お試し向け",
      features: [
        "月3回まで利用可能",
        "基本的な6エージェント",
        "概要版レポート",
        "メールサポート"
      ],
      cta: "無料で始める",
      highlight: false
    },
    {
      name: "ベーシック",
      price: "¥9,800",
      period: "/月",
      description: "小規模チーム向け",
      features: [
        "月50回利用可能",
        "全エージェント利用",
        "詳細版レポート",
        "議論履歴保存",
        "チャットサポート"
      ],
      cta: "14日間無料体験",
      highlight: true
    },
    {
      name: "プロフェッショナル",
      price: "¥29,800", 
      period: "/月",
      description: "成長企業向け",
      features: [
        "月200回利用可能",
        "優先処理",
        "カスタムエージェント",
        "API連携",
        "電話サポート"
      ],
      cta: "お問い合わせ",
      highlight: false
    }
  ];

  return (
    <div className={`${isPresentation ? 'h-screen overflow-y-scroll snap-y snap-mandatory' : 'min-h-screen'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden`}>
      {/* Background: image or video (faint) */}
      {useVideoBg ? (
        <video
          className="pointer-events-none fixed inset-0 z-0 w-full h-full object-cover"
          src="/meeting-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/meeting-bg.svg"
          aria-hidden="true"
          style={{ opacity: 0.35, objectPosition: '50% 20%' }}
        />
      ) : (
        <div
          className="pointer-events-none fixed inset-0 z-0 bg-center bg-cover bg-no-repeat"
          style={{
            backgroundImage: "url('/meeting-bg.svg')",
            opacity: 0.33,
            backgroundPosition: 'center 20%'
          }}
        />
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
      <div className="relative z-10">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/90 backdrop-blur-sm border-b border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                HexaMind AI
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">機能</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">料金</a>
              <a href="#faq" className="text-slate-300 hover:text-white transition-colors">FAQ</a>
              <Button className="ml-4">ログイン</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Slide */}
      <div ref={registerSlideRef(0)} className={isPresentation ? 'min-h-screen snap-start flex items-center' : ''}>
      <motion.section 
        className={`${isPresentation ? 'w-full pt-24 pb-16' : 'pt-32 pb-20'} px-4 sm:px-6 lg:px-8`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            世界トップレベルの
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI役員会議
            </span>
            があなたの意思決定を変える
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            McKinsey級の分析力を持つ6人のAI専門家による<br />
            <span className="text-blue-300 font-semibold">バーチャル役員会議</span>で、あらゆるビジネス課題を解決
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Button size="lg" className="text-lg px-8 py-4">
              無料で始める
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => setActiveDemo((prev) => (prev + 1) % demoMessages.length)}
            >
              <PlayIcon className="w-5 h-5 mr-2" />
              デモを見る
            </Button>
          </motion.div>

          {/* Live Demo Preview */}
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h3 className="text-lg font-semibold mb-4 text-slate-200">リアルタイム議論プレビュー</h3>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDemo}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-start space-x-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-sm">
                    {demoMessages[activeDemo].agent.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-slate-300 mb-1">
                      {demoMessages[activeDemo].agent}
                    </div>
                    <div className="text-slate-200 leading-relaxed">
                      {demoMessages[activeDemo].message}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>
      </motion.section>
      </div>

      {/* Problem Slide */}
      <div ref={registerSlideRef(1)} className={isPresentation ? 'min-h-screen snap-start flex items-center' : ''}>
      <section className={`${isPresentation ? 'w-full py-16' : 'py-20'} px-4 sm:px-6 lg:px-8 bg-slate-800/30`}>
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              こんなお悩み<span className="text-red-400">ありませんか？</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                "重要な意思決定を一人で抱え込んでしまう",
                "専門家の意見を聞きたいが、コンサルは高額",
                "短時間で多角的な分析が欲しい", 
                "データに基づく客観的な判断材料が不足"
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
      <div ref={registerSlideRef(2)} className={isPresentation ? 'min-h-screen snap-start flex items-center' : ''}>
      <section className={`${isPresentation ? 'w-full py-16' : 'py-20'} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-green-400">HexaMind AI</span>が解決します
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              世界水準のAI専門家チームが、あなたのビジネス課題を包括的に分析し、
              実行可能なソリューションを提案します。
            </p>
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
      <div ref={registerSlideRef(3)} className={isPresentation ? 'min-h-screen snap-start flex items-center' : ''}>
      <section className={`${isPresentation ? 'w-full py-16' : 'py-20'} px-4 sm:px-6 lg:px-8 bg-slate-800/30`}>
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              こんな場面で<span className="text-blue-400">活用</span>されています
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-4 p-6 rounded-lg bg-slate-800/50 border border-slate-700"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
                <span className="text-slate-200 font-medium">{useCase}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </div>

      {/* Pricing Slide */}
      <div ref={registerSlideRef(4)} className={isPresentation ? 'min-h-screen snap-start flex items-center' : ''}>
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

                  <Button 
                    className={`w-full ${
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
      </div>

      {/* CTA Section */}
      {/* CTA Slide */}
      <div ref={registerSlideRef(5)} className={isPresentation ? 'min-h-screen snap-start flex items-center' : ''}>
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
              30秒で登録完了・クレジットカード不要・無料体験3回付き
            </p>
            <Button size="lg" className="text-xl px-12 py-6">
              無料で始める
              <ArrowRightIcon className="w-6 h-6 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
      </div>

      {/* Footer */}
      {/* Footer (not a slide; stays after flow) */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                HexaMind AI
              </h3>
              <p className="text-slate-400 leading-relaxed">
                世界水準のAI役員会議で、
                あなたの意思決定を革新する
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">製品</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">機能</a></li>
                <li><a href="#" className="hover:text-white transition-colors">料金</a></li>
                <li><a href="#" className="hover:text-white transition-colors">デモ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">サポート</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">お問い合わせ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">導入事例</a></li>
                <li><a href="#" className="hover:text-white transition-colors">ヘルプセンター</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">会社情報</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">会社概要</a></li>
                <li><a href="#" className="hover:text-white transition-colors">利用規約</a></li>
                <li><a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a></li>
                <li><a href="#" className="hover:text-white transition-colors">セキュリティ</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
            <p>&copy; 2025 HexaMind AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Presentation progress dots */}
      {isPresentation && (
        <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
          {[0,1,2,3,4,5].map((i) => (
            <button
              key={i}
              onClick={() => slideRefs.current[i]?.scrollIntoView({ behavior: 'smooth' })}
              className={`w-3 h-3 rounded-full transition-all ${activeSlide === i ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`}
              aria-label={`Go to slide ${i+1}`}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default LandingPage;
