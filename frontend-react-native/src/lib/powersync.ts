import { PowerSyncDatabase } from '@powersync/react-native';
import { AppSchema } from './schema';
import { SupabaseConnector } from './supabase';

export const db = new PowerSyncDatabase({
    schema: AppSchema,
    database: {
        dbFilename: 'index.db',
    },
});

export const connector = new SupabaseConnector();

export const openConnection = async () => {
    if (!db.connected) {
        await db.connect(connector);
    }
};
