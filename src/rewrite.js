export function buildWedgeResult(input, report) {
  const verdict = getVerdict(report.totalScore);
  const statement = buildStatement(input);
  const summary = buildSummary(verdict, report.flags ?? []);

  return { verdict, statement, summary };
}

function getVerdict(totalScore) {
  if (totalScore >= 75) return 'Strong wedge';
  if (totalScore >= 50) return 'Promising';
  return 'Too fuzzy';
}

function buildStatement(input) {
  const customer = String(input.customer ?? '').trim();
  const workaround = String(input.workaround ?? '').trim();
  const wedge = String(input.wedge ?? '').trim();
  const evidence = String(input.evidence ?? '').trim();

  const parts = [];

  if (customer) {
    parts.push(`For ${customer},`);
  }

  if (wedge) {
    parts.push(wedge);
  }

  if (workaround) {
    parts.push(`instead of ${workaround},`);
  }

  if (evidence) {
    parts.push(`backed by ${evidence}`);
  }

  const statement = parts.join(' ').trim().replace(/,+$/, '');
  return statement ? `${statement}.` : '';
}

function buildSummary(verdict, flags) {
  if (flags.length > 0) {
    return 'This wedge is still too broad. Make it narrower and more concrete before moving forward.';
  }

  if (verdict === 'Strong wedge') {
    return 'This wedge is concrete enough to test with the right customer now.';
  }

  return 'This wedge has promise, but it needs sharper proof or tighter scope.';
}
