import { GroceryItem } from '@/lib/schema';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { usePowerSync } from '@powersync/react';
import { forwardRef, useRef } from 'react';
import { Button } from './Button';

interface ItemsListProps {
  items: GroceryItem[];
  onItemClick: (item: GroceryItem) => any;
}

export const ItemsList = ({ items, onItemClick }: ItemsListProps) => {
  return (
    <ul className='flex flex-col rounded-md'>
      {items.map((item) => (
        <li
          className='border-b flex justify-between items-center'
          key={item.id}
        >
          <button
            className='py-3 w-full h-full text-start'
            onClick={() => onItemClick(item)}
          >
            <span className='w-full text-lg'>{item.name}</span>
            {item.comment && (
              <span className='block max-w-60 md:max-w-80 text-gray-500 text-sm overflow-hidden overflow-ellipsis whitespace-nowrap'>
                {item.comment}
              </span>
            )}
          </button>
          <EditItemButton item={item} />
        </li>
      ))}
    </ul>
  );
};

function EditItemButton({ item }: { item: GroceryItem }) {
  const powersync = usePowerSync();
  const nameRef = useRef<HTMLInputElement>(null);
  const commentRef = useRef<HTMLInputElement>(null);

  return (
    <Popover>
      <PopoverTrigger className='flex items-center text-lg font-light'>
        •••
      </PopoverTrigger>
      <PopoverContent className='flex flex-col gap-4'>
        <h3 className='text-gray-400 text-medium'>Edit {item.name}</h3>
        <hr />
        <InputWithSave
          defaultValue={item.name}
          placeholder='Name'
          ref={nameRef}
          onSave={() => {
            powersync.execute(
              'update grocery_items set name = ? where id = ?;',
              [nameRef.current!.value, item.id],
            );
          }}
        />
        <InputWithSave
          defaultValue={item.comment}
          placeholder='Comment'
          ref={commentRef}
          onSave={() => {
            powersync.execute(
              'update grocery_items set comment = ? where id = ?;',
              [commentRef.current!.value, item.id],
            );
          }}
        />
        <hr />
        <Button
          variant='danger'
          className='p-1'
          onClick={() => {
            if (confirm(`Permanently delete item '${item.name}'?`)) {
              powersync.execute('delete from grocery_items where id = ?;', [
                item.id,
              ]);
            }
          }}
        >
          Delete item
        </Button>
      </PopoverContent>
    </Popover>
  );
}

const InputWithSave = forwardRef<
  HTMLInputElement,
  {
    defaultValue?: string;
    placeholder?: string;
    onSave: React.MouseEventHandler<HTMLButtonElement>;
  }
>(function InputWithSave(props, ref) {
  return (
    <div className='flex gap-4'>
      <input
        className='w-full rounded-sm px-2'
        type='text'
        defaultValue={props.defaultValue}
        placeholder={props.placeholder}
        ref={ref}
      />
      <Button
        variant='primary'
        className='aspect-square h-full p-1 flex items-center'
        onClick={props.onSave}
      >
        ✓
      </Button>
    </div>
  );
});
