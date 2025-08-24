'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface SubscriptionSetupScreenProps {
  onBack: () => void;
  onComplete: (config: any) => void;
}

export default function SubscriptionSetupScreen({ onBack, onComplete }: SubscriptionSetupScreenProps) {
  const [config, setConfig] = useState({
    claudePro: {
      enabled: false,
      method: 'browser' as 'browser' | 'api',
      sessionCookie: '',
      apiKey: ''
    },
    chatGPTPlus: {
      enabled: false,
      method: 'browser' as 'browser' | 'api',
      sessionCookie: '',
      apiKey: ''
    },
    geminiUltra: {
      enabled: false,
      method: 'browser' as 'browser' | 'api',
      sessionCookie: '',
      apiKey: ''
    }
  });

  const services = [
    {
      id: 'claudePro',
      name: 'Claude Pro',
      description: '月額$20で高度な推論能力',
      color: 'bg-purple-500',
      icon: '🧠'
    },
    {
      id: 'chatGPTPlus',
      name: 'ChatGPT Plus',
      description: '月額$20でGPT-4アクセス',
      color: 'bg-green-500',
      icon: '💬'
    },
    {
      id: 'geminiUltra',
      name: 'Gemini Ultra',
      description: '月額$19.99で最先端AI',
      color: 'bg-blue-500',
      icon: '✨'
    }
  ];

  const handleToggleService = (serviceId: string) => {
    setConfig(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId as keyof typeof prev],
        enabled: !prev[serviceId as keyof typeof prev].enabled
      }
    }));
  };

  const handleMethodChange = (serviceId: string, method: 'browser' | 'api') => {
    setConfig(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId as keyof typeof prev],
        method
      }
    }));
  };

  const handleSave = () => {
    // 設定を保存
    localStorage.setItem('hexamind_subscription_config', JSON.stringify(config));
    onComplete(config);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-8"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* ヘッダー */}
        <header className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
          >
            戻る
          </Button>
          <h1 className="flex-1 text-xl font-bold text-gray-900">
            サブスクリプション設定
          </h1>
        </header>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">利用可能なサービス</h2>
          <p className="text-sm text-gray-600 mb-6">
            お持ちのサブスクリプションを設定してください。
            ブラウザ自動化またはAPIキーのいずれかの方法で連携できます。
          </p>

          <div className="space-y-4">
            {services.map(service => {
              const serviceConfig = config[service.id as keyof typeof config];
              return (
                <Card key={service.id} className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{service.icon}</span>
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleService(service.id)}
                      className={`p-2 rounded-full transition-colors ${
                        serviceConfig.enabled 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {serviceConfig.enabled ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <XCircleIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {serviceConfig.enabled && (
                    <div className="space-y-3 pt-3 border-t">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          連携方法
                        </label>
                        <div className="mt-1 flex space-x-2">
                          <button
                            onClick={() => handleMethodChange(service.id, 'browser')}
                            className={`px-3 py-1 text-sm rounded ${
                              serviceConfig.method === 'browser'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            ブラウザ自動化
                          </button>
                          <button
                            onClick={() => handleMethodChange(service.id, 'api')}
                            className={`px-3 py-1 text-sm rounded ${
                              serviceConfig.method === 'api'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            APIキー
                          </button>
                        </div>
                      </div>

                      {serviceConfig.method === 'browser' ? (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600">
                            ブラウザでログイン後、開発者ツールから
                            セッションCookieを取得して貼り付けてください。
                          </p>
                          <textarea
                            placeholder="セッションCookie"
                            className="w-full p-2 text-sm border rounded"
                            rows={2}
                            value={serviceConfig.sessionCookie}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              [service.id]: {
                                ...prev[service.id as keyof typeof prev],
                                sessionCookie: e.target.value
                              }
                            }))}
                          />
                        </div>
                      ) : (
                        <div>
                          <input
                            type="password"
                            placeholder="APIキー"
                            className="w-full p-2 text-sm border rounded"
                            value={serviceConfig.apiKey}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              [service.id]: {
                                ...prev[service.id as keyof typeof prev],
                                apiKey: e.target.value
                              }
                            }))}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </Card>

        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <h3 className="font-medium text-yellow-800 mb-2">重要な注意事項</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• サブスクリプションの利用制限内で動作します</li>
            <li>• ブラウザ自動化は応答が遅くなる場合があります</li>
            <li>• APIキーを使用する場合は別途料金が発生します</li>
            <li>• セッション情報は安全に暗号化して保存されます</li>
          </ul>
        </Card>

        <Button
          className="w-full"
          onClick={handleSave}
          disabled={!Object.values(config).some(c => c.enabled)}
        >
          設定を保存
        </Button>
      </div>
    </motion.div>
  );
}