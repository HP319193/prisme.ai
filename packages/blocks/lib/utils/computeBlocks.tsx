import jsonpath from 'jsonpath';

const TEMPLATE_IF = 'template.if';
const TEMPLATE_REPEAT = 'template.repeat';

interface TemplatedBlock {
  [TEMPLATE_IF]?: string;
  [TEMPLATE_REPEAT]?: {
    on: string;
    as?: string;
  };
}

export function testCondition(condition: string = '', config: any) {
  if (!condition) return true;
  const [, invert, cond] = `${condition}`.match(/(^!?)(.+$)/) || [];
  if (cond === 'true') {
    return invert ? false : true;
  }
  if (cond === 'false') {
    return invert ? true : false;
  }
  const result = jsonpath.value(config, cond);
  return invert ? !result : result;
}

export function computeBlocks(blocks: TemplatedBlock[], config: any) {
  return blocks.filter(({ [TEMPLATE_IF]: _if }) => {
    return testCondition(_if, config);
  });
}
