import { FC, ReactNode, useState } from 'react';
import { useBlocks } from '../../Provider/blocksContext';
import tw from '../../tw';
import { DownOutlined } from '@ant-design/icons';
import { StretchContent } from '@prisme.ai/design-system';

const Accordion: FC<{
  title: ReactNode;
}> = ({ title, children }) => {
  const [visible, setVisible] = useState(false);
  const {
    components: { DownIcon },
  } = useBlocks();

  return (
    <div className={tw`accordion__container container flex flex-1 flex-col`}>
      <button
        className={tw`container__button button flex flex-1 justify-between items-center p-1`}
        onClick={() => setVisible(!visible)}
      >
        {title}
        {DownIcon ? (
          <DownIcon />
        ) : (
          <DownOutlined
            className={tw`button__icon icon transition-transform ${
              visible ? '-rotate-180' : ''
            }`}
          />
        )}
      </button>
      <StretchContent visible={visible}>
        <div
          className={tw`container__accordion-content-container accordion-content-container p-2`}
        >
          {children}
        </div>
      </StretchContent>
    </div>
  );
};

export default Accordion;
