import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { useUser } from '../../../console/components/UserProvider';
import api, { Events } from '../../../console/utils/api';

export const usePageEvents = (page: Prismeai.Page | null) => {
  const { user } = useUser();
  const [events, setEvents] = useState<Events>();
  const { push } = useRouter();

  // init socket
  const prevSocketWorkspaceId = useRef('');
  useEffect(() => {
    if (!user) return;
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
        return events;
      });
    }
    initEvents();
  }, [page, user]);

  useEffect(() => {
    return () => {
      events?.destroy();
    };
  }, [events]);

  // Listen to update page events
  useEffect(() => {
    if (!page || !events) return;
    const offs: Function[] = [];

    if (page.updateOn) {
      offs.push(
        events.on(page.updateOn, ({ payload: { url, redirect } }) => {
          function redirectGet(url: string) {
            if (url.match(/^http/)) {
              window.location.href = url;
            } else {
              push(url);
            }
          }
          function redirectPost(url: string, body: Record<string, string>) {
            const form = document.createElement('form');
            form.setAttribute('action', url);
            form.setAttribute('method', 'post');
            Object.entries(body).forEach(([k, v]) => {
              const field = document.createElement('input');
              field.setAttribute('type', 'hidden');
              field.setAttribute('name', k);
              field.setAttribute('value', v);
              form.appendChild(field);
            });
            document.body.appendChild(form);
            form.submit();
          }

          if (redirect) {
            const { url, method = 'get', body = {} } = redirect;
            if (!url) return;
            if (`${method}`.toLowerCase() === 'get') {
              return redirectGet(url);
            }
            redirectPost(url, body);
          }
          if (url) {
            redirectGet(url);
          }
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
