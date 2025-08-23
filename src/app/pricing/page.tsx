import SubscriptionManager from '@/components/subscription/SubscriptionManager';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            プランを選択
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            あなたのビジネスニーズに最適なプランを選択してください。
            6人の専門AIエージェントによる本格的な議論で、より良い意思決定をサポートします。
          </p>
        </div>

        {/* Features comparison */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Night Shift AI の特徴
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">6人の専門AI</h3>
              <p className="text-gray-600 text-sm">
                CEO、CFO、CMO、CTO、COO、悪魔の代弁者が多角的に議論
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">プレミアムAI統合</h3>
              <p className="text-gray-600 text-sm">
                Claude Pro、ChatGPT Plus、Gemini Ultraの最高品質AI
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">詳細分析</h3>
              <p className="text-gray-600 text-sm">
                議論結果の詳細分析とエクスポート機能
              </p>
            </div>
          </div>
        </div>

        {/* Subscription plans */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <SubscriptionManager showUpgradeOnly={true} />
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            よくある質問
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                プランはいつでも変更できますか？
              </h3>
              <p className="text-gray-600 text-sm">
                はい。プランの変更は次回請求サイクルから適用されます。
                アップグレードの場合は即座に適用され、差額は日割り計算されます。
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                無料プランでも使えますか？
              </h3>
              <p className="text-gray-600 text-sm">
                はい。無料プランでは月10回まで議論を利用できます。
                3人のエージェントと通常モードが利用可能です。
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                支払い方法は何が利用できますか？
              </h3>
              <p className="text-gray-600 text-sm">
                クレジットカード（Visa、Mastercard、American Express、JCB）、
                デビットカード、プリペイドカードが利用可能です。
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                エンタープライズプランの詳細は？
              </h3>
              <p className="text-gray-600 text-sm">
                無制限の議論、専用AI、SLA保証、カスタム対応、White Label機能、
                API提供が含まれます。詳細はお問い合わせください。
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            ご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
          <a
            href="mailto:support@nightshift-ai.com"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            support@nightshift-ai.com
          </a>
        </div>
      </div>
    </div>
  );
}