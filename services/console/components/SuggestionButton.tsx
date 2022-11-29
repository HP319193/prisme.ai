export interface SuggestionButtonProps {
  title: string;
  text: string;
  className?: string;
  color?: string;
  onClick?: () => void;
}

export const SuggestionButton = ({
  title,
  text,
  className,
  color,
  onClick,
}: SuggestionButtonProps) => {
  return (
    <button
      className={`
        focus:outline-none
        flex flex-col rounded flex-1 m-2 p-4 text-sm text-left justify-between
        transition-all group
        hover:shadow-2xl hover:-translate-y-2
        ${className}
      `}
      style={{
        backgroundColor: color,
      }}
      onClick={onClick}
    >
      <div className="flex flex-col">
        <div className="font-bold mb-2">{title}</div>
        <div className="relative min-h-[55px]">
          <div className="transition-all opacity-100 group-hover:opacity-0">
            {text}
          </div>
          <div
            className="
            absolute top-0
        flex flex-row mt-4 py-2 px-4 rounded text-3xl
        bg-[white] transition-all whitespace-nowrap overflow-hidden
          opacity-0 group-hover:opacity-100
          "
            style={{ color }}
          >
            +
          </div>
        </div>
      </div>
    </button>
  );
};

export default SuggestionButton;
