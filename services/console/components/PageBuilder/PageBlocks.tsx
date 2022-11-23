import { useRef } from 'react';
import useLocalizedText from '../../utils/useLocalizedText';
import { usePageBuilder } from './context';

import AddBlock from './AddBlock';
import { EditOutlined } from '@ant-design/icons';
import { BlockPreview } from './BlockPreview';
import { useTranslation } from 'next-i18next';

export const PageBlocks = () => {
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const { setEditBlock, page } = usePageBuilder();
  const containerEl = useRef<HTMLDivElement>(null);

  const { blocks } = page;

  return (
    <div
      className={`page-blocks flex flex-1 flex-col transition-all items-center overflow-y-auto h-full snap-mandatory z-10`}
    >
      <div className="snap-start" />
      <div ref={containerEl} className="flex flex-1 flex-col w-[768px] m-8">
        <div className="mb-6">
          <AddBlock after={-1} />
        </div>
        {blocks.map(
          ({ key, config, name }, index) =>
            name &&
            key && (
              <div key={key} className="flex flex-col snap-start">
                <div className="flex flex-1 max-w-full mb-6">
                  <div className="flex flex-1 flex-col max-w-full overflow-hidden relative p-8 surface-section border-slate-100 bg-white border height-[18rem] rounded-[1rem]">
                    <button
                      className="flex font-bold flex-1 justify-between focus:outline-none"
                      onClick={() => setEditBlock(key)}
                    >
                      {t('pages.blocks.name', { context: localize(name) })}
                      <EditOutlined />
                    </button>
                    <BlockPreview
                      id={key || name}
                      name={name}
                      config={config}
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <AddBlock after={index} />
                </div>
              </div>
            )
        )}
      </div>
      <div className="snap-start" />
    </div>
  );
};
export default PageBlocks;
