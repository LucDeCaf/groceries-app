import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { Suspense } from 'react';
import { GroceryItem, Group, GroupGroceryItem } from '../lib/schema';
import { InteractiveList } from '../components/InteractiveList';
import { usePowerSync, useSuspenseQuery } from '@powersync/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/context/auth';
import { link } from 'fs';

export const Route = createLazyFileRoute('/')({
  component: () => (
    <Suspense fallback={<Loading />}>
      <Page />
    </Suspense>
  ),
});

function Page() {
  const router = useRouter();
  const powersync = usePowerSync();
  const session = useAuth();

  if (!session) {
    router.navigate({ to: '/login' });
    return;
  }

  const user = session.user;

  const { household_id: householdId } = useSuspenseQuery<{
    household_id: string;
  }>('select household_id from profiles where id = ?;', [user.id]).data[0];

  const { data: groceryItems } = useSuspenseQuery<GroceryItem>(
    'select * from grocery_items;',
  );

  const { data: selectedItems } = useSuspenseQuery<GroceryItem>(
    'select * from grocery_items where is_selected = 1 order by name desc;',
  );

  const { data: unselectedItems } = useSuspenseQuery<GroceryItem>(
    'select * from grocery_items where is_selected = 0 order by name desc;',
  );

  const { data: groups } = useSuspenseQuery<Group>(
    'select * from groups where is_aisle = 0 order by "index" desc;',
  );

  const { data: aisles } = useSuspenseQuery<Group>(
    'select * from groups where is_aisle = 1 order by "index" desc;',
  );

  const { data: relationships } = useSuspenseQuery<GroupGroceryItem>(
    'select * from groups_grocery_items;',
  );

  function toggleSelected(item: GroceryItem) {
    console.log(item);
    powersync.execute(
      'update grocery_items set is_selected = ? where id = ?;',
      [!item.is_selected, item.id],
    );
  }

  return (
    <main className='p-8'>
      <button
        className='w-full p-2 bg-gray-100 rounded-md font-medium'
        onClick={() =>
          powersync.execute(
            'insert into grocery_items (id,household_id,name) values (uuid(),?,?);',
            [householdId, prompt('Enter the name:', 'Test item')],
          )
        }
      >
        Add Item
      </button>

      <br />
      <br />

      <h2 className='text-2xl'>Selected Items</h2>
      {selectedItems.length ? (
        <InteractiveList
          renderItems={selectedItems.map((item) => item.name)}
          onItemClick={(_e, i) => toggleSelected(selectedItems[i])}
        />
      ) : (
        <div>No items</div>
      )}

      <br />

      <h2 className='text-2xl'>Unselected Items</h2>
      {unselectedItems.length ? (
        <InteractiveList
          renderItems={unselectedItems.map((item) => item.name)}
          onItemClick={(_e, i) => toggleSelected(unselectedItems[i])}
        />
      ) : (
        <div>No items</div>
      )}

      <br />

      <h2 className='text-2xl'>Groups</h2>
      {groups.length ? (
        <Accordion type='single' collapsible className='w-full'>
          {groups.map((group, i) => {
            const groupRels = relationships.filter(
              (rel) => rel.group_id === group.id,
            );

            const groupItems = groceryItems.filter((item) =>
              groupRels.some((rel) => rel.grocery_item_id === item.id),
            );
            const notGroupItems = groceryItems.filter(
              (item) =>
                !groupRels.some((rel) => rel.grocery_item_id === item.id),
            );

            const unselectedGroupItems = groupItems.filter(
              (item) => !item.is_selected,
            );

            return (
              <AccordionItem key={i} value={i.toString()}>
                <AccordionTrigger>{group.name}</AccordionTrigger>
                <AccordionContent className='flex flex-col gap-2'>
                  <Popover>
                    <PopoverTrigger className='w-full border rounded-md p-2 text-base'>
                      Edit group
                    </PopoverTrigger>
                    <PopoverContent>
                      <ul>
                        {groupItems.map((item) => (
                          <li key={item.id} className='flex gap-4 items-center'>
                            <input
                              type='checkbox'
                              checked
                              onChange={() =>
                                powersync.execute(
                                  'delete from groups_grocery_items where group_id = ? and grocery_item_id = ?;',
                                  [group.id, item.id],
                                )
                              }
                            />
                            {item.name}
                          </li>
                        ))}
                        {notGroupItems.map((item) => (
                          <li key={item.id} className='flex gap-4 items-center'>
                            <input
                              type='checkbox'
                              onChange={() =>
                                powersync.execute(
                                  'insert into groups_grocery_items (id,household_id,group_id,grocery_item_id) values (uuid(),?,?,?);',
                                  [householdId, group.id, item.id],
                                )
                              }
                            />
                            {item.name}
                          </li>
                        ))}
                      </ul>
                    </PopoverContent>
                  </Popover>

                  {unselectedGroupItems.map((item, i) => (
                    <button
                      key={i}
                      className='w-full flex items-center gap-4'
                      onClick={() => toggleSelected(item)}
                    >
                      <span className='text-sm text-gray-400'>&gt;</span>
                      <span className='text-base'>{item.name}</span>
                    </button>
                  ))}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        <div className='pt-2 text-gray-500'>• No groups</div>
      )}

      <br />

      <h2 className='text-2xl'>Aisles</h2>
      {aisles.length ? (
        <Accordion type='single' collapsible className='w-full'>
          {aisles.map((item, i) => (
            <AccordionItem key={i} value={i.toString()}>
              <AccordionTrigger>{item.name}</AccordionTrigger>
              <AccordionContent>WIP</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className='pt-2 text-gray-500'>• No aisles</div>
      )}
    </main>
  );
}

function Loading() {
  return <main className='p-8'>Loading...</main>;
}
