import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '利用規約 | AI経営軍師',
  description: 'AI経営軍師の利用規約と使用条件について',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">利用規約</h1>
        
        <div className="bg-gray-800 rounded-lg p-8 space-y-8">
          <section>
            <p className="text-gray-300 mb-6">
              最終更新日: 2025年8月23日
            </p>
            <p className="text-gray-300 mb-6">
              本利用規約（以下「本規約」）は、AI経営軍師（以下「当サービス」）の利用に関する条件を定めるものです。
              当サービスをご利用いただく前に、必ず本規約をお読みください。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">1. 利用規約への同意</h2>
            <div className="text-gray-300 space-y-2">
              <p>
                当サービスにアクセスまたは利用することにより、ユーザーは本規約に同意したものとみなされます。
                本規約に同意できない場合は、当サービスのご利用をお控えください。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">2. サービスの説明</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                AI経営軍師は、6人のAI経営エキスパートによる仮想的な経営会議シミュレーションを提供するサービスです。
                ユーザーは質問やトピックを入力し、AIエージェントによる多角的な議論を体験できます。
              </p>
              <div>
                <h3 className="text-xl font-medium mb-2">2.1 提供機能</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>AIエージェントによるディスカッション</li>
                  <li>複数の思考モード（標準、深思考、創造的、批判的）</li>
                  <li>カスタマイズ可能なエージェント選択</li>
                  <li>プレミアム機能（有料プラン）</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">3. アカウントと登録</h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">3.1 アカウント作成</h3>
                <p>
                  一部の機能をご利用いただくには、アカウントの作成が必要です。
                  正確で最新の情報を提供し、アカウントの安全性を維持する責任があります。
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">3.2 アカウントの責任</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>アカウント情報の機密保持</li>
                  <li>不正使用の即座の報告</li>
                  <li>アカウント活動に対する全責任</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">4. 利用制限と禁止事項</h2>
            <div className="text-gray-300 space-y-4">
              <p>以下の行為を禁止します：</p>
              <div>
                <h3 className="text-xl font-medium mb-2">4.1 コンテンツに関する禁止事項</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>違法、有害、脅迫的、嫌がらせ的なコンテンツ</li>
                  <li>ヘイトスピーチや差別的な内容</li>
                  <li>個人情報や機密情報の投稿</li>
                  <li>著作権や知的財産権を侵害する内容</li>
                  <li>スパムや迷惑な内容</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">4.2 技術的な禁止事項</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>サービスの不正利用やハッキング</li>
                  <li>自動化ツールやボットの使用</li>
                  <li>過度なAPIリクエストやサービス妨害</li>
                  <li>セキュリティ機能の回避</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">5. プレミアム機能と支払い</h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">5.1 プレミアムプラン</h3>
                <p>
                  有料のプレミアムプランでは、拡張機能や高度なAIディスカッション機能をご利用いただけます。
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">5.2 支払いと請求</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>料金は事前に明示されます</li>
                  <li>支払いは自動更新される場合があります</li>
                  <li>払い戻しはサービスポリシーに従います</li>
                  <li>料金の変更は事前に通知されます</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">6. 知的財産権</h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">6.1 当社の知的財産</h3>
                <p>
                  当サービスおよび関連する技術、コンテンツ、商標は当社または
                  そのライセンサーの知的財産です。
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">6.2 ユーザーコンテンツ</h3>
                <p>
                  ユーザーが投稿したコンテンツの著作権はユーザーに帰属しますが、
                  サービス提供に必要な範囲で使用許諾をいただきます。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">7. AIサービスの特性</h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">7.1 AI生成コンテンツ</h3>
                <p>
                  当サービスで生成される内容は人工知能によるものであり、
                  必ずしも正確性や完全性が保証されるものではありません。
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">7.2 専門的判断の代替不可</h3>
                <p>
                  AIによる回答は、法的、医学的、財務的な専門的助言の代替として
                  使用されるべきではありません。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">8. 免責事項</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                当サービスは「現状のまま」提供され、明示的または黙示的な保証は行いません。
                以下を含むがこれに限定されない事項について責任を負いません：
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>サービスの可用性や中断のない提供</li>
                <li>AIが生成する内容の正確性</li>
                <li>第三者のサービスや外部リンク</li>
                <li>データの損失や損害</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">9. 責任の制限</h2>
            <div className="text-gray-300 space-y-2">
              <p>
                法律で許可される最大限の範囲において、当社の責任は直接的、間接的、
                偶発的、結果的、懲罰的損害に及ばず、いかなる場合も支払われた
                料金の総額を超えないものとします。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">10. サービスの変更と終了</h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">10.1 サービス変更</h3>
                <p>
                  当社は事前通知なしにサービス内容を変更、追加、削除する権利を有します。
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">10.2 アカウント停止・削除</h3>
                <p>
                  本規約違反またはその他の理由により、アカウントを停止・削除する場合があります。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">11. 準拠法と紛争解決</h2>
            <div className="text-gray-300">
              <p>
                本規約は日本法に準拠し、サービスに関する紛争は大阪地方裁判所を
                専属的合意管轄裁判所として解決されるものとします。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">12. 規約の変更</h2>
            <div className="text-gray-300">
              <p>
                本規約は必要に応じて更新される場合があります。重要な変更については
                事前にユーザーに通知し、継続利用により変更に同意したものとみなされます。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">13. お問い合わせ</h2>
            <div className="text-gray-300">
              <p>
                本規約に関するご質問やご意見がございましたら、以下までお問い合わせください：
              </p>
              <div className="mt-4 p-4 bg-gray-700 rounded">
                <p><strong>AI経営軍師 サポートチーム</strong></p>
                <p>Email: leadfive.138@gmail.com</p>
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