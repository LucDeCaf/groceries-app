import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { useSuspenseQuery } from '@powersync/tanstack-react-query';
import { LiHTMLAttributes, Suspense } from 'react';
import { GroceryItem, Group } from '../lib/schema';
import { UserResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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
    queryKey: ['selected'],
    query:
      'select * from grocery_items where is_selected = 1 order by name desc;',
  });

  const { data: groups } = useSuspenseQuery<Group>({
    queryKey: ['groups'],
    query: 'select * from groups order by name desc;',
  });

  return (
    <main className='p-8'>
      <h2>Selected Items</h2>
      <ul className='border-2 flex flex-col rounded-md'>
        {groceryItems.length ? (
          groceryItems.map((item, i) => <ListItem key={i} item={item} />)
        ) : (
          <ListItem item={{ name: 'No items' }} />
        )}
      </ul>

      <br />

      <h2>All Groups</h2>
      <ul className='border-2 flex flex-col rounded-md'>
        {groups.map((item, i) => (
          <ListItem key={i} item={item} />
        ))}
      </ul>
    </main>
  );
}

interface Item {
  name: string;
}

interface ListItemProps extends LiHTMLAttributes<HTMLLIElement> {
  item: Item;
}

function ListItem({ item, ...props }: ListItemProps) {
  return (
    <li className='p-2 border-b-2 last:border-b-0' {...props}>
      {item.name}
    </li>
  );
}
