import { getBlockStyles, builtinBlocks } from '@prisme.ai/blocks';

export function computePageStyles(page: Prismeai.DetailedPage) {
  const ids = { last: 0 };
  const styles: string[] = [];
  function computeBlocksStyles(blocks: any = []) {
    return blocks.map((block: any) => {
      const config = block.config ? block.config : block;
      config.cssId = ++ids.last;
      const slug = block.slug || '';

      styles.push(
        getBlockStyles({
          css: config.css,
          defaultStyles: builtinBlocks[slug] ? builtinBlocks[slug].styles : '',
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
