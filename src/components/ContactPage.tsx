'use client';

import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/90 backdrop-blur-sm border-b border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 text-slate-300 hover:text-white transition-colors">
              <ArrowLeftIcon className="w-5 h-5" />
              <span>トップページに戻る</span>
            </Link>
            <h1 className="text-xl font-bold">お問い合わせ</h1>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-4 max-w-6xl mx-auto pb-16">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
            お問い合わせ
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
            AI経営軍師に関するご質問・ご相談はお気軽にお問い合わせください
          </p>
        </div>

        {/* Contact Form Component */}
        <ContactForm />
      </div>
    </div>
  );
};

export default ContactPage;