import { Loading as DSLoading, SchemaForm } from '@prisme.ai/design-system';
//@ts-ignore
import { tw } from 'twind';
import { BlocksDependenciesContext } from './blocksContext';

export const Link: BlocksDependenciesContext['components']['Link'] = (
  props
) => <a {...props} />;
export const Loading: BlocksDependenciesContext['components']['Loading'] =
  () => (
    <DSLoading
      className={tw`bg-white absolute top-0 right-0 bottom-0 left-0`}
    />
  );

export { SchemaForm };
