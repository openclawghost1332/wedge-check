export const examples = [
  {
    label: 'Weak idea',
    idea: 'AI copilot for every small business',
    customer: 'small businesses',
    workaround: '',
    evidence: 'A few people said it sounds cool.',
    wedge: 'help them with operations'
  },
  {
    label: 'Strong idea',
    idea: 'Dispatch follow-up helper for local HVAC shops',
    customer: 'dispatch managers at HVAC companies with 5 to 15 technicians',
    workaround: 'They text techs for updates, copy notes into Jobber, and call customers back one by one every afternoon.',
    evidence: 'Four dispatch managers asked for a beta after trying a manual spreadsheet version for two weeks.',
    wedge: 'turn missed-call voicemails into a ranked callback queue with job context'
  }
];

export function getExample(label) {
  return examples.find((item) => item.label === label) ?? null;
}
