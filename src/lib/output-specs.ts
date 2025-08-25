// Defines preferred final output sections for higher-clarity plans.

export const OutputSections = [
  'Assumptions',
  'Market Sizing (TAM/SAM/SOM)',
  'Channel P&L (DTC/Retail/Amazon/Salon)',
  'Quarterly Roadmap (Q1–Q4)',
  'KPIs & Guardrails',
  'Risks & Regulations (NY/FDA/FTC)',
  'Scenarios (Base/Stretch/Risk)',
  'Decision Rules',
] as const;

export function sectionHeader(name: string) {
  return `## ${name}`;
}

