/**
 * APIコスト分析のテスト実行
 */

import { generateCostComparisonReport, estimateDiscussionTokens, calculateCost, recommendModel } from './api-cost-analysis';

// コスト比較レポートの生成と表示
console.log(generateCostComparisonReport());

// 詳細な分析
const estimate = estimateDiscussionTokens(6, 5);

console.log('\n## 詳細コスト分析');
console.log('\n### 1回のディスカッションで使用するトークン数');
console.log(`- 初期分析: ${estimate.agents}人 × ${estimate.initialTokensPerAgent}トークン = ${estimate.agents * estimate.initialTokensPerAgent}トークン`);
console.log(`- 相互議論: ${estimate.rounds}ラウンド × ${estimate.agents}人 × ${estimate.discussionTokensPerRound}トークン = ${estimate.rounds * estimate.agents * estimate.discussionTokensPerRound}トークン`);
console.log(`- 総括: ${estimate.summaryTokens}トークン`);
console.log(`- 合計出力トークン: ${estimate.totalOutputTokens}トークン`);

console.log('\n### 月間コスト試算（1日10回のディスカッション）');
const dailyUse = 10;
const monthlyUse = dailyUse * 30;

const models = [
  { name: 'gemini-1.5-flash-8b', provider: 'google' as const },
  { name: 'gemini-2.0-flash', provider: 'google' as const },
  { name: 'gpt-4o-mini', provider: 'openai' as const },
  { name: 'claude-3.5-sonnet', provider: 'anthropic' as const }
];

models.forEach(({ name, provider }) => {
  const cost = calculateCost(name, provider, estimate);
  const monthlyCost = cost.costInYen * monthlyUse;
  console.log(`\n${name}:`);
  console.log(`- 1回: ¥${cost.costInYen.toFixed(2)}`);
  console.log(`- 月間: ¥${monthlyCost.toFixed(0)} (${monthlyUse}回)`);
  console.log(`- 年間: ¥${(monthlyCost * 12).toFixed(0)}`);
});

console.log('\n### 用途別の推奨モデル');
console.log('\n#### コスト重視の場合:');
recommendModel('cost', 'low').forEach((rec, i) => {
  console.log(`${i + 1}. ${rec.model} (${rec.provider})`);
  console.log(`   理由: ${rec.reason}`);
  console.log(`   コスト: ¥${rec.estimatedCost.toFixed(2)}/回`);
});

console.log('\n#### 品質重視の場合:');
recommendModel('quality', 'high').forEach((rec, i) => {
  console.log(`${i + 1}. ${rec.model} (${rec.provider})`);
  console.log(`   理由: ${rec.reason}`);
  console.log(`   コスト: ¥${rec.estimatedCost.toFixed(2)}/回`);
});

console.log('\n#### バランス重視（通常の議論）:');
recommendModel('balanced', 'medium').forEach((rec, i) => {
  console.log(`${i + 1}. ${rec.model} (${rec.provider})`);
  console.log(`   理由: ${rec.reason}`);
  console.log(`   コスト: ¥${rec.estimatedCost.toFixed(2)}/回`);
});