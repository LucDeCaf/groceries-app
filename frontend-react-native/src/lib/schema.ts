import { column, Schema, Table } from '@powersync/react-native';

const profiles = new Table(
  {
    // id column (text) is automatically included
    household_id: column.text,
  },
  { indexes: {} },
);

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

const grocery_items = new Table(
  {
    // id column (text) is automatically included
    household_id: column.text,
    created_at: column.text,
    name: column.text,
    comment: column.text,
    group_id: column.text,
  },
  { indexes: {} },
);

const groups_grocery_items = new Table(
  {
    // id column (text) is automatically included
    household_id: column.text,
    group_id: column.text,
    grocery_item_id: column.text,
  },
  { indexes: {} },
);

export const AppSchema = new Schema({
  profiles,
  groups,
  grocery_items,
  groups_grocery_items,
});

export type Database = (typeof AppSchema)['types'];

export type Group = {
  id: string;
  household_id: string;
  created_at: string;
  name: string;
  index: number;
  is_aisle: 0 | 1;
};
