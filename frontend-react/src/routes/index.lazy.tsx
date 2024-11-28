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
import { Button } from '@/components/Button';

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
    'select * from grocery_items order by name asc;',
  );

  const { data: groups } = useSuspenseQuery<Group>(
    'select * from groups where is_aisle = 0 order by "index" asc;',
  );
  const highestGroupIndex = groups[groups.length - 1].index;

  const { data: aisles } = useSuspenseQuery<Group>(
    'select * from groups where is_aisle = 1 order by "index" asc;',
  );
  const highestAisleIndex = aisles[aisles.length - 1].index;

  const { data: relationships } = useSuspenseQuery<GroupGroceryItem>(
    'select * from groups_grocery_items;',
  );

  const selectedItems = groceryItems.filter((item) => item.is_selected);
  const unselectedItems = groceryItems.filter((item) => !item.is_selected);

  function toggleSelected(item: GroceryItem) {
    powersync.execute(
      'update grocery_items set is_selected = ? where id = ?;',
      [!item.is_selected, item.id],
    );
  }

  return (
    <main className='p-8'>
      <h2 className='text-2xl'>Selected Items</h2>
      {selectedItems.length ? (
        <InteractiveList
          renderItems={selectedItems.map((item) => item.name)}
          onItemClick={(_e, i) => toggleSelected(selectedItems[i])}
          onDeleteItemClick={(_e, i) => {
            const item = selectedItems[i];
            if (confirm(`Permanently delete item '${item.name}'?`)) {
              powersync.execute('delete from grocery_items where id = ?;', [
                item.id,
              ]);
            }
          }}
        />
      ) : (
        <div>No items</div>
      )}

      <br />

      <HeaderWithButton
        title='Unselected items'
        button='Add new item'
        onClick={() => {
          const itemName = prompt('Enter the name:', 'Test item');
          powersync.execute(
            'insert into grocery_items (id,household_id,name) values (uuid(),?,?);',
            [householdId, itemName],
          );
        }}
      />

      {unselectedItems.length ? (
        <InteractiveList
          renderItems={unselectedItems.map((item) => item.name)}
          onItemClick={(_e, i) => toggleSelected(unselectedItems[i])}
          onDeleteItemClick={(_e, i) => {
            const item = unselectedItems[i];
            if (confirm(`Permanently delete item '${item.name}'?`)) {
              powersync.execute('delete from grocery_items where id = ?;', [
                item.id,
              ]);
            }
          }}
        />
      ) : (
        <div>No items</div>
      )}

      <br />

      <HeaderWithButton
        title='Groups'
        button='Add new group'
        onClick={() => {
          const groupName = prompt('Enter the group name:', 'Test group');
          if (groupName) {
            powersync.execute(
              "insert into groups (id,household_id,name,'index',is_aisle) values (uuid(),?,?,?,false);",
              [householdId, groupName, highestGroupIndex + 1],
            );
          }
        }}
      />

      {groups.length ? (
        <GroupsList
          groups={groups}
          relationships={relationships}
          householdId={householdId}
          groceryItems={groceryItems}
          onItemClick={toggleSelected}
        />
      ) : (
        <div className='pt-2 text-gray-500'>• No groups</div>
      )}

      <br />

      <HeaderWithButton
        title='Aisles'
        button='Add new aisle'
        onClick={() => {
          const aisleName = prompt('Enter the aisle name:', 'Test aisle');
          if (aisleName) {
            powersync.execute(
              "insert into groups (id,household_id,name,'index',is_aisle) values (uuid(),?,?,?,true);",
              [householdId, aisleName, highestAisleIndex + 1],
            );
          }
        }}
      />

      {aisles.length ? (
        <GroupsList
          groups={aisles}
          groceryItems={groceryItems}
          relationships={relationships}
          householdId={householdId}
          onItemClick={toggleSelected}
        />
      ) : (
        <div className='pt-2 text-gray-500'>• No aisles</div>
      )}
    </main>
  );
}

function Loading() {
  return <main className='p-8'>Loading...</main>;
}

function EditGroupButton({
  group,
  itemsInGroup,
  itemsNotInGroup,
  householdId,
}: {
  group: Group;
  itemsInGroup: GroceryItem[];
  itemsNotInGroup: GroceryItem[];
  householdId: string;
}) {
  const powersync = usePowerSync();

  return (
    <Popover>
      <PopoverTrigger className='w-full border rounded-md p-2 text-base'>
        Edit group
      </PopoverTrigger>
      <PopoverContent>
        <ul>
          {itemsInGroup.map((item) => (
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
          {itemsNotInGroup.map((item) => (
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
  );
}

interface GroupsListProps {
  groups: Group[];
  groceryItems: GroceryItem[];
  relationships: GroupGroceryItem[];
  householdId: string;
  onItemClick: (item: GroceryItem) => any;
}

function GroupsList({
  groups,
  relationships,
  groceryItems,
  householdId,
  onItemClick,
}: GroupsListProps) {
  return (
    <Accordion type='single' collapsible className='w-full'>
      {groups.map((group, i) => {
        const groupRels = relationships.filter(
          (rel) => rel.group_id === group.id,
        );

        const groupItems = groceryItems.filter((item) =>
          groupRels.some((rel) => rel.grocery_item_id === item.id),
        );
        const notGroupItems = groceryItems.filter(
          (item) => !groupRels.some((rel) => rel.grocery_item_id === item.id),
        );

        const unselectedGroupItems = groupItems.filter(
          (item) => !item.is_selected,
        );

        return (
          <AccordionItem key={i} value={i.toString()}>
            <AccordionTrigger>{group.name}</AccordionTrigger>
            <AccordionContent className='flex flex-col gap-2'>
              <EditGroupButton
                group={group}
                itemsInGroup={groupItems}
                itemsNotInGroup={notGroupItems}
                householdId={householdId}
              />

              {unselectedGroupItems.map((item, i) => (
                <button
                  key={i}
                  className='w-full flex items-center gap-4'
                  onClick={() => onItemClick(item)}
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
  );
}

function HeaderWithButton(props: {
  title: string;
  button: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <div className='w-full flex gap-8 justify-between items-end'>
      <h2 className='text-2xl'>{props.title}</h2>
      <Button variant='link' className='text-lg' onClick={props.onClick}>
        {props.button}
      </Button>
    </div>
  );
}
