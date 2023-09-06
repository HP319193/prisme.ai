import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { useUser } from '../../../console/components/UserProvider';
import api, { Events } from '../../../console/utils/api';
import { useRedirect } from './useRedirect';

export const usePageEvents = (page: Prismeai.Page | null) => {
  const { user } = useUser();
  const [events, setEvents] = useState<Events>();
  const { push } = useRouter();

  // init socket
  const prevSocketWorkspaceId = useRef('');
  useEffect(() => {
    if (!user) return;
    let off: () => void;
    async function initEvents() {
      if (
        !page ||
        !page.workspaceId ||
        prevSocketWorkspaceId.current === page.workspaceId
      )
        return;

      const events = await api.streamEvents(page.workspaceId, {
        'source.sessionId': true,
      });

      prevSocketWorkspaceId.current = page.workspaceId;

      setEvents((prev) => {
        if (prev) {
          prev.destroy();
        }
        if (typeof window !== 'undefined') {
          window.Prisme = window.Prisme || {};
          window.Prisme.ai = window.Prisme.ai || {};
          window.Prisme.ai.events = events;
          window.Prisme.ai.api = api;
        }
        return events;
      });

      off = events.once('error', (payload: any) => {
        console.error('ERROR', payload);
        if (payload?.error !== 'ForbiddenError') return;
        const eventName = payload?.details?.subject?.type;
        if (!eventName) return;
        events.emit(eventName, payload?.details?.subject?.payload);
      });
    }
    initEvents();

    return () => {
      off?.();
    };
  }, [page, user]);

  useEffect(() => {
    return () => {
      events?.destroy();
    };
  }, [events]);

  // Listen to update page events
  const redirect = useRedirect();
  useEffect(() => {
    if (!page || !events) return;
    const offs: Function[] = [];

    if (page.updateOn) {
      offs.push(
        events.on(page.updateOn, ({ payload }) => {
          redirect(payload);
        })
      );
    }

    if (page.notifyOn) {
      offs.push(
        events.on(page.notifyOn, async ({ payload: { title, body, icon } }) => {
          try {
            await Notification.requestPermission();
            new Notification(title, {
              body,
              icon,
              vibrate: 200,
            });
          } catch {}
        })
      );
    }

    return () => {
      offs.forEach((off) => off());
    };
  }, [events, page, push]);

  return { events };
};

export default usePageEvents;
