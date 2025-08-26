'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CostIndicatorProps {
  currentCostJPY: number;
  budgetJPY: number;
  showDetails?: boolean;
}

export default function CostIndicator({ 
  currentCostJPY, 
  budgetJPY, 
  showDetails = false 
}: CostIndicatorProps) {
  const percentage = (currentCostJPY / budgetJPY) * 100;
  const isNearLimit = percentage > 80;
  const isOverLimit = percentage > 100;

  const getColorClass = () => {
    if (isOverLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColorClass = () => {
    if (isOverLimit) return 'text-red-400';
    if (isNearLimit) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">コスト</span>
          <span className={`text-sm font-medium ${getTextColorClass()}`}>
            ¥{currentCostJPY.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500">/ ¥{budgetJPY}</span>
        </div>
        <span className={`text-xs font-medium ${getTextColorClass()}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>

      {/* プログレスバー */}
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full ${getColorClass()}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* 警告メッセージ */}
      {isNearLimit && !isOverLimit && (
        <p className="text-xs text-yellow-400 mt-2 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          予算の80%に到達しました
        </p>
      )}
      
      {isOverLimit && (
        <p className="text-xs text-red-400 mt-2 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          予算を超過しています
        </p>
      )}

      {/* 詳細情報 */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-slate-700 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">推定トークン数</span>
            <span className="text-slate-400">
              {Math.round(currentCostJPY * 200)}トークン
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">残り予算</span>
            <span className={getTextColorClass()}>
              ¥{Math.max(0, budgetJPY - currentCostJPY).toFixed(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}