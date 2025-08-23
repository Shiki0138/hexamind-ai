'use client'

import React, { useState } from 'react'
import HomeScreen from '../components/screens/HomeScreen'
import AgentSelectionScreen from '../components/screens/AgentSelectionScreen'
import QuestionInputScreen from '../components/screens/QuestionInputScreen'
import DiscussionScreen from '../components/screens/DiscussionScreen'
import RealDiscussionScreen from '../components/screens/RealDiscussionScreen'
import PremiumDiscussionScreen from '../components/screens/PremiumDiscussionScreen'
import ResultsScreen from '../components/screens/ResultsScreen'

type Screen = 'home' | 'agents' | 'question' | 'discussion' | 'results'

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home')
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [discussionTopic, setDiscussionTopic] = useState('')
  const [useRealAI, setUseRealAI] = useState(false)
  const [usePremium, setUsePremium] = useState(false)
  const [thinkingMode, setThinkingMode] = useState<'normal' | 'deepthink' | 'creative' | 'critical'>('normal')

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
            onViewHistory={() => {}}
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
            onSubmit={handleQuestionSubmitted}
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
          />
        ) : useRealAI ? (
          <RealDiscussionScreen
            topic={discussionTopic}
            agents={selectedAgents}
            thinkingMode={thinkingMode}
            onComplete={handleDiscussionComplete}
            openaiApiKey={process.env.NEXT_PUBLIC_OPENAI_API_KEY}
          />
        ) : (
          <DiscussionScreen
            topic={discussionTopic}
            agents={selectedAgents}
            onComplete={handleDiscussionComplete}
          />
        )
      case 'results':
        return (
          <ResultsScreen
            onNewDiscussion={handleNewDiscussion}
            onHome={() => navigateToScreen('home')}
          />
        )
      default:
        return <HomeScreen onStartDiscussion={() => navigateToScreen('agents')} onViewHistory={() => {}} />
    }
  }

  return (
    <main className="min-h-screen bg-slate-900">
      {renderScreen()}
    </main>
  )
}