import { Tooltip } from '@prisme.ai/design-system';
import { useSourceDetails } from '../SourceDetails';

interface SectionContentProps {
  title: string;
  date: string;
  type: string;
  read: boolean;
}

export const SectionContent = ({
  title,
  date,
  type,
  read,
}: SectionContentProps) => {
  const { photo, name, description } = useSourceDetails();
  return (
    <Tooltip title={description}>
      <div className="flex flex-col">
        <div className={`flex flex-row ${read ? 'opacity-50' : ''}`}>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              height={32}
              width={32}
              className="mr-2"
              alt={name}
            />
          )}
          <div className="font-bold">{title}</div>
          <div className="text-gray font-thin ml-4">{date}</div>
        </div>
        <div className="font-normal">{type}</div>
      </div>
    </Tooltip>
  );
};

export default SectionContent;
