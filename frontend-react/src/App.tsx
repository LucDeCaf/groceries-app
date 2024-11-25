import { PowerSyncDatabase } from '@powersync/web';
import { PowerSyncContext } from '@powersync/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { AppSchema } from './lib/schema';
import { supabase, SupabaseConnector } from './lib/supabase';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { AuthContext } from './context/auth';
import { Session } from '@supabase/supabase-js';

const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  },
});

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

  const [auth, setAuth] = useState<Session | null>(null);

  useEffect(() => {
    (async () => {
      supabase.auth.onAuthStateChange((_event, session) => {
        setAuth(session);
      });

      const { error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
      }
    })();
  }, []);

  const queryClient = React.useMemo(() => new QueryClient(), []);

  return (
    <AuthContext.Provider value={auth}>
      <PowerSyncContext.Provider value={powersync}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </PowerSyncContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
