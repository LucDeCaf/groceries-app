import { PowerSyncDatabase } from '@powersync/web';
import { PowerSyncContext } from '@powersync/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { AppSchema } from './lib/schema';
import { SupabaseConnector } from './lib/supabase';

async function App() {
    const powersync = await React.useMemo(async () => {
        const powersync = new PowerSyncDatabase({
            schema: AppSchema,
            database: {
                dbFilename: 'groceries.db',
            },
        });

        await powersync.connect(new SupabaseConnector());

        return powersync;
    }, []);

    const queryClient = React.useMemo(() => new QueryClient(), []);

    return (
        <PowerSyncContext.Provider value={powersync}>
            <QueryClientProvider client={queryClient}>
                <Page />
            </QueryClientProvider>
        </PowerSyncContext.Provider>
    );
}

function Page() {
    return <main></main>;
}

export default App;
