import { FC, useCallback, useState } from 'react';
import api from '../../utils/api';
import { PagesContext, pagesContext } from './context';

interface PagesProvider {}

export const defaultStyles = `
body {
  --color-accent: #015dff;
  --color-background: #B41040;
  --color-text: white;
  --color-border: white;
  --color-background-transparent: rgba(0,0,0,0.05)
  background-color: var(--background-color);
}

.page-blocks {
  padding: 2rem;
}

.block-form {
  padding: 0;
}

.block-form .ant-input {
  border-radius: 0.625rem;
  border-color: black;
}

.block-form .ant-input::placeholder {
  color: black;
}`;

export const PagesProvider: FC<PagesProvider> = ({ children }) => {
  const [pages, setPages] = useState<PagesContext['pages']>(new Map());
  const fetchPages: PagesContext['fetchPages'] = useCallback(
    async (workspaceId) => {
      if (!workspaceId) return;
      const pages = await api.getPages(workspaceId);
      setPages((prev) => {
        const newPages = new Map(prev);
        newPages.set(workspaceId, new Set(pages || []));
        return newPages;
      });
    },
    []
  );
  const createPage: PagesContext['createPage'] = useCallback(
    async (workspaceId, page) => {
      page.styles = defaultStyles;
      return api.createPage(workspaceId, page);
    },
    []
  );
  const savePage: PagesContext['savePage'] = useCallback(
    async (workspaceId, page, events = []) => {
      events.push('*');
      if (events.length > 0) {
        if (page.apiKey) {
          await api.updateApiKey(workspaceId, page.apiKey, events);
        } else {
          const apiKey = await api.generateApiKey(workspaceId, events);
          if (apiKey) {
            page.apiKey = apiKey;
          }
        }
      }
      const savedPage = await api.updatePage(workspaceId, page);
      setPages((prev) => {
        const newPages = new Map(prev);
        const workspacePages = new Set(
          Array.from(newPages.get(workspaceId) || []).filter(
            ({ id }) => id !== savedPage.id
          )
        );
        workspacePages.add(savedPage);
        newPages.set(workspaceId, workspacePages);
        return newPages;
      });
      return savedPage;
    },
    []
  );
  const deletePage: PagesContext['deletePage'] = useCallback(
    async (workspaceId, pageId) => {
      const deletedPage = await api.deletePage(workspaceId, pageId);
      setPages((prev) => {
        const newPages = new Map(prev);
        const workspacePages = new Set(
          Array.from(newPages.get(workspaceId) || []).filter(
            ({ id }) => id !== deletedPage.id
          )
        );
        newPages.set(workspaceId, workspacePages);
        return newPages;
      });
      return deletedPage;
    },
    []
  );

  return (
    <pagesContext.Provider
      value={{ pages, setPages, fetchPages, createPage, savePage, deletePage }}
    >
      {children}
    </pagesContext.Provider>
  );
};

export default PagesProvider;
