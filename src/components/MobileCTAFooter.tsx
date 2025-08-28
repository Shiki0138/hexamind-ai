'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface MobileCTAFooterProps {
  primaryText?: string;
  primaryLink?: string;
  secondaryText?: string;
  trustBadge?: string;
  urgencyMessage?: string;
}

const MobileCTAFooter: React.FC<MobileCTAFooterProps> = ({
  primaryText = '無料で試す',
  primaryLink = '/demo',
  secondaryText = '3分でわかるデモ',
  trustBadge = 'クレジットカード不要',
  urgencyMessage
}) => {
  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
    >
      {/* 緊急性メッセージ */}
      {urgencyMessage && (
        <div className="bg-red-500 text-white text-center py-1 text-xs animate-pulse">
          {urgencyMessage}
        </div>
      )}
      
      {/* メインCTAエリア */}
      <div className="bg-gradient-to-t from-slate-900 via-slate-900/98 to-slate-900/90 backdrop-blur-md pt-6 pb-4 px-4 shadow-2xl">
        <Link href={primaryLink} className="block mb-2">
          <Button 
            size="lg" 
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-xl"
          >
            {primaryText}
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Button>
        </Link>
        
        <button className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
          {secondaryText}
        </button>
        
        {trustBadge && (
          <p className="text-center text-xs text-slate-400 mt-2">
            ✓ {trustBadge}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default MobileCTAFooter;