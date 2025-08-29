'use client';

import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PlusIcon, ClockIcon, UserGroupIcon, UserIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { DatabaseService } from '@/lib/database-adapter';
import { Discussion } from '@/lib/supabase';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface HomeScreenProps {
  onStartDiscussion: () => void;
  onViewHistory: () => void;
}

export default function HomeScreen({ 
  onStartDiscussion,
  onViewHistory
}: HomeScreenProps) {
  const { data: session, status } = useSession();
  const [recentDiscussions, setRecentDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [greeting, setGreeting] = useState('こんにちは');
  
  useEffect(() => {
    // クライアントサイドでのみ時間ベースの挨拶を設定
    const currentHour = new Date().getHours();
    const timeBasedGreeting = currentHour < 12 ? 'おはようございます' : 
                             currentHour < 18 ? 'こんにちは' : 'こんばんは';
    setGreeting(timeBasedGreeting);
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      loadRecentDiscussions();
    } else {
      setLoading(false);
    }
  }, [status, session]);

  const loadRecentDiscussions = async () => {
    try {
      const discussions = await DatabaseService.getDiscussionHistory(session?.user?.id || '', 3);
      setRecentDiscussions(discussions);
    } catch (error) {
      console.error('Failed to load recent discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mx-auto max-w-md space-y-6">
        {/* ヘッダー */}
        <motion.header 
          className="text-center"
          variants={itemVariants}
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex-1">
              HexaMind AI
            </h1>
            
            {status === 'authenticated' ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="ダッシュボード"
                >
                  <UserIcon className="h-6 w-6" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  サインイン
                </Link>
                <span className="text-gray-400">|</span>
                <Link
                  href="/auth/signup"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  登録
                </Link>
              </div>
            )}
          </div>
          
          <p className="text-gray-600">
            {greeting}
            {session?.user?.name && <span className="font-medium">、{session.user.name}さん</span>}
          </p>
          
          {status === 'authenticated' && (
            <div className="mt-2 text-sm text-gray-500">
              プラン: <span className="font-medium capitalize">
                {(session.user as any)?.tier || 'Free'}
              </span>
            </div>
          )}
        </motion.header>

        {/* メインアクションボタン */}
        <motion.div variants={itemVariants}>
          <Button 
            className="w-full h-16 text-lg shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            leftIcon={<UserGroupIcon className="h-6 w-6" />}
            onClick={onStartDiscussion}
          >
            新しい相談を始める
          </Button>
        </motion.div>

        {/* 最近の議論 */}
        <motion.section variants={itemVariants}>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            最近の議論
          </h2>
          <div className="space-y-3">
            {status === 'authenticated' ? (
              loading ? (
                <Card className="p-6 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">読み込み中...</p>
                </Card>
              ) : recentDiscussions.length > 0 ? (
                recentDiscussions.map((discussion) => (
                  <Card key={discussion.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {discussion.topic}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(discussion.created_at).toLocaleDateString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <div className="flex items-center mt-2 space-x-1">
                          {discussion.agents.slice(0, 3).map((agent, index) => (
                            <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {agent}
                            </span>
                          ))}
                          {discussion.agents.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{discussion.agents.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-3">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          discussion.status === 'completed' ? 'bg-green-500' : 
                          discussion.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}></span>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-6 text-center text-gray-500">
                  まだ議論がありません。<br />
                  上のボタンから始めてみましょう！
                </Card>
              )
            ) : (
              <Card className="p-6 text-center text-gray-500">
                <p className="mb-3">議論履歴を確認するには<br />サインインが必要です。</p>
                <Link
                  href="/auth/signin"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  サインイン
                </Link>
              </Card>
            )}
          </div>
        </motion.section>

        {/* クイックアクション */}
        <motion.div 
          className="grid grid-cols-2 gap-3"
          variants={itemVariants}
        >
          {status === 'authenticated' ? (
            <>
              <Button 
                variant="secondary"
                className="h-12"
                leftIcon={<ClockIcon className="h-5 w-5" />}
                onClick={onViewHistory}
              >
                履歴
              </Button>
              <Link href="/dashboard">
                <Button 
                  variant="secondary"
                  className="h-12 w-full"
                  leftIcon={<Cog6ToothIcon className="h-5 w-5" />}
                >
                  ダッシュボード
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button 
                  variant="secondary"
                  className="h-12 w-full"
                  leftIcon={<UserIcon className="h-5 w-5" />}
                >
                  サインイン
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button 
                  variant="secondary"
                  className="h-12 w-full"
                  leftIcon={<PlusIcon className="h-5 w-5" />}
                >
                  新規登録
                </Button>
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}