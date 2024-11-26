interface InteractiveListProps {
  renderItems: string[];
  onItemClick: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    i: number,
  ) => any;
  noItemsText?: string;
}

export const InteractiveList = ({
  renderItems,
  onItemClick,
  noItemsText = 'No items',
}: InteractiveListProps) => {
  return (
    <ul className='border-2 flex flex-col rounded-md'>
      {renderItems.length ? (
        // Render items
        renderItems.map((item, i) => (
          <ListItem key={i}>
            <button
              className='p-2 w-full h-full text-start'
              onClick={(e) => onItemClick(e, i)}
            >
              {item}
            </button>
          </ListItem>
        ))
      ) : (
        // Render fallback
        <ListItem className='p-2 text-neutral-400'>{noItemsText}</ListItem>
      )}
    </ul>
  );
};

const ListItem = (props: { children: React.ReactNode; className?: string }) => {
  return (
    <li className={'border-b-2 last:border-b-0 ' + (props.className ?? '')}>
      {props.children}
    </li>
  );
};
