import { examples, getExample } from './examples.js';
import { buildWedgeResult } from './rewrite.js';
import { scoreIdea } from './score.js';

const form = document.querySelector('[data-idea-form]');

if (form) {
  const fields = {
    idea: document.querySelector('#idea'),
    customer: document.querySelector('#customer'),
    workaround: document.querySelector('#workaround'),
    evidence: document.querySelector('#evidence'),
    wedge: document.querySelector('#wedge')
  };

  const outputs = {
    totalScore: document.querySelector('[data-total-score]'),
    verdict: document.querySelector('[data-verdict]'),
    flags: document.querySelector('[data-flags]'),
    repairAdvice: document.querySelector('[data-repair-advice]'),
    statement: document.querySelector('[data-statement]')
  };

  const scoreButton = document.querySelector('[data-score]');
  const copyButton = document.querySelector('[data-copy]');
  const loadButtons = examples
    .map((example) => [example.label, document.querySelector(`[data-load="${example.label}"]`)])
    .filter(([, button]) => button);

  const readInput = () => Object.fromEntries(
    Object.entries(fields).map(([key, element]) => [key, element?.value ?? ''])
  );

  const formatList = (items, emptyText) => items.length > 0 ? items.join('\n• ').replace(/^/, '• ') : emptyText;

  const render = (input) => {
    const report = scoreIdea(input);
    const result = buildWedgeResult(input, report);

    outputs.totalScore.textContent = String(report.totalScore);
    outputs.verdict.textContent = result.verdict;
    outputs.flags.textContent = formatList(report.flags, 'No red flags.');
    outputs.repairAdvice.textContent = formatList(report.repairAdvice, 'No repair advice needed yet.');
    outputs.statement.textContent = result.statement || 'Add a wedge statement to see a sharper version here.';
  };

  const loadExample = (label) => {
    const example = getExample(label);
    if (!example) return;

    for (const [key, element] of Object.entries(fields)) {
      element.value = example[key] ?? '';
    }

    render(readInput());
  };

  scoreButton?.addEventListener('click', () => {
    render(readInput());
  });

  const flashCopyButton = (text) => {
    if (!copyButton) return;
    copyButton.textContent = text;
    setTimeout(() => {
      copyButton.textContent = 'Copy result';
    }, 1200);
  };

  copyButton?.addEventListener('click', async () => {
    const text = [
      `Total score: ${outputs.totalScore.textContent}`,
      `Verdict: ${outputs.verdict.textContent}`,
      `Flags: ${outputs.flags.textContent}`,
      `Repair advice: ${outputs.repairAdvice.textContent}`,
      `Sharpened wedge: ${outputs.statement.textContent}`
    ].join('\n');

    if (!navigator.clipboard?.writeText) {
      flashCopyButton('Copy failed');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      flashCopyButton('Copied');
    } catch {
      flashCopyButton('Copy failed');
    }
  });

  for (const [label, button] of loadButtons) {
    button.addEventListener('click', () => loadExample(label));
  }

  render(readInput());
  if (examples.length > 0) {
    loadExample(examples[0].label);
  }
}
