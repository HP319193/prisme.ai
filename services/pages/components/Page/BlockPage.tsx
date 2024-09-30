import { useBlock } from '@prisme.ai/blocks';
import Head from 'next/head';
import useLocalizedText from '../../../console/utils/useLocalizedText';
import { interpolateValue } from './computeBlocks';
import { defaultStyles } from '../../../console/views/Page/defaultStyles';
import { useMemo, useRef } from 'react';
import BlockLoader from './BlockLoader';
import PoweredBy from '../../../console/components/PoweredBy';
import dynamic from 'next/dynamic';

const Debug = dynamic(() => import('../Debug'), { ssr: false });

export const BlockPage = () => {
  const { localize } = useLocalizedText();
  const { config } = useBlock();
  const containerEl = useRef<HTMLDivElement>(null);
  const pageTitle = useMemo(() => {
    return (
      interpolateValue({ title: localize(config.name) }, config).title || ''
    );
  }, [config, localize]);
  const styles = useMemo(() => {
    if (config.styles === undefined) return defaultStyles;
    return interpolateValue({ styles: config.styles }, config).styles || '';
  }, [config]);

  return (
    <div className="page flex flex-1 flex-col m-0 p-0 max-w-[100vw] min-h-full">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={localize(config.description)} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no"
        />
        {config.favicon && (
          <link rel="icon" href={config.favicon || '/favicon.png'} />
        )}
      </Head>
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}

      <div
        className="flex flex-1 flex-col page-blocks w-full"
        ref={containerEl}
      >
        <BlockLoader key={config.id} name="BlocksList" config={config} />
      </div>
      <PoweredBy />
      <Debug />
    </div>
  );
};
