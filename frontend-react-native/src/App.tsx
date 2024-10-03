import '@azure/core-asynciterator-polyfill';
import 'react-native-url-polyfill/auto';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text } from 'react-native';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Auth } from '@/components/Auth';

export default function App() {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, []);

    return (
        <>
            {loading ? (
                <ActivityIndicator />
            ) : session ? (
                <Page session={session} setSession={setSession} />
            ) : (
                <Auth />
            )}
            <StatusBar style='auto' />
        </>
    );
}

interface PageProps {
    session: Session;
    setSession: Dispatch<SetStateAction<Session | null>>;
}

function Page({ session, setSession }: PageProps) {
    return <View></View>;
}
