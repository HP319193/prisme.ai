import { FC, useCallback, useState } from 'react';
import api from '../../utils/api';
import { PagesContext, pagesContext } from './context';

interface PagesProvider {}

export const defaultStyles = `
body {
  --color-accent: #015dff;
  --color-accent-light: #80A4FF;
  --color-background: white;
  --color-text: black;
  --color-border: black;
  --color-background-transparent: rgba(0,0,0,0.05);
  --color-input-background: white;
  background-color: var(--color-background);
}

.content-stack__content {
  background-color: var(--color-background);
  margin-top: 1rem;
}

.content-stack__content .block-form {
  padding-left: 2rem !important;
}
.content-stack__content .block-cards,
.content-stack__content .block-rich-text {
  padding-left: 2rem;
}

.page-blocks {
  padding: 2rem;
}

.block-form {
  padding: 0;
}

.block-form label {
  color: var(--color-text)
}

.block-form .ant-input {
  width: calc(100% - 2rem);
  border-radius: 0.625rem;
  border-color: var(--color-border);
  color: var(--color-text);
  background-color: var(--color-input-background);
}

.block-form .ant-input::placeholder {
  color: black;
}`;

export const PagesProvider: FC<PagesProvider> = ({ children }) => {
  const [pages, setPages] = useState<PagesContext['pages']>(new Map());
  const [loading, setLoading] = useState(false);
  const fetchPages: PagesContext['fetchPages'] = useCallback(
    async (workspaceId) => {
      if (!workspaceId) return;
      setLoading(true);
      const pages = await api.getPages(workspaceId);
      setLoading(false);
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
      const newPage = await api.createPage(workspaceId, page);
      setPages((prev) => {
        const newPages = new Map(prev);
        const workspacePages = new Set(
          Array.from(newPages.get(workspaceId) || []).filter(
            ({ id }) => id !== newPage.id
          )
        );
        workspacePages.add({ ...newPage, workspaceId });
        newPages.set(workspaceId, workspacePages);
        return newPages;
      });
      return newPage;
    },
    []
  );
  const savePage: PagesContext['savePage'] = useCallback(
    async (workspaceId, page, events = []) => {
      events.push('*');
      const files = [
        'image/*',
        'application/*',
        'audio/*',
        'video/*',
        'text/*',
      ];
      if (page.apiKey) {
        await api.updateApiKey(workspaceId, page.apiKey, events, files);
      } else {
        const apiKey = await api.generateApiKey(workspaceId, events, files);
        if (apiKey) {
          page.apiKey = apiKey;
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
        workspacePages.add({ ...savedPage, workspaceId });
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
