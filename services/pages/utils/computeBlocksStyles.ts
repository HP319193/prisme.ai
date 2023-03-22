import { getBlockStyles, builtinBlocks } from '@prisme.ai/blocks';

export function computePageStyles(page: Prismeai.DetailedPage) {
  const ids = { last: 0 };
  const styles: string[] = [];
  // @ts-ignore
  page.cssId = ++ids.last;
  function computeBlocksStyles(blocks: any = []) {
    return blocks.map((block: any) => {
      const config = block.config ? block.config : block;
      config.cssId = ++ids.last;
      const slug = block.slug || '';
      const { styles: defaultStyles } = (builtinBlocks as any)[slug] || {
        styles: '',
      };

      styles.push(
        getBlockStyles({
          css: config.css,
          defaultStyles,
          containerClassName: `__block-${config.cssId}`,
          parentClassName: '',
        })
      );
      if (config.blocks) {
        config.blocks = computeBlocksStyles(config.blocks);
      }
      return block;
    });
  }
  page.blocks = computeBlocksStyles(page.blocks);

  return { page, styles: styles.join('\n') };
}
