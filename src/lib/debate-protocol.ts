// Debate protocol to orchestrate multi-role synthesis without changing external behavior.

export const Rubric = `Scoring (0-100):
- Evidence & URLs (30): cites sources or marks assumptions clearly.
- Executability (30): staffing, inventory, realistic KPIs.
- Differentiation (20): defensible angles, channel strategy.
- Financial coherence (20): margins, CAC/LTV, cash needs.
Threshold: <80 triggers a revision focusing on weakest criteria.`;

export const DebateProtocol = `Process:
Round 1 (Proposals): Each role outputs within 800–1200 tokens following its template.
Round 2 (Critique): Each role lists 3 critical risks/gaps in others' plans and proposes fixes.
Round 3 (Synthesis): CMO scores using the rubric, requests targeted revisions if <80, then outputs the final integrated plan.`;

export function buildDebateSystemPrompt(goal: string) {
  return `You are a panel of experts collaborating to solve: ${goal}\n${DebateProtocol}\n${Rubric}\nOutput must be structured, concise, and decision-ready.`;
}

