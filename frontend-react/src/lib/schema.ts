import { column, Schema, Table } from '@powersync/web';

const profiles = new Table(
  {
    // id column (text) is automatically included
    household_id: column.text,
  },
  { indexes: {} },
);

export type Profile = {
  id: string;
  household_id: string;
};

const groups = new Table(
  {
    // id column (text) is automatically included
    household_id: column.text,
    created_at: column.text,
    name: column.text,
    index: column.integer,
    is_aisle: column.integer,
  },
  { indexes: {} },
);

export type Group = {
  id: string;
  household_id: string;
  name: string;
  index: number;
  is_aisle: boolean;
};

const grocery_items = new Table(
  {
    // id column (text) is automatically included
    household_id: column.text,
    created_at: column.text,
    name: column.text,
    comment: column.text,
    group_id: column.text,
    is_selected: column.integer,
  },
  { indexes: {} },
);

export type GroceryItem = {
  id: string;
  household_id: string;
  created_at: string;
  name: string;
  comment: string;
  group_id: string;
  is_selected: boolean;
};

const groups_grocery_items = new Table(
  {
    // id column (text) is automatically included
    household_id: column.text,
    group_id: column.text,
    grocery_item_id: column.text,
  },
  { indexes: {} },
);

export type GroupGroceryItem = {
  household_id: string;
  group_id: string;
  grocery_item_id: string;
};

export const AppSchema = new Schema({
  profiles,
  groups,
  grocery_items,
  groups_grocery_items,
});

export type Database = (typeof AppSchema)['types'];
