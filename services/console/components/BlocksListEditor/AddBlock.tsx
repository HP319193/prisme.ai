import { ReactNode, useEffect, useRef, useState } from 'react';
import plus from '../../icons/plus.svg';
import { Dropdown, Menu } from 'antd';
import { paste } from '../../utils/Copy';
import { Block } from '../../providers/Block';
import { useTranslation } from 'next-i18next';

interface AddBlockProps {
  onClick: (block?: Block) => void;
  children: ReactNode;
}
const AddBlock = ({ onClick, children }: AddBlockProps) => {
  const { t } = useTranslation('workspaces');
  const labelRef = useRef<HTMLButtonElement>(null);
  const [maxWidth, setMaxWidth] = useState(0);
  const [width, setWidth] = useState('auto');

  useEffect(() => {
    if (!labelRef.current) return;
    const { width } = labelRef.current.getBoundingClientRect();
    setMaxWidth(+width.toFixed());
    setWidth('26px');
  }, []);

  return (
    <div className="flex justify-center relative">
      <div
        className="absolute top-[50%] left-[50%] border-t-[1px] border-[#BFD7FF]"
        style={{
          width: `${maxWidth}px`,
          marginLeft: `-${maxWidth / 2}px`,
          zIndex: 0,
        }}
      />
      <button
        ref={labelRef}
        className="relative flex flex-row !bg-accent p-1 rounded transition-all whitespace-nowrap overflow-hidden items-center"
        style={{
          width,
          boxShadow: '0 0 0px 10px inherit',
        }}
        onMouseEnter={() => setWidth(`${maxWidth}px`)}
        onMouseLeave={() => setWidth(`${26}px`)}
        onClick={() => onClick()}
        type="button"
      >
        <Dropdown
          overlay={
            <Menu
              onClick={(e) => e.domEvent.stopPropagation()}
              items={[
                {
                  key: '1',
                  label: t('blocks.builder.add.label'),
                  onClick: () => onClick(),
                },
                {
                  key: '2',
                  label: t('blocks.builder.paste.label'),
                  onClick: async (e) => {
                    try {
                      const block = JSON.parse(await paste());
                      if (!block.slug) return;
                      onClick(block);
                    } catch {}
                  },
                },
              ]}
            />
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={plus.src} alt="" className="w-[13px] h-[13px] m-1" />
        </Dropdown>
        <span className="text-white mx-2">{children}</span>
      </button>
    </div>
  );
};

export default AddBlock;
