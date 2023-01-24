import { useBlock } from '../Provider';
import { BaseBlock } from './BaseBlock';
import { BlocksList, BlocksListConfig } from './BlocksList';
import { BaseBlockConfig } from './types';

export interface FooterConfig extends BaseBlockConfig {
  content: BlocksListConfig;
}

export const Footer = ({ content, className = '' }: FooterConfig) => {
  return (
    <footer className={`pr-block-footer ${className}`}>
      {content && <BlocksList {...content} />}
    </footer>
  );
};

export const FooterInContext = () => {
  const { config } = useBlock<FooterConfig>();
  return (
    <BaseBlock>
      <Footer {...config} />
    </BaseBlock>
  );
};

export default FooterInContext;
