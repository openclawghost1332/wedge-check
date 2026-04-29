import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWedgeResult } from '../src/rewrite.js';

test('builds a sharper wedge statement and verdict label', () => {
  const result = buildWedgeResult({
    idea: 'AI tool for small businesses',
    customer: 'ops managers at 30-person logistics companies',
    workaround: 'they copy order exceptions from email into spreadsheets',
    evidence: 'two operators asked for help this month',
    wedge: 'summarize exception emails into one daily queue'
  }, {
    totalScore: 78,
    flags: []
  });

  assert.match(result.statement, /For ops managers at 30-person logistics companies/);
  assert.match(result.statement, /daily queue/);
  assert.equal(result.verdict, 'Strong wedge');
});

test('omits empty fields instead of emitting malformed statement copy', () => {
  const result = buildWedgeResult({
    idea: 'AI for support',
    customer: '   ',
    workaround: '',
    evidence: '   ',
    wedge: 'triage urgent bug reports'
  }, {
    totalScore: 68,
    flags: []
  });

  assert.equal(result.statement, 'triage urgent bug reports.');
});

test('keeps customer-only statements well formed when wedge details are blank', () => {
  const result = buildWedgeResult({
    idea: 'AI for support',
    customer: 'ops managers',
    workaround: '',
    evidence: '   ',
    wedge: '   '
  }, {
    totalScore: 42,
    flags: []
  });

  assert.equal(result.statement, 'For ops managers.');
});

test('keeps customer and workaround statements well formed without a wedge line', () => {
  const result = buildWedgeResult({
    idea: 'AI for support',
    customer: 'ops managers',
    workaround: 'spreadsheets',
    evidence: '   ',
    wedge: ''
  }, {
    totalScore: 42,
    flags: []
  });

  assert.equal(result.statement, 'For ops managers, instead of spreadsheets.');
});

test('uses the strong summary when no red flags remain', () => {
  const result = buildWedgeResult({
    idea: 'AI tool for small businesses',
    customer: 'ops managers at 30-person logistics companies',
    workaround: 'they copy order exceptions from email into spreadsheets',
    evidence: 'two operators asked for help this month',
    wedge: 'summarize exception emails into one daily queue'
  }, {
    totalScore: 78,
    flags: []
  });

  assert.equal(result.summary, 'This wedge is concrete enough to test with the right customer now.');
});

test('downgrades verdict copy when red flags remain', () => {
  const result = buildWedgeResult({
    idea: 'AI for everyone',
    customer: 'everyone',
    workaround: '',
    evidence: 'people are interested',
    wedge: 'make work easier'
  }, {
    totalScore: 32,
    flags: ['generic-customer', 'missing-workaround']
  });

  assert.equal(result.verdict, 'Too fuzzy');
  assert.match(result.summary, /narrower/);
});
