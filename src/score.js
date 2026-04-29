const GENERIC_CUSTOMER_TERMS = ['everyone', 'small businesses', 'teams', 'users'];
const WEAK_EVIDENCE_PHRASES = ['sounds cool', 'interested', 'would use'];

export function scoreIdea(input) {
  const customer = normalize(input.customer);
  const workaround = normalize(input.workaround);
  const evidence = normalize(input.evidence);
  const wedge = normalize(input.wedge);

  const flags = [];
  const repairAdvice = [];

  const hasGenericCustomer = GENERIC_CUSTOMER_TERMS.some((term) =>
    customer.includes(term)
  );
  if (hasGenericCustomer) {
    flags.push('generic-customer');
    repairAdvice.push('Name a specific customer with role, stage, or repeated pain.');
  }

  if (!workaround) {
    flags.push('missing-workaround');
    repairAdvice.push('Describe the current workaround in specific, concrete terms.');
  }

  const hasWeakEvidence = WEAK_EVIDENCE_PHRASES.some((phrase) =>
    evidence.includes(phrase)
  );
  if (hasWeakEvidence) {
    flags.push('weak-evidence');
    repairAdvice.push('Use specific evidence like asks, payments, or repeated usage.');
  }

  const dimensionScores = {
    customer: scoreCustomer(customer, hasGenericCustomer),
    workaround: scoreWorkaround(workaround),
    evidence: scoreEvidence(evidence, hasWeakEvidence),
    wedge: scoreWedge(wedge)
  };

  const totalScore = Object.values(dimensionScores).reduce(
    (sum, value) => sum + value,
    0
  );

  return { totalScore, dimensionScores, flags, repairAdvice };
}

function scoreCustomer(customer, hasGenericCustomer) {
  if (!customer) return 0;
  if (hasGenericCustomer) return 10;
  if (wordCount(customer) >= 6) return 25;
  if (wordCount(customer) >= 4) return 20;
  return 15;
}

function scoreWorkaround(workaround) {
  if (!workaround) return 0;
  if (wordCount(workaround) >= 10 || /every\s+(day|morning|week)/.test(workaround)) {
    return 25;
  }
  if (wordCount(workaround) >= 6) return 20;
  return 15;
}

function scoreEvidence(evidence, hasWeakEvidence) {
  if (!evidence) return 0;
  if (hasWeakEvidence) return 5;
  if (/\b\d+\b/.test(evidence) || /\b(asked|paid|using|usage|beta)\b/.test(evidence)) {
    return 25;
  }
  if (wordCount(evidence) >= 5) return 20;
  return 15;
}

function scoreWedge(wedge) {
  if (!wedge) return 0;
  if (wordCount(wedge) >= 8) return 25;
  if (wordCount(wedge) >= 5) return 20;
  return 15;
}

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

function wordCount(value) {
  if (!value) return 0;
  return value.split(/\s+/).filter(Boolean).length;
}
