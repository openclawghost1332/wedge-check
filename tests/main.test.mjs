import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { examples } from '../src/examples.js';

const mainModuleUrl = pathToFileURL(new URL('../src/main.js', import.meta.url).pathname).href;
const originalExamples = examples.map((example) => ({ ...example }));

function restoreExamples() {
  examples.splice(0, examples.length, ...originalExamples.map((example) => ({ ...example })));
}

function createElement(overrides = {}) {
  return {
    value: '',
    textContent: '',
    listeners: new Map(),
    addEventListener(type, handler) {
      this.listeners.set(type, handler);
    },
    click() {
      const handler = this.listeners.get('click');
      return handler ? handler({ currentTarget: this, target: this }) : undefined;
    },
    ...overrides
  };
}

function buildApp(buttonLabels) {
  const selectors = new Map();

  const form = createElement();
  const fields = {
    idea: createElement(),
    customer: createElement(),
    workaround: createElement(),
    evidence: createElement(),
    wedge: createElement()
  };
  const outputs = {
    totalScore: createElement({ textContent: '0' }),
    verdict: createElement({ textContent: 'Too fuzzy' }),
    flags: createElement({ textContent: 'No red flags.' }),
    repairAdvice: createElement({ textContent: 'No repair advice needed yet.' }),
    statement: createElement({ textContent: 'Add a wedge statement to see a sharper version here.' })
  };
  const buttons = {
    score: createElement(),
    copy: createElement({ textContent: 'Copy result' }),
    load: new Map(buttonLabels.map((label) => [label, createElement()]))
  };

  selectors.set('[data-idea-form]', form);
  selectors.set('#idea', fields.idea);
  selectors.set('#customer', fields.customer);
  selectors.set('#workaround', fields.workaround);
  selectors.set('#evidence', fields.evidence);
  selectors.set('#wedge', fields.wedge);
  selectors.set('[data-total-score]', outputs.totalScore);
  selectors.set('[data-verdict]', outputs.verdict);
  selectors.set('[data-flags]', outputs.flags);
  selectors.set('[data-repair-advice]', outputs.repairAdvice);
  selectors.set('[data-statement]', outputs.statement);
  selectors.set('[data-score]', buttons.score);
  selectors.set('[data-copy]', buttons.copy);

  for (const [label, button] of buttons.load.entries()) {
    selectors.set(`[data-load="${label}"]`, button);
  }

  return {
    document: {
      querySelector(selector) {
        return selectors.get(selector) ?? null;
      }
    },
    fields,
    outputs,
    buttons
  };
}

async function importMainWith(app, clipboardWriteText) {
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: app.document
  });
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { clipboard: { writeText: clipboardWriteText } }
  });
  Object.defineProperty(globalThis, 'setTimeout', {
    configurable: true,
    value: () => 0
  });

  await import(`${mainModuleUrl}?test=${Date.now()}-${Math.random()}`);
}

test.afterEach(() => {
  restoreExamples();
  delete globalThis.document;
  delete globalThis.navigator;
  delete globalThis.setTimeout;
});

test('wires load buttons from the examples collection instead of hardcoded labels', async () => {
  examples.push({
    label: 'Edge case idea',
    idea: 'Niche QA helper',
    customer: 'release managers at enterprise mobile teams',
    workaround: 'they manually compare screenshots in long Slack threads',
    evidence: 'two teams asked to trial it after a manual pilot',
    wedge: 'flag mismatched release screenshots before app store submission'
  });

  const app = buildApp(examples.map((example) => example.label));

  await importMainWith(app, async () => {});
  await app.buttons.load.get('Edge case idea').click();

  assert.equal(app.fields.idea.value, 'Niche QA helper');
  assert.equal(app.fields.customer.value, 'release managers at enterprise mobile teams');
});

test('shows copy failure feedback when clipboard write is unavailable', async () => {
  const app = buildApp(examples.map((example) => example.label));

  await importMainWith(app, undefined);
  await app.buttons.copy.click();

  assert.equal(app.buttons.copy.textContent, 'Copy failed');
});

test('shows copy failure feedback when clipboard write is rejected', async () => {
  const app = buildApp(examples.map((example) => example.label));

  await importMainWith(app, async () => {
    throw new Error('denied');
  });
  await app.buttons.copy.click();

  assert.equal(app.buttons.copy.textContent, 'Copy failed');
});
