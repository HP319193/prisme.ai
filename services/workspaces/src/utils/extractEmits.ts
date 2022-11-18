function getEmitEvents(
  doList: Prismeai.InstructionList
): Prismeai.Emit['emit'][] {
  if (!Array.isArray(doList)) {
    return [];
  }
  return doList.flatMap((instruction) => {
    const [name] = Object.keys(instruction);
    const value = instruction[name as keyof typeof instruction];

    if (Array.isArray(value)) {
      return getEmitEvents(value as Prismeai.InstructionList);
    }
    if (name === 'conditions') {
      return Object.keys(value).flatMap((key) => getEmitEvents(value[key]));
    }
    if (name === 'repeat') {
      return getEmitEvents((value as Prismeai.Repeat['repeat']).do);
    }

    if (name !== 'emit' || (value as Prismeai.Emit['emit']).private) return [];
    return value;
  });
}

export function deduplicateEmits(
  emits: Required<Prismeai.AppDetails>['events']['emit'] = []
) {
  const allEvents = emits.map(({ event }) => event);
  return emits.filter(({ event }, k) => !allEvents.slice(0, k).includes(event));
}

export function extractEmits(
  automation: Prismeai.Automation
): Prismeai.Emit['emit'][] {
  const emits = getEmitEvents(automation.do || []);
  return deduplicateEmits(emits);
}
