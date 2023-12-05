import { useCallback } from 'react';
import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';
import useLocalizedText from '../useLocalizedText';
import { BaseBlock } from './BaseBlock';
import { BaseBlockConfig } from './types';

export interface SigninConfig extends BaseBlockConfig {
  label: string | Prismeai.LocalizedText;
  up?: true;
  redirect?: string;
}

export const Signin = ({
  label = 'Signin',
  up,
  redirect,
  className,
}: SigninConfig) => {
  const {
    utils: { auth: { getSigninUrl, getSignupUrl } = {} },
  } = useBlocks();

  const { localize } = useLocalizedText();
  const signin = useCallback(async () => {
    if (!getSigninUrl) return;
    const url = await getSigninUrl({ redirect });
    window.location.assign(url);
  }, [getSigninUrl]);

  const signup = useCallback(async () => {
    if (!getSignupUrl) return;
    const url = await getSignupUrl({ redirect });
    window.location.assign(url);
  }, [getSignupUrl]);

  return (
    <button onClick={up ? signup : signin} className={className}>
      {localize(label)}
    </button>
  );
};

const defaultStyles = `:block {
  display: flex;
  border-radius: 1rem;
  align-self: center;
  padding: 0.5rem 1rem;
  background: var(--color-accent);
  color: var(--color-accent-contrast);
}`;

export const SigninInContext = () => {
  const { config } = useBlock<SigninConfig>();
  return (
    <BaseBlock defaultStyles={defaultStyles}>
      <Signin {...config} />
    </BaseBlock>
  );
};

export default SigninInContext;
