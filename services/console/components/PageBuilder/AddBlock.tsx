import { usePageBuilder } from './context';
import { useTranslation } from 'next-i18next';
import plus from '../../icons/plus.svg';
import { useEffect, useRef, useState } from 'react';

interface AddBlockProps {
  after: number;
}
const AddBlock = ({ after }: AddBlockProps) => {
  const { t } = useTranslation('workspaces');
  const { addBlock } = usePageBuilder();
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
        className="relative flex flex-row bg-accent p-1 rounded transition-all whitespace-nowrap overflow-hidden"
        style={{
          width,
          boxShadow: '0 0 0px 10px white',
        }}
        onMouseEnter={() => setWidth(`${maxWidth}px`)}
        onMouseLeave={() => setWidth(`${26}px`)}
        onClick={() => addBlock(after + 1)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={plus.src} alt="" className="w-[13px] h-[13px] m-1" />
        <span className="text-white mx-2">{t('pages.blocks.add')}</span>
      </button>
    </div>
  );
};

export default AddBlock;
