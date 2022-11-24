import { useBlock } from '../Provider';
import useLocalizedText from '../useLocalizedText';
import { Button } from '@prisme.ai/design-system';
import tw from '../tw';
import { ButtonProps } from '@prisme.ai/design-system/lib/Components/Button';
import ActionOrLink, { Action } from './ActionOrLink';

export interface ButtonElementProps {
  text: Prismeai.LocalizedText;
  variant?: ButtonProps['variant'];
  action: Action;
  tag: string;
  unselected: boolean;
}

interface ButtonsConfig {
  buttons: ButtonElementProps[];
}

export const Buttons = () => {
  const { localize } = useLocalizedText();
  const { config: { buttons } = {} } = useBlock<ButtonsConfig>();

  if (!buttons) return null;

  return (
    <div className={`block-buttons ${tw`flex p-8 flex-1 flex-row space-x-1`}`}>
      {buttons.map(({ text, action, tag, unselected, variant = 'default' }) => (
        <ActionOrLink action={action}>
          <Button variant={variant} tag={tag} unselected={unselected}>
            {localize(text)}
          </Button>
        </ActionOrLink>
      ))}
    </div>
  );
};

export default Buttons;
