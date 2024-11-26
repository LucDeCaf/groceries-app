import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { useSuspenseQuery } from '@powersync/tanstack-react-query';
import { Suspense } from 'react';
import { GroceryItem, Group } from '../lib/schema';
import { UserResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { InteractiveList } from '../components/InteractiveList';

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
  }

  const { data: groceryItems } = useSuspenseQuery<GroceryItem>({
    queryKey: ['selected_items'],
    query:
      'select * from grocery_items where is_selected = 1 order by name desc;',
  });

  const { data: groups } = useSuspenseQuery<Group>({
    queryKey: ['groups'],
    query: 'select * from groups where is_aisle = false order by name desc;',
  });

  const { data: aisles } = useSuspenseQuery<Group>({
    queryKey: ['aisles'],
    query: 'select * from groups where is_aisle = true order by name desc;',
  });

  return (
    <main className='p-8'>
      <h2>Selected Items</h2>
      <InteractiveList
        renderItems={groceryItems.map((item) => item.name)}
        onItemClick={(_e, i) => console.log(`${i}th grocery item clicked`)}
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
