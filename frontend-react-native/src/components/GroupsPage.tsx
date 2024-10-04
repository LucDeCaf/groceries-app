import { db } from '@/lib/powersync';
import type { Group } from '@/lib/schema';
import { Button, Icon, ListItem, Text } from '@rneui/themed';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { EditGroupCard } from './EditGroupCard';

interface GroupAccordionProps {
    title: string;
    groups: any[];
    onItemPress?: (group: Group, i: number) => any;
}

const GroupAccordion = ({
    title,
    groups,
    onItemPress,
}: GroupAccordionProps) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <ListItem.Accordion
            animation={{
                duration: 250,
                type: 'timing',
            }}
            isExpanded={expanded}
            onPress={() => setExpanded(!expanded)}
            content={
                <View style={styles.contentContainer}>
                    <Icon name='shopping-cart' type='feather' size={28} />
                    <ListItem.Content>
                        <ListItem.Title style={styles.contentTitle}>
                            {title}
                        </ListItem.Title>
                    </ListItem.Content>
                </View>
            }
        >
            {groups.map((group, i) => (
                <Pressable
                    key={i}
                    onPress={
                        onItemPress ? () => onItemPress(group, i) : undefined
                    }
                >
                    <View>
                        <ListItem style={{ width: '100%' }}>
                            <View style={styles.listItem}>
                                <Text style={styles.listItemText}>
                                    {group.name}
                                </Text>
                                <ListItem.Chevron />
                            </View>
                        </ListItem>
                    </View>
                </Pressable>
            ))}
        </ListItem.Accordion>
    );
};

export const GroupsPage = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [aisles, setAisles] = useState<Group[]>([]);
    const [showEditScreen, setShowEditScreen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group>({} as Group);

    useEffect(() => {
        db.getAll(
            'select * from groups where is_aisle = 0 order by "index" asc;'
        ).then((rows) => {
            setGroups(rows as Group[]);
        });

        db.getAll(
            'select * from groups where is_aisle = 1 order by "index" asc;'
        ).then((rows) => {
            setAisles(rows as Group[]);
        });
    }, []);

    const onItemPress = (group: Group) => {
        setSelectedGroup(group);
        setShowEditScreen(true);
    };

    const saveGroup = (group: Group) => {
        setGroups((prev) => prev.map((g) => (g.id === group.id ? group : g)));
    };

    return (
        <>
            {showEditScreen && (
                <EditGroupCard
                    onClose={() => setShowEditScreen(false)}
                    onSave={saveGroup}
                    onDelete={() => setShowEditScreen(false)}
                    group={selectedGroup}
                ></EditGroupCard>
            )}

            <View style={styles.page}>
                <GroupAccordion
                    groups={aisles}
                    title='Aisles'
                    onItemPress={onItemPress}
                />
                <GroupAccordion
                    groups={groups}
                    title='Groups'
                    onItemPress={onItemPress}
                />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    page: {
        padding: 16,
        paddingTop: 32,
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row',
        gap: 16,
    },
    contentTitle: {
        fontSize: 20,
    },
    listItem: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    listItemText: {
        // marginVertical: 10,
        fontSize: 20,
        color: '#3e3e3e',
    },
});
