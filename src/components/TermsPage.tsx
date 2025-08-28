'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/90 backdrop-blur-sm border-b border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <ArrowLeftIcon className="w-5 h-5 text-slate-300" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI経営軍師
              </h1>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold mb-8">利用規約</h1>
            
            <div className="prose prose-invert prose-slate max-w-none">
              <p className="text-slate-300 mb-6">
                この利用規約（以下「本規約」といいます）は、合同会社Leadfive（以下「当社」といいます）が提供するAI経営軍師サービス（以下「本サービス」といいます）の利用条件を定めるものです。
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-white">第1条（適用）</h2>
                <p className="text-slate-300 mb-4">
                  本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-white">第2条（利用登録）</h2>
                <ol className="list-decimal list-inside text-slate-300 space-y-2">
                  <li>登録希望者が当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。</li>
                  <li>当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
                    <ul className="list-disc list-inside ml-4 mt-2">
                      <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
                      <li>本規約に違反したことがある者からの申請である場合</li>
                      <li>その他、当社が利用登録を相当でないと判断した場合</li>
                    </ul>
                  </li>
                </ol>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-white">第3条（ユーザーIDおよびパスワードの管理）</h2>
                <ol className="list-decimal list-inside text-slate-300 space-y-2">
                  <li>ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。</li>
                  <li>ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。</li>
                </ol>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-white">第4条（利用料金および支払方法）</h2>
                <ol className="list-decimal list-inside text-slate-300 space-y-2">
                  <li>ユーザーは、本サービスの利用に際し、当社が別途定め、本ウェブサイトに表示する利用料金を、当社が指定する方法により支払うものとします。</li>
                  <li>ユーザーが利用料金の支払を遅滞した場合には、ユーザーは年14.6％の割合による遅延損害金を支払うものとします。</li>
                </ol>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-white">第5条（禁止事項）</h2>
                <p className="text-slate-300 mb-4">
                  ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
                </p>
                <ul className="list-disc list-inside text-slate-300 space-y-2">
                  <li>法令または公序良俗に違反する行為</li>
                  <li>犯罪行為に関連する行為</li>
                  <li>本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為</li>
                  <li>当社、ほかのユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                  <li>本サービスによって得られた情報を商業的に利用する行為</li>
                  <li>当社のサービスの運営を妨害するおそれのある行為</li>
                  <li>不正アクセスをし、またはこれを試みる行為</li>
                  <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                  <li>不正な目的を持って本サービスを利用する行為</li>
                  <li>その他、当社が不適切と判断する行為</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-white">第6条（本サービスの提供の停止等）</h2>
                <ol className="list-decimal list-inside text-slate-300 space-y-2">
                  <li>当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
                    <ul className="list-disc list-inside ml-4 mt-2">
                      <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                      <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                      <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                      <li>その他、当社が本サービスの提供が困難と判断した場合</li>
                    </ul>
                  </li>
                  <li>当社は、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。</li>
                </ol>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-white">第7条（利用制限および登録抹消）</h2>
                <ol className="list-decimal list-inside text-slate-300 space-y-2">
                  <li>当社は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、ユーザーに対して、本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。
                    <ul className="list-disc list-inside ml-4 mt-2">
                      <li>本規約のいずれかの条項に違反した場合</li>
                      <li>登録事項に虚偽の事実があることが判明した場合</li>
                      <li>料金等の支払債務の不履行があった場合</li>
                      <li>当社からの連絡に対し、一定期間返答がない場合</li>
                      <li>本サービスについて、最終の利用から一定期間利用がない場合</li>
                      <li>その他、当社が本サービスの利用を適当でないと判断した場合</li>
                    </ul>
                  </li>
                </ol>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-white">第8条（免責事項）</h2>
                <ol className="list-decimal list-inside text-slate-300 space-y-2">
                  <li>当社の債務不履行責任は、当社の故意または重過失によらない場合には免責されるものとします。</li>
                  <li>当社は、本サービスによってユーザーが得る情報の正確性、完全性、有用性等について、いかなる保証も行わないものとします。</li>
                  <li>当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。</li>
                </ol>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-white">第9条（サービス内容の変更等）</h2>
                <p className="text-slate-300">
                  当社は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-white">第10条（利用規約の変更）</h2>
                <p className="text-slate-300">
                  当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。なお、本規約の変更後、本サービスの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなします。
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-white">第11条（準拠法・裁判管轄）</h2>
                <ol className="list-decimal list-inside text-slate-300 space-y-2">
                  <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
                  <li>本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。</li>
                </ol>
              </section>

              <div className="mt-12 p-4 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-sm">
                  制定日：2024年1月1日<br />
                  最終更新日：2024年1月1日
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;