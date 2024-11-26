import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { useSuspenseQuery } from '@powersync/tanstack-react-query';
import { Suspense } from 'react';
import { GroceryItem, Group } from '../lib/schema';
import {
  GenerateRecoveryLinkParams,
  UserResponse,
} from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { InteractiveList } from '../components/InteractiveList';
import { usePowerSync } from '@powersync/react';

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
    query: 'select * from groups where is_aisle = 0 order by name desc;',
  });

  const { data: aisles } = useSuspenseQuery<Group>({
    queryKey: ['aisles'],
    query: 'select * from groups where is_aisle = 1 order by name desc;',
  });

  function toggleSelected(item: GroceryItem) {
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
      <InteractiveList
        renderItems={groups.map((item) => item.name)}
        onItemClick={(_e, i) => console.log(`${i}th group clicked`)}
      />

      <br />

      <h2>All Aisles</h2>
      <InteractiveList
        renderItems={aisles.map((item) => item.name)}
        onItemClick={(_e, i) => console.log(`${i}th aisle clicked`)}
      />
    </main>
  );
}
