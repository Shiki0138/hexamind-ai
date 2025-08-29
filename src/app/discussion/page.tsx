'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ThinkingMode } from '@/lib/ai-agents';
import { getSelectableAgents } from '@/lib/selectable-agents';
import { TIER_LIMITS, UserTier } from '@/lib/auth-system';
import RealDiscussionScreen from '@/components/screens/RealDiscussionScreen';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

export default function DiscussionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<'setup' | 'discussion' | 'completed'>('setup');
  const [topic, setTopic] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [thinkingMode, setThinkingMode] = useState<ThinkingMode>('normal');
  const [domainProfile, setDomainProfile] = useState<'none' | 'marketing' | 'legal' | 'data_analytics'>('none');

  // Convert AI_AGENTS object to array and add colors
  const agentColors: Record<string, string> = {
    'ceo': 'bg-purple-500',
    'cfo': 'bg-green-500',
    'cmo': 'bg-blue-500',
    'cto': 'bg-orange-500',
    'coo': 'bg-red-500',
    'devil': 'bg-gray-700',
    'cso': 'bg-emerald-600',
    'cio': 'bg-teal-600',
    'cxo': 'bg-pink-600',
    'cbo': 'bg-indigo-600',
    'cdo': 'bg-yellow-600',
    'caio': 'bg-cyan-600'
  };
  
  const AI_AGENTS = getSelectableAgents().map(agent => ({
    ...agent,
    color: agentColors[agent.id] || 'bg-indigo-500'
  }));

  // 日本語の担当名（英語名と併記用）
  const JA_ROLE: Record<string, string> = {
    ceo: '経営戦略担当',
    cfo: '財務・投資担当',
    cmo: 'マーケティング担当',
    cto: '技術戦略担当',
    coo: '事業運営担当',
    devil: '反証・リスク担当',
    cso: '企業戦略担当',
    cio: '投資・M&A担当',
    cxo: '顧客体験担当',
    cbo: 'ブランド戦略担当',
    cdo: 'デジタル変革担当',
    caio: 'AI戦略担当'
  };

  // Default pre-filled question (same as demo)
  const defaultTopic = '新規ECプラットフォーム事業への参入を検討しています。初期投資3億円で、3年後に市場シェア10%を目指すことは現実的でしょうか？';

  // Authentication check
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            ログインが必要です
          </h1>
          <p className="text-gray-300 mb-8">
            ディスカッションを開始するには、サインインしてください。
          </p>
          <Button onClick={() => router.push('/auth/signin')}>
            サインイン
          </Button>
        </div>
      </div>
    );
  }

  const handleStartDiscussion = () => {
    if (!topic.trim()) {
      alert('質問を入力してください');
      return;
    }
    if (selectedAgents.length === 0) {
      alert('少なくとも1人のAI軍師を選択してください');
      return;
    }
    setStep('discussion');
  };

  const handleDiscussionComplete = () => {
    setStep('completed');
  };

  const handleNewDiscussion = () => {
    setTopic(defaultTopic);
    setSelectedAgents([]);
    setThinkingMode('normal');
    setStep('setup');
  };

  const currentTier = ((session?.user as any)?.tier || UserTier.FREE) as UserTier;
  const selectionCap = 6; // ディスカッション参加は常に最大6名
  const planMax = TIER_LIMITS[currentTier]?.maxAgents ?? selectionCap;
  const allowedMaxAgents = Math.min(selectionCap, planMax);

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => {
      if (prev.includes(agentId)) {
        return prev.filter(id => id !== agentId);
      }
      if (prev.length >= allowedMaxAgents) {
        alert(`このプランでは最大${allowedMaxAgents}名まで選択できます。`);
        return prev;
      }
      return [...prev, agentId];
    });
  };

  if (step === 'discussion') {
    return (
      <RealDiscussionScreen
        topic={topic}
        agents={selectedAgents}
        thinkingMode={thinkingMode}
        domainProfile={domainProfile}
        onComplete={handleDiscussionComplete}
        onHome={() => router.push('/dashboard')}
        onNewDiscussion={handleNewDiscussion}
        userId={session?.user?.id}
        userTier={(session?.user as any)?.tier || 'free'}
      />
    );
  }

  if (step === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-8"
          >
            <h1 className="text-3xl font-bold text-white mb-4">
              ディスカッション完了！
            </h1>
            <p className="text-gray-300 mb-8">
              AI軍師たちとの議論が終了しました。結果はダッシュボードの議論履歴からいつでも確認できます。
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleNewDiscussion}>
                新しいディスカッションを開始
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                ダッシュボードに戻る
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-300 hover:text-white transition-colors mr-4"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-1" />
            ダッシュボードに戻る
          </button>
          <h1 className="text-3xl font-bold text-white">
            新しいディスカッション
          </h1>
        </div>

        {/* User info */}
        <Card className="mb-6 bg-blue-900/20 border-blue-500/30">
          <div className="p-4">
            <p className="text-blue-200">
              <strong>ログイン中:</strong> {session?.user?.name || session?.user?.email}
              <span className="ml-4 text-sm bg-blue-500/20 px-2 py-1 rounded">
                {(session?.user as any)?.tier || 'free'}プラン
              </span>
            </p>
          </div>
        </Card>

        <div className="space-y-8">
          {/* Question Input */}
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              1. 相談したい内容を入力してください
            </h2>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={defaultTopic}
              className="w-full h-32 p-4 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none focus:outline-none focus:border-blue-500"
            />
            <Button
              onClick={() => setTopic(defaultTopic)}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              サンプル質問を使用
            </Button>
          </Card>

          {/* Agent Selection */}
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              2. 相談するAI軍師を選択してください ({selectedAgents.length}/{allowedMaxAgents})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {AI_AGENTS.map((agent) => (
                <motion.div
                  key={agent.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`p-4 cursor-pointer transition-all ${
                      selectedAgents.includes(agent.id)
                        ? 'bg-blue-900/40 border-blue-500'
                        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
                    }`}
                    onClick={() => toggleAgent(agent.id)}
                  >
                    <div className="flex items-start">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                          selectedAgents.includes(agent.id) ? agent.color : 'bg-slate-600'
                        }`}
                      >
                        {agent.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{agent.name} / {JA_ROLE[agent.id] || '担当'}</h3>
                        <p className="text-sm text-slate-300 mt-1">{agent.expertise.join('、')}</p>
                      </div>
                      {selectedAgents.includes(agent.id) && (
                        <div className="text-blue-400 text-xl">✓</div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Domain Profile Selection */}
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              3. ドメインプロファイルを選択してください（任意）
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {([
                { id: 'none', name: '指定なし', desc: '汎用の議論フレーム' },
                { id: 'marketing', name: 'マーケティング', desc: 'CAC/LTV/ROASなどを重視' },
                { id: 'legal', name: '法務', desc: '一次出典+IRACで検討' },
                { id: 'data_analytics', name: 'データ分析', desc: '手法妥当性と再現性' }
              ] as const).map((p) => (
                <Card
                  key={p.id}
                  className={`p-4 cursor-pointer transition-all ${
                    domainProfile === p.id
                      ? 'bg-indigo-900/40 border-indigo-500'
                      : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
                  }`}
                  onClick={() => setDomainProfile(p.id)}
                >
                  <h3 className="font-medium text-white">{p.name}</h3>
                  <p className="text-sm text-slate-300 mt-1">{p.desc}</p>
                </Card>
              ))}
            </div>
          </Card>

          {/* Thinking Mode Selection */}
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">4. 検討モードを選択してください</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {([
                { id: 'normal', name: '通常モード', description: 'バランスの取れた議論' },
                { id: 'creative', name: 'クリエイティブモード', description: '革新的なアイデア重視' },
                { id: 'conservative', name: '慎重モード', description: 'リスク分析重視' }
              ] as const).map((mode) => (
                <Card
                  key={mode.id}
                  className={`p-4 cursor-pointer transition-all ${
                    thinkingMode === mode.id
                      ? 'bg-green-900/40 border-green-500'
                      : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
                  }`}
                  onClick={() => setThinkingMode(mode.id)}
                >
                  <h3 className="font-medium text-white">{mode.name}</h3>
                  <p className="text-sm text-slate-300 mt-1">{mode.description}</p>
                  {thinkingMode === mode.id && (
                    <div className="text-green-400 text-xl mt-2">✓</div>
                  )}
                </Card>
              ))}
            </div>
          </Card>

          {/* Start Button */}
          <div className="text-center">
            <Button
              onClick={handleStartDiscussion}
              size="lg"
              disabled={!topic.trim() || selectedAgents.length === 0}
              className="min-h-[56px] px-8"
            >
              ディスカッションを開始する
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
