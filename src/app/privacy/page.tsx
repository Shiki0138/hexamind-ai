import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | Night Shift AI',
  description: 'Night Shift AIにおけるプライバシーポリシーと個人情報の取り扱いについて',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">プライバシーポリシー</h1>
        
        <div className="bg-gray-800 rounded-lg p-8 space-y-8">
          <section>
            <p className="text-gray-300 mb-6">
              最終更新日: 2025年8月23日
            </p>
            <p className="text-gray-300 mb-6">
              Night Shift AI（以下「当サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。
              本プライバシーポリシーは、当サービスにおける個人情報の収集、使用、保護について説明します。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">1. 収集する情報</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-xl font-medium mb-2">1.1 アカウント情報</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>メールアドレス</li>
                  <li>プロフィール情報（名前、アバターなど）</li>
                  <li>認証に関する情報</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">1.2 使用データ</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>AIディスカッションの利用履歴</li>
                  <li>サービスの利用パターン</li>
                  <li>エラーログとパフォーマンスデータ</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">1.3 技術的情報</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>IPアドレス</li>
                  <li>ブラウザ情報</li>
                  <li>デバイス情報</li>
                  <li>クッキー</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">2. 情報の使用目的</h2>
            <div className="text-gray-300 space-y-2">
              <p>収集した情報は以下の目的で使用します：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>サービスの提供と運営</li>
                <li>ユーザーサポートの提供</li>
                <li>サービスの改善と新機能の開発</li>
                <li>セキュリティの維持と不正利用の防止</li>
                <li>法的義務の履行</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">3. AIディスカッションデータの取り扱い</h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">3.1 ディスカッション内容</h3>
                <p>
                  AIとの対話内容は、サービス改善の目的で一時的に保存される場合がありますが、
                  個人を特定できない形で処理され、機密性の高い情報は適切に保護されます。
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">3.2 データの保持期間</h3>
                <p>
                  ディスカッションデータは、法的義務や正当な業務上の理由がない限り、
                  30日以内に削除されます。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">4. 第三者との情報共有</h2>
            <div className="text-gray-300 space-y-4">
              <p>以下の場合を除き、個人情報を第三者と共有することはありません：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>ユーザーの明示的な同意がある場合</li>
                <li>法的要求に基づく場合</li>
                <li>サービス提供に必要な信頼できるパートナー（暗号化された形で）</li>
                <li>当社の権利、財産、安全を保護するために必要な場合</li>
              </ul>
              <div className="mt-4">
                <h3 className="text-xl font-medium mb-2">4.1 AIサービスプロバイダー</h3>
                <p>
                  OpenAI、Claude、Geminiなどのサービスは、それぞれのプライバシーポリシーに従って
                  データを処理します。詳細は各サービスの規約をご確認ください。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">5. セキュリティ</h2>
            <div className="text-gray-300 space-y-2">
              <p>
                当サービスは、適切な技術的・物理的・管理的セーフガードを実装して、
                個人情報を不正アクセス、開示、改ざん、破壊から保護しています。
              </p>
              <ul className="list-disc list-inside space-y-1 mt-4">
                <li>SSL/TLS暗号化通信</li>
                <li>アクセス制御とレート制限</li>
                <li>定期的なセキュリティ監査</li>
                <li>データの最小限の収集と保持</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">6. ユーザーの権利</h2>
            <div className="text-gray-300 space-y-2">
              <p>ユーザーは以下の権利を有します：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>個人情報の開示、訂正、削除の請求</li>
                <li>データポータビリティの権利</li>
                <li>処理の制限または異議申し立て</li>
                <li>同意の撤回</li>
              </ul>
              <p className="mt-4">
                これらの権利を行使する場合は、サポートチームまでご連絡ください。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">7. クッキー</h2>
            <div className="text-gray-300 space-y-2">
              <p>
                当サービスは、サービスの機能向上とユーザー体験の改善のためにクッキーを使用します。
                必要に応じてブラウザの設定でクッキーを無効にできますが、
                一部の機能が正常に動作しない場合があります。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">8. 国際的なデータ転送</h2>
            <div className="text-gray-300">
              <p>
                当サービスは国際的に提供されており、データは適切なセキュリティ措置の下で
                国境を越えて転送される場合があります。データは適用される法律に従って保護されます。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">9. 未成年者</h2>
            <div className="text-gray-300">
              <p>
                当サービスは13歳未満の子供を対象としていません。
                13歳未満の子供から意図的に個人情報を収集することはありません。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">10. ポリシーの更新</h2>
            <div className="text-gray-300">
              <p>
                本プライバシーポリシーは必要に応じて更新される場合があります。
                重要な変更がある場合は、サービス内での通知またはメールにてお知らせします。
                継続してサービスをご利用いただくことで、更新されたポリシーに同意したものとみなされます。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">11. お問い合わせ</h2>
            <div className="text-gray-300">
              <p>
                本プライバシーポリシーに関するご質問やご意見がございましたら、
                以下の連絡先までお問い合わせください：
              </p>
              <div className="mt-4 p-4 bg-gray-700 rounded">
                <p><strong>Night Shift AI サポートチーム</strong></p>
                <p>Email: privacy@nightshift-ai.com</p>
                <p>（実際のメールアドレスに置き換えてください）</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center">
          <a 
            href="/" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ホームに戻る
          </a>
        </div>
      </div>
    </div>
  );
}