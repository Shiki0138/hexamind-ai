import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '免責事項 | Night Shift AI',
  description: 'Night Shift AIの免責事項と重要な注意事項について',
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">免責事項</h1>
        
        <div className="bg-gray-800 rounded-lg p-8 space-y-8">
          <section>
            <p className="text-gray-300 mb-6">
              最終更新日: 2025年8月23日
            </p>
            <p className="text-gray-300 mb-6 bg-yellow-900/30 p-4 rounded border border-yellow-600">
              <strong className="text-yellow-400">⚠️ 重要な注意事項</strong><br />
              Night Shift AIは人工知能技術を活用したシミュレーション・エンターテイメント・教育目的のサービスです。
              AIによる回答や提案は必ずしも正確性や適切性が保証されるものではありません。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-red-400">1. AIによる情報生成の限界</h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">1.1 情報の正確性について</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>AIが生成する情報は学習データに基づく推測であり、事実とは限りません</li>
                  <li>最新の情報や特定分野の専門的知識に不正確な内容が含まれる可能性があります</li>
                  <li>統計データや数値情報については独自に検証してください</li>
                  <li>文脈や条件によって適切性が変わる場合があります</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">1.2 判断の責任</h3>
                <p>
                  AIによる議論や提案を参考にされる場合は、最終的な判断と責任はユーザー自身にあります。
                  重要な決定においては、必ず専門家にご相談ください。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-red-400">2. 専門的助言の代替不可</h2>
            <div className="text-gray-300 space-y-4">
              <div className="bg-red-900/30 p-4 rounded border border-red-600">
                <h3 className="text-xl font-medium mb-2 text-red-400">⚠️ 専門的助言ではありません</h3>
                <p className="mb-2">
                  Night Shift AIは以下の専門的助言の代替として使用できません：
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>法的助言:</strong> 法律相談、契約解釈、法的判断</li>
                  <li><strong>医学的助言:</strong> 診断、治療法、医療判断</li>
                  <li><strong>財務助言:</strong> 投資判断、税務相談、金融計画</li>
                  <li><strong>技術的助言:</strong> システム設計、セキュリティ対策</li>
                  <li><strong>心理学的助言:</strong> メンタルヘルスケア、カウンセリング</li>
                </ul>
              </div>
              <p>
                これらの分野でお悩みの場合は、必ず適切な資格を持つ専門家にご相談ください。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-red-400">3. サービスの可用性</h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">3.1 サービス中断</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>メンテナンス、更新、技術的問題によるサービス停止</li>
                  <li>外部APIプロバイダーの制限やサービス停止</li>
                  <li>予期しないトラフィック増加による一時的な利用制限</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">3.2 データの保存</h3>
                <p>
                  議論の履歴や設定は保存されない場合があります。重要な内容については
                  ユーザー自身でバックアップを取ることをお勧めします。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-red-400">4. 第三者サービスの利用</h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">4.1 AIプロバイダー</h3>
                <p>
                  当サービスは以下の第三者AIサービスを利用しています：
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>OpenAI (GPT-4, GPT-4o-mini)</li>
                  <li>Anthropic (Claude)</li>
                  <li>Google (Gemini)</li>
                </ul>
                <p className="mt-2">
                  これらのサービスはそれぞれの利用規約とプライバシーポリシーに従って運営されており、
                  当社はこれらのサービスの可用性や品質について責任を負いません。
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">4.2 外部リンク</h3>
                <p>
                  当サービスに含まれる外部サイトへのリンクについて、
                  リンク先サイトの内容や品質について責任を負いません。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-red-400">5. セキュリティと機密情報</h2>
            <div className="text-gray-300 space-y-4">
              <div className="bg-orange-900/30 p-4 rounded border border-orange-600">
                <h3 className="text-xl font-medium mb-2 text-orange-400">🔒 機密情報の取り扱い</h3>
                <p><strong>以下の情報は入力しないでください：</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>個人情報（名前、住所、電話番号、メールアドレスなど）</li>
                  <li>財務情報（クレジットカード番号、口座情報など）</li>
                  <li>企業秘密や機密情報</li>
                  <li>パスワードやアクセスキー</li>
                  <li>法的に保護されている情報</li>
                </ul>
              </div>
              <p>
                万が一、機密情報を入力された場合は、速やかにサポートチームまでご連絡ください。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-red-400">6. 損害の責任制限</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                法律で許可される最大限の範囲において、当社は以下について責任を負いません：
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>AIが生成した内容に基づく判断や行動による直接的・間接的損害</li>
                <li>サービス利用の中断や停止による損失</li>
                <li>データの損失や破損</li>
                <li>第三者サービスの問題に起因する損害</li>
                <li>期待した結果が得られなかった場合の機会損失</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-red-400">7. 年齢制限と保護者の責任</h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">7.1 年齢制限</h3>
                <p>
                  当サービスは13歳以上のユーザーを対象としています。
                  18歳未満の方は保護者の同意を得てご利用ください。
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">7.2 保護者の監督</h3>
                <p>
                  未成年者の利用については、保護者が適切な監督と指導を行ってください。
                  教育目的での利用においても、内容の適切性をご確認ください。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-red-400">8. 継続的な改善と変更</h2>
            <div className="text-gray-300 space-y-2">
              <p>
                当サービスは継続的に改善・更新されており、機能や仕様が
                予告なく変更される場合があります。本免責事項も必要に応じて更新されます。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">9. 適切な利用方法</h2>
            <div className="text-gray-300 space-y-4">
              <div className="bg-green-900/30 p-4 rounded border border-green-600">
                <h3 className="text-xl font-medium mb-2 text-green-400">✅ 推奨される利用方法</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>アイデアやブレインストーミングのサポートツールとして</li>
                  <li>学習や研究の出発点として（最終的な検証は必須）</li>
                  <li>複数の観点からの議論を体験する教育ツールとして</li>
                  <li>創造性を刺激するインスピレーション源として</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">10. お問い合わせとサポート</h2>
            <div className="text-gray-300">
              <p>
                本免責事項に関するご質問や、サービス利用中に問題が発生した場合は、
                以下までお問い合わせください：
              </p>
              <div className="mt-4 p-4 bg-gray-700 rounded">
                <p><strong>Night Shift AI サポートチーム</strong></p>
                <p>Email: support@nightshift-ai.com</p>
                <p>（実際のメールアドレスに置き換えてください）</p>
                <p className="mt-2 text-sm text-gray-400">
                  緊急時や重要な問題については、できるだけ迅速に対応いたします。
                </p>
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