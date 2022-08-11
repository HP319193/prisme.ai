import { Tooltip } from '@prisme.ai/design-system';
import Image from 'next/image';
import { usePageBuilder } from './context';
import { useTranslation } from 'next-i18next';
import plus from '../../icons/plus.svg';

interface AddBlockProps {
  after: number;
  centered?: boolean;
}
const AddBlock = ({ after, centered = false }: AddBlockProps) => {
  const { t } = useTranslation('workspaces');
  const { addBlock } = usePageBuilder();
  return (
    <div
      className={`flex justify-center absolute ${
        centered ? 'right-0 left-0' : 'left-[-10px] top-[-10px]'
      } z-10`}
    >
      <Tooltip title={t('pages.blocks.add')}>
        <button
          className={`flex justify-center items-center bg-graph-accent text-white ${
            centered ? 'rounded-[.5rem] p-1 px-3' : 'rounded-[0.3rem] w-5 h-5'
          } !text-[0.81rem]`}
          onClick={() => addBlock(after + 1)}
        >
          <span className={`flex ${centered ? 'mr-2' : ''}`}>
            <Image src={plus.src} width={11} height={11} alt="" />
          </span>
          {centered && t('pages.blocks.add')}
        </button>
      </Tooltip>
    </div>
  );
};

export default AddBlock;
