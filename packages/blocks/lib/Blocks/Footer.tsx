import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';
import { BaseBlock } from './BaseBlock';
import { BlocksListConfig } from './BlocksList';
import { BaseBlockConfig } from './types';

export interface FooterConfig extends BaseBlockConfig {
  content: BlocksListConfig;
}

export const Footer = ({ content, className = '' }: FooterConfig) => {
  const {
    utils: { BlockLoader },
  } = useBlocks();
  return (
    <footer className={`pr-block-footer ${className}`}>
      {content && <BlockLoader name="BlocksList" config={content} />}
    </footer>
  );
};

const defaultStyles = `:block {
  display: flex;
  flex: 1;
  justify-content: flex-end;
  align-items: flex-end;
}
:block > .pr-block-blocks-list {
  padding: 2rem 2rem 6rem 2rem;
  background: var(--color-accent-dark);
  color: var(--accent-contrast-color);
}`;

export const FooterInContext = () => {
  const { config } = useBlock<FooterConfig>();
  return (
    <BaseBlock defaultStyles={defaultStyles}>
      <Footer {...config} />
    </BaseBlock>
  );
};
FooterInContext.styles = defaultStyles;

export default FooterInContext;
