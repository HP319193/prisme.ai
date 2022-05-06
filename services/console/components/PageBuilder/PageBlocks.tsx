import { Fragment, useMemo } from 'react';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import useLocalizedText from '../../utils/useLocalizedText';
import AddBlock from './AddBlock';
import { usePageBuilder } from './context';
import PageBlock from './PageBlock';
import * as BuiltinBlocks from '../Blocks';
import { Schema } from '@prisme.ai/design-system';

export const PageBlocks = () => {
  const { localize } = useLocalizedText();
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();
  const { page, blocks = [] } = usePageBuilder();

  const blocksInPage = useMemo(() => {
    return (page.blocks || []).flatMap(({ key, name = '' }) => {
      const parts = name.split(/\./);
      parts.reverse();
      const [blockName, appName = ''] = parts;
      if (!appName && Object.keys(BuiltinBlocks).includes(blockName)) {
        const Block = BuiltinBlocks[blockName as keyof typeof BuiltinBlocks];
        return {
          url: undefined,
          component: Block,
          name: blockName,
          key,
          appName: '',
          appInstance: undefined,
          edit: Block.schema,
        };
      }
      const app = blocks.find(({ slug }) => slug === appName);
      if (!app) return [];
      const block = app.blocks.find(({ slug }) => slug === blockName);
      if (!block) return [];
      return { ...block, key, appName: app.appName, appInstance: app.slug };
    });
  }, [page.blocks, blocks]);

  return (
    <div className="flex flex-1 flex-col max-w-[100vw]">
      <div className="m-4">
        <AddBlock after={-1} />
      </div>
      {blocksInPage.map(
        ({ url, component, key, name, appName, appInstance, edit }, index) => (
          <Fragment key={key}>
            <PageBlock
              url={url}
              component={component}
              id={`${key || index}`}
              title={
                <div className="flex flex-row">
                  <strong className="mr-2">{localize(appName)}</strong>{' '}
                  {localize(name)}
                </div>
              }
              workspaceId={workspaceId}
              appInstance={appInstance}
              editSchema={edit as Schema['properties']}
            />
            <AddBlock after={index} />
          </Fragment>
        )
      )}
    </div>
  );
};
export default PageBlocks;
