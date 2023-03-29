import { getBlockStyles, builtinBlocks } from '@prisme.ai/blocks';

export function computePageStyles(page: Prismeai.DetailedPage) {
  const styles: string[] = [];
  // @ts-ignore
  page.cssId = parseInt(Math.random() * 10000000, 10);
  function computeBlocksStyles(blocks: any = []) {
    if (!Array.isArray(blocks)) return blocks;
    return blocks.map((block: any) => {
      const config = block.config ? block.config : block;
      config.cssId = parseInt(`${Math.random() * 10000000}`, 10);
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
  page.blocks = computeBlocksStyles(page.blocks || []);

  return { page, styles: styles.join('\n') };
}
