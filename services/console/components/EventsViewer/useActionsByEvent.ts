import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useRef, useState } from 'react';
import api, { Event } from '../../utils/api';

interface Action {
  label: string;
  description: string;
  onClick: () => void;
}

function getActionsByEvent({
  type,
  payload,
  source: { workspaceId },
}: Event<Date>) {
  switch (type) {
    case 'workspaces.versions.published':
      if (!workspaceId || !payload.version.name) return [];
      return [
        {
          label: 'workspace.versions.rollback.label',
          description: 'workspace.versions.rollback.description',
          onClick: async () => {
            if (!workspaceId || !payload.version.name) return;
            const a = await api
              .workspaces(workspaceId)
              .versions.rollback(payload.version.name);
          },
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
