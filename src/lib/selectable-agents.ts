import { AI_AGENTS, Agent } from './ai-agents';

// Curated 12 agents for selection UI, aligned with the engine's defined IDs
export const SELECTABLE_AGENT_IDS: string[] = [
  'ceo',  // CEO AI
  'cfo',  // CFO AI
  'cmo',  // CMO AI
  'cto',  // CTO AI
  'coo',  // COO AI
  'devil',// 悪魔の代弁者
  'cso',  // CSO AI
  'cio',  // CIO AI (Investments)
  'cxo',  // CXO AI (Customer Experience)
  'cbo',  // CBO AI (Brand)
  'cdo',  // CDO AI (Digital)
  'caio', // CAIO AI (AI Strategy)
];

export function getSelectableAgents(): Agent[] {
  const all = Object.values(AI_AGENTS);
  return all.filter(a => SELECTABLE_AGENT_IDS.includes(a.id));
}

