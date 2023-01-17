import { JSONPath } from 'jsonpath-plus';

interface Emit {
  event: string;
  autocomplete?: Prismeai.EmitAutocomplete;
}

export function extractAutomationEmits(
  doList: Prismeai.InstructionList
): Emit[] {
  if (!Array.isArray(doList)) {
    return [];
  }
  return doList.flatMap((instruction) => {
    const [name] = Object.keys(instruction);
    const value = instruction[name as keyof typeof instruction];

    if (Array.isArray(value)) {
      return extractAutomationEmits(value as Prismeai.InstructionList);
    }
    if (name === 'conditions') {
      return Object.keys(value).flatMap((key) =>
        extractAutomationEmits(value[key])
      );
    }
    if (name === 'repeat') {
      return extractAutomationEmits((value as Prismeai.Repeat['repeat']).do);
    }

    if (name !== 'emit' || (value as Prismeai.Emit['emit']).private) {
      return [];
    }
    const emit: Prismeai.Emit['emit'] = value || {};
    return {
      event: emit.event,
      autocomplete: emit.autocomplete,
    };
  });
}

export function computeEventsFromEmits(
  { event, autocomplete }: Emit,
  config: any = {}
): string[] {
  if (!autocomplete || Object.keys(autocomplete).length === 0) return [event];
  // Only read first parameter while the UI is simple
  // To manage many parameters, we would need an autocomplete inside
  // the value autocompleted

  const computedEvents = Object.keys(autocomplete).flatMap((key) => {
    if (!event.match(`{{${key}}}`)) return [];
    const template = autocomplete[key].template || '${value}';
    const { from, path } = autocomplete[key];
    if (!from || !path) return [];
    const values: string[] = (
      JSONPath({ path, json: config }) as string[]
    ).filter(Boolean);
    return (Array.isArray(values) ? values : [values]).flatMap((value) =>
      template.replace('${value}', event.replace(`{{${key}}}`, value))
    );
  });

  return computedEvents;
}

export function deduplicateEmits(emits: Required<Emit[]> = []) {
  const allEvents = emits.map(({ event }) => event);
  return emits.filter(({ event }, k) => !allEvents.slice(0, k).includes(event));
}

export function extractAutomationEvents(
  automation: Prismeai.Automation,
  config: any
): Prismeai.ProcessedEvents {
  const emits = deduplicateEmits(extractAutomationEmits(automation.do || []));
  const events = emits
    .flatMap((emit) => computeEventsFromEmits(emit, config))
    .filter(Boolean);
  return {
    listen: automation?.when?.events || [],
    emit: [...new Set(events)],
    autocomplete: emits
      .filter((cur) => Object.keys(cur.autocomplete || {}).length > 0)
      .map(({ event, autocomplete }) => ({ event, autocomplete })),
  };
}

export function extractPageEvents(
  page: Prismeai.Page
): Prismeai.ProcessedEvents {
  return (page?.blocks || []).reduce<
    Required<Omit<Prismeai.ProcessedEvents, 'autocomplete'>>
  >(
    (events, block) => {
      if (block?.config?.onInit) {
        events.emit.push(block?.config?.onInit);
      }
      if (block?.config?.updateOn) {
        events.listen.push(block?.config?.updateOn);
      }
      return events;
    },
    { listen: [], emit: [] }
  );
}
