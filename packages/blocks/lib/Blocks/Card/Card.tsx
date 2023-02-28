import { useMemo } from 'react';
import { useBlock } from '../../Provider';
import { useBlocks } from '../../Provider/blocksContext';
import { Action, ActionConfig } from '../Action';
import { BaseBlock } from '../BaseBlock';
import { BlocksList, BlocksListConfig } from '../BlocksList';
import { RichText } from '../RichText';
import { BaseBlockConfig } from '../types';

export interface CardConfig extends BaseBlockConfig {
  template: string;
  title?: string;
  subtitle?: string;
  description?: string;
  tag?: string;
  cover?: string;
  content?: BlocksListConfig;
  actions?: ActionConfig[];
}

interface CardProps extends CardConfig {
  events: BlockContext['events'];
  Link: BlocksDependenciesContext['components']['Link'];
}

export const Card = ({
  className,
  template,
  title,
  subtitle,
  description,
  tag,
  cover,
  content,
  actions,
  events,
  Link,
}: CardProps) => {
  const values = useMemo(
    () => ({
      title,
      subtitle,
      description,
      tag,
      cover,
      content,
    }),
    [title, subtitle, description, tag, cover, content]
  );
  return <RichText values={values}>{template}</RichText>;
  // return (
  //   <div className={`pr-block-card ${className}`}>
  //     {cover && (
  //       <div className="pr-block-card__cover">
  //         <img src={cover} />
  //       </div>
  //     )}
  //     <div className="pr-block-card__container">
  //       {title && <div className="pr-block-card__title">{title}</div>}
  //       {subtitle && <div className="pr-block-card__subtitle">{subtitle}</div>}
  //       {description && (
  //         <div className="pr-block-card__description">{description}</div>
  //       )}
  //       {tag && <div className="pr-block-card__tag">{tag}</div>}

  //       {content && (
  //         <BlocksList {...content} className="pr-block-card__content" />
  //       )}
  //       {actions && (
  //         <div className="pr-block-card__actions">
  //           {actions.map((action, key) => (
  //             <Action {...action} key={key} events={events} Link={Link} />
  //           ))}
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );
};

const defaultStyles = `:block {
  position: relative;
  display: flex;
  flex-direction: column;
}
.pr-block-card__container {
  display: flex;
  flex-direction: column;
}
.pr-block-card__title {
  display: flex;
}
.pr-block-card__subtitle {
  display: flex;
}
.pr-block-card__description {
  display: flex;
}
.pr-block-card__tag {
  display: flex;
}
.pr-block-card__cover {
  display: flex;
}
.pr-block-card__content {
  display: flex;
}
.pr-block-card__actions {
  display: flex;
}
`;

export const CardInContext = () => {
  const { config, events } = useBlock<CardConfig>();
  const {
    components: { Link },
  } = useBlocks();

  return (
    <BaseBlock defaultStyles={defaultStyles}>
      <Card {...config} events={events} Link={Link} />
    </BaseBlock>
  );
};
CardInContext.styles = defaultStyles;

export default CardInContext;
