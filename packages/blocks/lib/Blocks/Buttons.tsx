import { useBlock } from '../Provider';
import useLocalizedText from '../useLocalizedText';
import { Button } from '@prisme.ai/design-system';
import { ButtonProps } from '@prisme.ai/design-system/lib/Components/Button';
import ActionOrLink, { Action } from './ActionOrLink';
import { BaseBlock } from './BaseBlock';
import { BaseBlockConfig } from './types';

export interface ButtonElementProps {
  text: Prismeai.LocalizedText;
  variant?: ButtonProps['variant'];
  action: Action;
  tag: string;
  unselected: boolean;
}

interface ButtonsConfig extends BaseBlockConfig {
  buttons: ButtonElementProps[];
}

export const Buttons = ({ buttons = [], className }: ButtonsConfig) => {
  const { localize } = useLocalizedText();

  if (!Array.isArray(buttons)) return null;

  return (
    <div className={`pr-block-buttons block-buttons ${className}`}>
      {buttons.map(
        ({ text, action, tag, unselected, variant = 'default' }, index) => (
          <ActionOrLink action={action} key={index}>
            <Button
              variant={variant}
              tag={localize(tag)}
              unselected={unselected}
              className="pr-block-buttons__button"
            >
              {localize(text)}
            </Button>
          </ActionOrLink>
        )
      )}
    </div>
  );
};

const defaultStyles = `:block {
  display: flex;
  flex: 1 1 0%;
  flex-direction: row;
  margin: 0 .25rem;
}`;
export const ButtonsInContext = () => {
  const { config } = useBlock<ButtonsConfig>();

  return (
    <BaseBlock defaultStyles={defaultStyles}>
      <Buttons {...config} />
    </BaseBlock>
  );
};
ButtonsInContext.styles = defaultStyles;

export default ButtonsInContext;
