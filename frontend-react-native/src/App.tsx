import '@azure/core-asynciterator-polyfill';
import 'react-native-url-polyfill/auto';
import { StatusBar } from 'expo-status-bar';
import {
    ActivityIndicator,
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Auth } from '@/components/Auth';
import { Button, Tab, TabView } from '@rneui/themed';

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
    const [tabIndex, setTabIndex] = useState(0);

    return (
        <View style={styles.page}>
            <ScrollView style={styles.contentContainer}>
                <Button>
                    <Text style={styles.buttonText}>Add an item</Text>
                </Button>
            </ScrollView>
            <View style={styles.footer}>
                <Tab value={tabIndex} onChange={setTabIndex} variant='primary'>
                    <Tab.Item title='List' />
                    <Tab.Item title='List' />
                    <Tab.Item title='List' />
                </Tab>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        padding: 16,
        paddingTop: 32,
    },
    buttonText: {
        color: '#fff',
        fontSize: 24,
    },
    footer: {
        backgroundColor: '#fff',
        shadowColor: 'black',
        shadowRadius: 10,
        shadowOpacity: 0.1,
    },
});
