import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Event } from '../../utils/api';

interface Action {
  label: string;
  description: string;
  onClick: () => void;
}

function getActionsByEvent({ type }: Event<Date>) {
  console.log(type);
  if (
    type.match(/^workspaces\.(.*\.)?(created|updated|deleted)$/) ||
    type.match(/^workspaces\.apps\./)
  ) {
    return [
      {
        label: 'workspace.versions.create.label',
        description: 'workspace.versions.create.description',
        onClick: () => console.log('create version'),
      },
    ];
  }

  return [];
}

export const useActionsByEvent = (event: Event<Date>) => {
  const [actions, setActions] = useState<Action[]>([]);

  const { t } = useTranslation('workspaces');

  const prevId = useRef('');
  useEffect(() => {
    if (prevId.current === event.id) return;
    prevId.current = event.id;
    setActions(getActionsByEvent(event));
  }, [event]);

  return useMemo(
    () =>
      actions.map(({ label, description, ...action }) => ({
        ...action,
        label: t(label),
        description: t(description),
      })),
    [actions, t]
  );
};

export default useActionsByEvent;
