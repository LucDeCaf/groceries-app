import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { useSuspenseQuery } from '@powersync/tanstack-react-query';
import { Suspense } from 'react';
import { GroceryItem, Group, GroupGroceryItem } from '../lib/schema';
import { UserResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { InteractiveList } from '../components/InteractiveList';
import { usePowerSync } from '@powersync/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const Route = createLazyFileRoute('/')({
  component: () => (
    <Suspense fallback={<Loading />}>
      <Page />
    </Suspense>
  ),
});

function Loading() {
  return <main className='p-8'>Loading...</main>;
}

function Page() {
  const router = useRouter();
  const powersync = usePowerSync();

  const {
    data: {
      data: { user },
      error,
    },
  } = useSuspenseQuery<UserResponse>({
    queryKey: ['user'],
    queryFn: () => supabase.auth.getUser(),
  });

  if (error) {
    console.error(error);
  }

  if (!user) {
    router.navigate({ to: '/login' });
    return;
  }

  const { household_id: householdId } = useSuspenseQuery<{
    household_id: string;
  }>({
    queryKey: ['household_id'],
    query: 'select household_id from profiles where id = ?;',
    parameters: [user.id],
  }).data[0];

  const { data: selectedItems } = useSuspenseQuery<GroceryItem>({
    queryKey: ['selected_items'],
    query:
      'select * from grocery_items where is_selected = 1 order by name desc;',
  });

  const { data: unselectedItems } = useSuspenseQuery<GroceryItem>({
    queryKey: ['unselected_items'],
    query:
      'select * from grocery_items where is_selected = 0 order by name desc;',
  });

  const { data: groups } = useSuspenseQuery<Group>({
    queryKey: ['groups'],
    query: 'select * from groups where is_aisle = 0 order by "index" desc;',
  });

  const { data: aisles } = useSuspenseQuery<Group>({
    queryKey: ['aisles'],
    query: 'select * from groups where is_aisle = 1 order by "index" desc;',
  });

  const { data: relationships } = useSuspenseQuery<GroupGroceryItem>({
    queryKey: ['groups_grocery_items'],
    query: 'select * from groups_grocery_items;',
  });

  const groceryItems = new Map<string, GroceryItem>();
  selectedItems.forEach((item) => groceryItems.set(item.id, { ...item }));
  unselectedItems.forEach((item) => groceryItems.set(item.id, { ...item }));

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

      <h2>Selected Items</h2>
      <InteractiveList
        renderItems={selectedItems.map((item) => item.name)}
        onItemClick={(_e, i) => toggleSelected(selectedItems[i])}
      />

      <br />

      <h2>Unselected Items</h2>
      <InteractiveList
        renderItems={unselectedItems.map((item) => item.name)}
        onItemClick={(_e, i) => toggleSelected(unselectedItems[i])}
      />

      <br />

      <h2>All Groups</h2>
      {groups.length ? (
        <Accordion type='single' collapsible className='w-full'>
          {groups.map((group, i) => (
            <AccordionItem key={i} value={i.toString()}>
              <AccordionTrigger>{group.name}</AccordionTrigger>
              <AccordionContent>
                {relationships
                  .filter((rel) => rel.group_id === group.id)
                  .map((rel) => groceryItems.get(rel.grocery_item_id)!)
                  .filter((item) => !item.is_selected)
                  .map((item) => (
                    <button
                      key={item.id}
                      className='w-full h-full text-start'
                      onClick={() => toggleSelected(item)}
                    >
                      {item.name}
                    </button>
                  ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className='pt-2 text-gray-500'>• No groups</div>
      )}

      <br />

      <h2>All Aisles</h2>
      {aisles.length ? (
        <Accordion type='single' collapsible className='w-full'>
          {aisles.map((item, i) => (
            <AccordionItem key={i} value={i.toString()}>
              <AccordionTrigger>{item.name}</AccordionTrigger>
              <AccordionContent>Items go in here</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className='pt-2 text-gray-500'>• No aisles</div>
      )}
    </main>
  );
}
