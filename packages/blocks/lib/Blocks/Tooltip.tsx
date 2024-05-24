import { useBlock } from '../Provider';
import { BaseBlock } from './BaseBlock';
import { BaseBlockConfig } from './types';
import GenericBlock from './utils/GenericBlock';
import { BlockContent } from './utils/types';
import { Tooltip as TooltipAntd } from '@prisme.ai/design-system';
import { TooltipPlacement } from 'antd/es/tooltip';

interface TooltipProps extends BaseBlockConfig {
  content: BlockContent;
  label: BlockContent;
  placement?: TooltipPlacement;
}

export const Tooltip = ({
  className,
  content,
  label,
  placement = 'left',
}: TooltipProps) => {
  return (
    <TooltipAntd
      overlayClassName={`pr-block-tooltip-overlay ${className}`}
      title={<GenericBlock content={label} />}
      placement={placement}
      trigger={['hover']}
    >
      <span>
        <GenericBlock content={content} />
      </span>
    </TooltipAntd>
  );
};

const defaultStyles = `:block {
  
}
`;

export const TooltipInContext = () => {
  const { config } = useBlock<TooltipProps>();
  return (
    <BaseBlock defaultStyles={defaultStyles}>
      <Tooltip {...config} />
    </BaseBlock>
  );
};
TooltipInContext.styles = defaultStyles;

export default TooltipInContext;
