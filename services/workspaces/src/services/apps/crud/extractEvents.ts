function getEmitEvents(
  doList: Prismeai.InstructionList
): Prismeai.Emit['emit'][] {
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

function deduplicateEmit(
  emits: Required<Prismeai.AppDetails>['events']['emit'] = []
) {
  const allEvents = emits.map(({ event }) => event);
  return emits.filter(({ event }, k) => !allEvents.slice(0, k).includes(event));
}
function deduplicateListen(
  listens: Required<Prismeai.AppDetails>['events']['listen'] = []
) {
  return Array.from(new Set(listens));
}

export function extractEvents(app: Prismeai.Workspace) {
  const { emit, listen } = Object.keys(app.automations || {}).reduce<
    Required<Prismeai.AppDetails>['events']
  >(
    (prev, key) => {
      const automation = app?.automations?.[key];
      if (!automation || automation.disabled || automation.private) return prev;

      const listen = [
        ...(prev.listen || []),
        ...(automation.when?.events || []),
      ];
      const emit = [
        ...(prev.emit || []),
        ...getEmitEvents(automation.do || []),
      ];
      return { listen, emit };
    },
    { emit: [], listen: [] }
  );

  return {
    emit: deduplicateEmit(emit),
    listen: deduplicateListen(listen),
  };
}
