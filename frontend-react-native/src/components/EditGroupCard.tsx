import { Card, Input } from '@rneui/themed';
import {
    StyleSheet,
    View,
    Text,
    useWindowDimensions,
    ScrollView,
    Alert,
} from 'react-native';
import { Button, ButtonProps } from '@rneui/themed';
import { Group } from '@/lib/schema';
import { useState } from 'react';

interface FloatingCardProps {
    onClose: () => any;
    onSave: (group: Group) => any;
    onDelete: (group: Group) => any;
    group: Group;
}

const ControlButton = (props: ButtonProps) => {
    return (
        <Button
            {...props}
            buttonStyle={styles.controlButton}
            containerStyle={styles.controlButtonContainer}
        />
    );
};

export const EditGroupCard = ({
    onClose,
    onSave,
    onDelete,
    group,
}: FloatingCardProps) => {
    const { width, height } = useWindowDimensions();
    const [newGroup, setNewGroup] = useState(group);

    return (
        <View style={{ ...styles.background, width, height: height - 50 }}>
            <Card
                containerStyle={styles.cardContainer}
                wrapperStyle={styles.cardWrapper}
            >
                <ScrollView style={{ flex: 1, backgroundColor: 'red' }}>
                    <Card.Title style={styles.title}>
                        EDIT {group.name}
                    </Card.Title>
                    <Card.Divider />

                    <View style={styles.form}>
                        <Text style={styles.label}></Text>
                        <Input
                            value={newGroup.name}
                            onChangeText={(text) =>
                                setNewGroup({ ...newGroup, name: text })
                            }
                        />
                    </View>
                </ScrollView>

                <View style={styles.controlContainer}>
                    <ControlButton onPress={onClose}>
                        <Text style={styles.buttonText}>Close</Text>
                    </ControlButton>
                    <ControlButton onPress={() => onSave(newGroup)}>
                        <Text style={styles.buttonText}>Save</Text>
                    </ControlButton>
                    <ControlButton
                        onPress={() => {
                            Alert.prompt(
                                `Delete '${group.name}'`,
                                `Are you sure you want to delete '${group.name}'?`,
                                [
                                    {
                                        text: 'Ok',
                                        onPress: () => onDelete(group),
                                    },
                                    {
                                        text: 'Cancel',
                                        isPreferred: true,
                                    },
                                ],
                                'default'
                            );
                        }}
                    >
                        <Text style={styles.buttonText}>Delete</Text>
                    </ControlButton>
                </View>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1000,
        padding: 32,
    },
    cardContainer: {
        flex: 1,
        width: '100%',
        borderRadius: 4,
        padding: 16,
    },
    cardWrapper: {
        flex: 1,
        gap: 16,
    },
    title: {
        fontSize: 20,
        textTransform: 'uppercase',
    },
    form: {},
    label: {},
    controlContainer: {
        flex: 1,
        flexDirection: 'row',
        maxHeight: 50,
        gap: 16,
        justifyContent: 'space-between',
    },
    controlButtonContainer: {
        flex: 1,
    },
    controlButton: {
        width: '100%',
    },
    buttonText: {
        fontSize: 20,
        color: '#fff',
    },
});
