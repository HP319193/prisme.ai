import { useRef } from 'react';
import useLocalizedText from '../../utils/useLocalizedText';
import { usePageBuilder } from './context';

import AddBlock from './AddBlock';
import { EditOutlined } from '@ant-design/icons';
import ExternalSchemaLoader from './ExternalSchemaLoader';
import { useTranslation } from 'next-i18next';

export const PageBlocks = () => {
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const { blocksInPage, setEditBlock } = usePageBuilder();
  const containerEl = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`page-blocks flex flex-1 flex-col transition-all items-center overflow-y-auto h-full snap-mandatory z-10`}
    >
      <div className="snap-start" />
      <div ref={containerEl} className="flex flex-1 flex-col w-[768px] m-8">
        <div className="mb-6">
          <AddBlock after={-1} />
        </div>
        {blocksInPage.map(({ key, name, url, appInstance }, index) => (
          <div key={key} className="flex flex-col snap-start">
            <button
              className="flex flex-1 max-w-full mb-6"
              onClick={() => setEditBlock(key)}
            >
              <div className="flex flex-1 relative surface-section border-slate-100 bg-white border height-[18rem] rounded-[1rem]">
                <span className="flex m-8 font-bold flex-1 justify-between">
                  {t('pages.blocks.name', { context: localize(name) })}
                  <EditOutlined />
                </span>
                {url && (
                  <ExternalSchemaLoader
                    blockId={key}
                    url={url}
                    name={name || ''}
                  />
                )}
              </div>
            </button>
            <div className="mb-6">
              <AddBlock after={index} />
            </div>
          </div>
        ))}
      </div>
      <div className="snap-start" />
    </div>
  );
};
export default PageBlocks;
