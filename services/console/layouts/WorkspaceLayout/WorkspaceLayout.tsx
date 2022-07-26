import { FC, useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { Layout } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import HeaderWorkspace from '../../components/HeaderWorkspace';
import WorkspaceSource from '../../views/WorkspaceSource';
import { useWorkspace } from '../../components/WorkspaceProvider';
import workspaceLayoutContext, { WorkspaceLayoutContext } from './context';
import useLocalizedText from '../../utils/useLocalizedText';

export const WorkspaceLayout: FC = ({ children }) => {
  const { workspace } = useWorkspace();
  const { localize } = useLocalizedText();
  const { t } = useTranslation('workspaces');

  console.log('workspace', localize(workspace.name));

  const [sourceDisplayed, setSourceDisplayed] = useState(false);
  const [mountSourceComponent, setMountComponent] = useState(false);
  const [displaySourceView, setDisplaySourceView] = useState(false);
  const [invalid, setInvalid] =
    useState<WorkspaceLayoutContext['invalid']>(false);
  const [newSource, setNewSource] =
    useState<WorkspaceLayoutContext['newSource']>();
  const [saving, setSaving] = useState(false);
  const [fullSidebar, setFullSidebar] = useState(false);

  // Manage source panel display
  useEffect(() => {
    if (sourceDisplayed) {
      setMountComponent(true);
    } else {
      setDisplaySourceView(false);
      setTimeout(() => setMountComponent(false), 200);
    }
  }, [sourceDisplayed]);

  const displaySource = useCallback((v: boolean) => {
    setSourceDisplayed(v);
  }, []);

  return (
    <workspaceLayoutContext.Provider
      value={{
        displaySource,
        sourceDisplayed,
        saving,
        setSaving,
        invalid,
        setInvalid,
        newSource,
        setNewSource,
        fullSidebar,
        setFullSidebar,
      }}
    >
      <Head>
        <title>
          {t('workspace.title', { name: localize(workspace.name) })}
        </title>
        <meta
          name="description"
          content={t('workspace.description', {
            name: localize(workspace.name),
          })}
        />
      </Head>
      <div
        className={`
          absolute top-[75px] bottom-0 right-0 left-0
          bg-white
          flex flex-1
          transition-transform
          transition-duration-200
          transition-ease-in
          z-[11]
          ${displaySourceView ? '' : '-translate-y-full'}
        `}
      >
        {mountSourceComponent && (
          <WorkspaceSource onLoad={() => setDisplaySourceView(true)} />
        )}
      </div>
      <Layout Header={<HeaderWorkspace />}>{children}</Layout>
    </workspaceLayoutContext.Provider>
  );
};

export default WorkspaceLayout;
