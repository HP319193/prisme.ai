import { useCallback } from 'react';
import { useBlock } from '../Provider';
import useLocalizedText from '../useLocalizedText';
import { Button } from '@prisme.ai/design-system';
import tw from '../tw';
import { ButtonProps } from '@prisme.ai/design-system/lib/Components/Button';

export interface ButtonElementProps {
  text: Prismeai.LocalizedText;
  variant?: ButtonProps['variant'];
  onClick:
    | string
    | {
        event: string;
        payload: any;
      };
  tag: string;
  unselected: boolean;
}

interface ButtonsConfig {
  buttons: ButtonElementProps[];
}

export const Buttons = () => {
  const { localize } = useLocalizedText();
  const { config: { buttons } = {}, events } = useBlock<ButtonsConfig>();

  const onBtnClick = useCallback(
    (clickProps) => {
      if (!events) return;

      if (typeof clickProps == 'string') events.emit(clickProps);
      else events.emit(clickProps.event, clickProps.payload);
    },
    [events]
  );

  if (!buttons) return null;

  return (
    <div className={`block-buttons ${tw`flex p-8 flex-1 flex-row space-x-1`}`}>
      {buttons.map(
        ({ text, onClick, tag, unselected, variant = 'default' }) => (
          <Button
            variant={variant}
            onClick={() => onBtnClick(onClick)}
            tag={tag}
            unselected={unselected}
          >
            {localize(text)}
          </Button>
        )
      )}
    </div>
  );
};

export default Buttons;
