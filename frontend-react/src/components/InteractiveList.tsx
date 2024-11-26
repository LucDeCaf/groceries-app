interface InteractiveListProps {
  renderItems: string[];
  onItemClick: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    i: number,
  ) => any;
}

export const InteractiveList = ({
  renderItems,
  onItemClick,
}: InteractiveListProps) => {
  return (
    <ul className='flex flex-col rounded-md'>
      {renderItems.map((item, i) => (
        <ListItem key={i}>
          <button
            className='p-3 w-full h-full text-start'
            onClick={(e) => onItemClick(e, i)}
          >
            {item}
          </button>
        </ListItem>
      ))}
    </ul>
  );
};

const ListItem = (props: { children: React.ReactNode; className?: string }) => {
  return (
    <li className={'border-b ' + (props.className ?? '')}>{props.children}</li>
  );
};
