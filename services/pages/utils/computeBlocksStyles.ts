import { getBlockStyles, builtinBlocks } from '@prisme.ai/blocks';

export function computePageStyles(page: Prismeai.DetailedPage) {
  const styles: string[] = [];

  function computeCss(o: any): any {
    if (!o) return o;
    if (Array.isArray(o)) {
      return o.map(computeCss);
    }
    if (typeof o === 'object') {
      if (o.css !== undefined) {
        const slug = o.slug || '';
        const { styles: defaultStyles } = (builtinBlocks as any)[slug] || {
          styles: '',
        };
        o.cssId = parseInt(`${Math.random() * 10000000}`, 10);

        styles.push(
          getBlockStyles({
            css: o.css,
            defaultStyles,
            containerClassName: `__block-${o.cssId}`,
            parentClassName: '',
          })
        );
      }
      return Object.entries<{ css?: string }>(o).reduce((prev, [k, v]) => {
        return {
          ...prev,
          [k]: computeCss(v),
        };
      }, {});
    }
    return o;
  }
  // @ts-ignore
  page.cssId = parseInt(Math.random() * 10000000, 10);
  page.blocks = computeCss(page.blocks);

  return { page, styles: styles.join('\n') };
}
