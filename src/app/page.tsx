'use client'

import React, { useState } from 'react'
import HomeScreen from '../components/screens/HomeScreen'
import AgentSelectionScreen from '../components/screens/AgentSelectionScreen'
import QuestionInputScreen from '../components/screens/QuestionInputScreen'
import DiscussionScreen from '../components/screens/DiscussionScreen'
import RealDiscussionScreen from '../components/screens/RealDiscussionScreen'
import PremiumDiscussionScreen from '../components/screens/PremiumDiscussionScreen'
import ResultsScreen from '../components/screens/ResultsScreen'
import HistoryScreen from '../components/screens/HistoryScreen'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { chatHistory } from '../lib/chat-history'

type Screen = 'home' | 'agents' | 'question' | 'discussion' | 'results' | 'history'

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home')
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [discussionTopic, setDiscussionTopic] = useState('')
  const [useRealAI, setUseRealAI] = useState(false)
  const [usePremium, setUsePremium] = useState(false)
  const [thinkingMode, setThinkingMode] = useState<'normal' | 'deepthink' | 'creative' | 'critical'>('normal')
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen)
  }

  const handleAgentsSelected = (agents: string[]) => {
    setSelectedAgents(agents)
    setCurrentScreen('question')
  }

  const handleQuestionSubmitted = (question: string, mode: any, selectedThinkingMode: any, realAI = false, premium = false) => {
    setDiscussionTopic(question)
    setThinkingMode(selectedThinkingMode)
    setUseRealAI(realAI)
    setUsePremium(premium)
    
    // 新しいセッションを作成
    const session = chatHistory.createSession(
      question,
      selectedAgents,
      selectedThinkingMode,
      mode,
      premium
    )
    setCurrentSessionId(session.id)
    
    setCurrentScreen('discussion')
  }

  const handleDiscussionComplete = () => {
    setCurrentScreen('results')
  }

  const handleNewDiscussion = () => {
    setSelectedAgents([])
    setDiscussionTopic('')
    setCurrentScreen('agents')
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onStartDiscussion={() => navigateToScreen('agents')}
            onViewHistory={() => navigateToScreen('history')}
          />
        )
      case 'agents':
        return (
          <AgentSelectionScreen
            onAgentsSelected={handleAgentsSelected}
            onBack={() => navigateToScreen('home')}
          />
        )
      case 'question':
        return (
          <QuestionInputScreen
            selectedAgents={selectedAgents}
            onStartDiscussion={handleQuestionSubmitted}
            onBack={() => navigateToScreen('agents')}
          />
        )
      case 'discussion':
        return usePremium ? (
          <PremiumDiscussionScreen
            topic={discussionTopic}
            agents={selectedAgents}
            thinkingMode={thinkingMode}
            onComplete={handleDiscussionComplete}
            sessionId={currentSessionId}
          />
        ) : useRealAI ? (
          <RealDiscussionScreen
            topic={discussionTopic}
            agents={selectedAgents}
            thinkingMode={thinkingMode}
            onComplete={handleDiscussionComplete}
            openaiApiKey={process.env.NEXT_PUBLIC_OPENAI_API_KEY}
            sessionId={currentSessionId}
          />
        ) : (
          <DiscussionScreen
            topic={discussionTopic}
            agents={selectedAgents}
            onComplete={handleDiscussionComplete}
            sessionId={currentSessionId}
          />
        )
      case 'results':
        return (
          <ResultsScreen
            onNewDiscussion={handleNewDiscussion}
            onHome={() => navigateToScreen('home')}
          />
        )
      case 'history':
        return (
          <HistoryScreen
            onBack={() => navigateToScreen('home')}
            onViewSession={(sessionId) => {
              // セッション詳細表示機能（今後実装）
              console.log('View session:', sessionId)
            }}
          />
        )
      default:
        return <HomeScreen onStartDiscussion={() => navigateToScreen('agents')} onViewHistory={() => navigateToScreen('history')} />
    }
  }

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-slate-900">
        {renderScreen()}
      </main>
    </ErrorBoundary>
  )
}