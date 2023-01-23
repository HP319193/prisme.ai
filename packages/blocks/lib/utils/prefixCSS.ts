// Cannot use css defaule module because css.stringify comes with
// require('fs') and breaks browser land
// @ts-ignore
import parse from 'css/lib/parse';
// @ts-ignore
import Identity from 'css/lib/stringify/identity';

export function prefixCSS(cssText: string, prefix: string) {
  try {
    const parsed = parse(cssText);
    parsed.stylesheet?.rules.forEach((item: any) => {
      if (item.type !== 'rule') return;
      item.selectors = (item.selectors || []).map((sel: string) =>
        sel.match(/:block/) ? sel.replace(/:block/, prefix) : `${prefix} ${sel}`
      );
    });
    const compiler = new Identity();
    return compiler.compile(parsed);
  } catch {
    return cssText;
  }
}

export default prefixCSS;
