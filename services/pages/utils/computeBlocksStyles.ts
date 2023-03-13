import { getBlockStyles } from '@prisme.ai/blocks';

export function computePageStyles(page: Prismeai.DetailedPage) {
  const ids = { last: 0 };
  const styles: string[] = [];
  function computeBlocksStyles(blocks: any = []) {
    return blocks.map((block: any) => {
      const config = block.config ? block.config : block;
      if (config.css) {
        config.cssId = ++ids.last;
        styles.push(
          getBlockStyles({
            css: config.css,
            defaultStyles: '',
            containerClassName: `__block-${config.cssId}`,
            parentClassName: '',
          })
        );
      }
      if (config.blocks) {
        config.blocks = computeBlocksStyles(config.blocks);
      }
      return block;
    });
  }
  page.blocks = computeBlocksStyles(page.blocks);

  return { page, styles: styles.join('\n') };
}
