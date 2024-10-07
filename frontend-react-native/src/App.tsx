import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthPage } from '@/components/AuthPage';
import { Tab, TabView } from '@rneui/themed';
import { openConnection } from './lib/powersync';
import { GroupsPage } from './components/GroupsPage';
import { SessionContext } from './context/SessionContext';

export default function App() {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth
            .getSession()
            .then(({ data: { session }, error }) => {
                if (error) throw error;
                setSession(session);
                setLoading(false);
            })
            .then(() => openConnection());

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, []);

    return (
        <SessionContext.Provider value={session}>
            {loading ? (
                <ActivityIndicator />
            ) : session ? (
                <MainPage />
            ) : (
                <AuthPage />
            )}
            <StatusBar style='auto' />
        </SessionContext.Provider>
    );
}

function MainPage() {
    const [tabIndex, setTabIndex] = useState(0);

    return (
        <View style={styles.page}>
            <TabView value={tabIndex} onChange={setTabIndex}>
                <TabView.Item style={{ width: '100%', height: '100%' }}>
                    <GroupsPage />
                </TabView.Item>

                <TabView.Item
                    style={{ width: '100%', height: '100%' }}
                ></TabView.Item>

                <TabView.Item
                    style={{ width: '100%', height: '100%' }}
                ></TabView.Item>
            </TabView>

            <View style={styles.footer}>
                <Tab
                    value={tabIndex}
                    onChange={setTabIndex}
                    variant='primary'
                    indicatorStyle={{
                        backgroundColor: 'white',
                    }}
                >
                    <Tab.Item title='Groups' />
                    <Tab.Item title='List' />
                    <Tab.Item title='Profile' />
                </Tab>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
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
        height: 50,
    },
});
