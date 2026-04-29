import test from 'node:test';
import assert from 'node:assert/strict';
import { examples, getExample } from '../src/examples.js';

const REQUIRED_KEYS = ['label', 'idea', 'customer', 'workaround', 'evidence', 'wedge'];

test('ships both weak and strong example ideas for the demo', () => {
  assert.ok(examples.length >= 2);
  assert.ok(examples.some((item) => item.label === 'Weak idea'));
  assert.ok(examples.some((item) => item.label === 'Strong idea'));
});

test('keeps each example object in the expected shape', () => {
  for (const example of examples) {
    assert.deepEqual(Object.keys(example).sort(), [...REQUIRED_KEYS].sort());

    for (const key of REQUIRED_KEYS) {
      assert.equal(typeof example[key], 'string');
    }
  }
});

test('returns the matching example by label and null for unknown labels', () => {
  for (const example of examples) {
    assert.equal(getExample(example.label), example);
  }

  assert.equal(getExample('Missing idea'), null);
});
