interface InteractiveListProps {
  renderItems: string[];
  onItemClick: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    i: number,
  ) => any;
  onDeleteItemClick: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    i: number,
  ) => any;
}

export const InteractiveList = ({
  renderItems,
  onItemClick,
  onDeleteItemClick,
}: InteractiveListProps) => {
  return (
    <ul className='flex flex-col rounded-md'>
      {renderItems.map((item, i) => (
        <li className='border-b flex justify-between' key={i}>
          <button
            className='p-3 w-full h-full text-start'
            onClick={(e) => onItemClick(e, i)}
          >
            {item}
          </button>
          <button
            className='text-red-500 font-medium pr-3'
            onClick={(e) => onDeleteItemClick(e, i)}
          >
            X
          </button>
        </li>
      ))}
    </ul>
  );
};
