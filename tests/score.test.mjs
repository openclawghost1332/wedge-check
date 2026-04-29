import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreIdea } from '../src/score.js';

test('flags vague audience, missing workaround, and weak evidence', () => {
  const report = scoreIdea({
    idea: 'AI tool for small businesses',
    customer: 'small businesses',
    workaround: '',
    evidence: 'people said it sounds cool',
    wedge: 'help them with operations'
  });

  assert.equal(report.totalScore < 50, true);
  assert.ok(report.flags.includes('generic-customer'));
  assert.ok(report.flags.includes('missing-workaround'));
  assert.ok(report.flags.includes('weak-evidence'));
  assert.match(report.repairAdvice.join(' '), /specific/);
});

test('does not treat evidence keyword substrings as strong evidence', () => {
  const report = scoreIdea({
    idea: 'Contract review helper',
    customer: 'solo consultants reviewing client contracts',
    workaround: 'they keep a checklist in Notes and re-read each clause before sending drafts',
    evidence: 'an unpaid pilot user said they might use it later',
    wedge: 'highlight risky indemnity clauses before a contract goes out'
  });

  assert.equal(report.dimensionScores.evidence, 20);
  assert.equal(report.flags.includes('weak-evidence'), false);
});

test('rewards a specific user, concrete workaround, and narrow wedge', () => {
  const report = scoreIdea({
    idea: 'Inbox triage for seed founders',
    customer: 'seed-stage founders doing their own customer support',
    workaround: 'they live in Gmail and a Notion bug tracker for 90 minutes every morning',
    evidence: 'three founders asked for a beta this week',
    wedge: 'turn starred support emails into a ranked daily action list'
  });

  assert.equal(report.totalScore >= 75, true);
  assert.equal(report.flags.length, 0);
  assert.equal(report.dimensionScores.customer >= 20, true);
  assert.equal(report.dimensionScores.wedge >= 20, true);
});
