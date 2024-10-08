import { PowerSyncDatabase } from '@powersync/web';
import { PowerSyncContext } from '@powersync/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { AppSchema } from './lib/schema';
import { SupabaseConnector } from './lib/supabase';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

function App() {
    const powersync = React.useMemo(() => {
        const powersync = new PowerSyncDatabase({
            schema: AppSchema,
            database: {
                dbFilename: 'groceries.db',
            },
        });

        powersync.connect(new SupabaseConnector());

        return powersync;
    }, []);

    const queryClient = React.useMemo(() => new QueryClient(), []);

    return (
        <PowerSyncContext.Provider value={powersync}>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </PowerSyncContext.Provider>
    );
}

export default App;
