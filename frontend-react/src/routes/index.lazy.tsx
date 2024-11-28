import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { Suspense, useRef, useState } from 'react';
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
          itemLabel='group'
          groups={groups}
          relationships={relationships}
          householdId={householdId}
          groceryItems={groceryItems}
          onItemClick={toggleSelected}
          onDeleteGroupClick={(group) => {
            if (
              confirm(
                `Permanently delete group '${group.name}'?\nGrocery items will not be deleted.`,
              )
            ) {
              powersync.execute('delete from groups where id = ?;', [group.id]);
              powersync.execute(
                `update groups set "index" = "index" - 1 where is_aisle = false and "index" > ?;`,
                [group.index],
              );
            }
          }}
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
          itemLabel='aisle'
          groups={aisles}
          groceryItems={groceryItems}
          relationships={relationships}
          householdId={householdId}
          onItemClick={toggleSelected}
          onDeleteGroupClick={(aisle) => {
            if (
              confirm(
                `Permanently delete aisle '${aisle.name}'?\nGrocery items will not be deleted.`,
              )
            ) {
              powersync.execute('delete from groups where id = ?;', [aisle.id]);
              powersync.execute(
                `update groups set "index" = "index" - 1 where is_aisle = true and "index" > ?;`,
                [aisle.index],
              );
            }
          }}
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
  itemLabel,
}: {
  group: Group;
  itemsInGroup: GroceryItem[];
  itemsNotInGroup: GroceryItem[];
  householdId: string;
  itemLabel: string;
}) {
  const powersync = usePowerSync();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Popover>
      <PopoverTrigger className='w-full border rounded-md p-2 text-base'>
        Edit {itemLabel}
      </PopoverTrigger>
      <PopoverContent className='flex flex-col gap-4'>
        <h3 className='text-gray-400 text-medium'>Edit {itemLabel}</h3>
        <hr className='m-0' />
        <div className='flex gap-4'>
          <input
            className='w-full rounded-sm px-2'
            type='text'
            defaultValue={group.name}
            ref={inputRef}
          />
          <Button
            variant='primary'
            className='aspect-square h-full p-1 flex items-center'
            onClick={() => {
              powersync.execute('update groups set name = ? where id = ?;', [
                inputRef.current!.value,
                group.id,
              ]);
            }}
          >
            ✓
          </Button>
        </div>
        <hr />
        <ul className='flex flex-col gap-2'>
          {itemsInGroup.map((item) => (
            <li key={item.id} className='flex gap-4 items-center'>
              <input
                type='checkbox'
                checked
                onChange={() =>
                  powersync.execute(
                    'delete`from groups_grocery_items where group_id = ? and grocery_item_id = ?;',
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
  itemLabel: string;
  onItemClick?: (item: GroceryItem) => any;
  onDeleteGroupClick?: (group: Group) => any;
}

function GroupsList({
  groups,
  relationships,
  groceryItems,
  householdId,
  itemLabel,
  onItemClick,
  onDeleteGroupClick,
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
              <div className='flex gap-4'>
                <EditGroupButton
                  group={group}
                  itemsInGroup={groupItems}
                  itemsNotInGroup={notGroupItems}
                  householdId={householdId}
                  itemLabel={itemLabel}
                />
                <Button
                  variant='danger'
                  className='aspect-square'
                  onClick={() =>
                    onDeleteGroupClick && onDeleteGroupClick(group)
                  }
                >
                  X
                </Button>
              </div>

              {unselectedGroupItems.map((item, i) => (
                <button
                  key={i}
                  className='w-full flex items-center gap-4'
                  onClick={() => onItemClick && onItemClick(item)}
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
