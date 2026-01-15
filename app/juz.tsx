import { useTheme } from '@/app/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function JuzScreen() {
    const { theme, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const juzList = Array.from({ length: 30 }, (_, i) => ({
        number: i + 1,
        startPage: i * 20 + 2,
    }));

    const renderJuz = ({ item }: { item: { number: number; startPage: number } }) => (
        <TouchableOpacity
            style={[styles.juzCard, { backgroundColor: theme.card, shadowColor: isDarkMode ? '#000' : '#000' }]}
            onPress={() => router.push(`/reader?page=${item.startPage}`)}
            activeOpacity={0.7}
        >
            <View style={[styles.juzNumber, { backgroundColor: theme.primary }]}>
                <Text style={styles.juzNumberText}>{item.number}</Text>
            </View>

            <View style={styles.juzInfo}>
                <Text style={[styles.juzTitle, { color: theme.text }]}>{t('juz')} {item.number}</Text>
                <Text style={[styles.juzMeta, { color: theme.secondaryText }]}>
                    {t('startsAtPage')} {item.startPage}
                </Text>
            </View>

            <View style={styles.chevron}>
                <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
            <SafeAreaView
                style={styles.safeArea}
                edges={Platform.OS === 'android' ? ['top', 'bottom', 'left', 'right'] : ['top', 'bottom']}
            >
                <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color={theme.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{t('listJuz')}</Text>
                    <View style={styles.placeholder} />
                </View>

                <FlatList
                    data={juzList}
                    renderItem={renderJuz}
                    keyExtractor={(item) => item.number.toString()}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 16 }]}
                    showsVerticalScrollIndicator={false}
                    numColumns={1}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    placeholder: {
        width: 36,
    },
    listContent: {
        padding: 16,
    },
    juzCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    juzNumber: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    juzNumberText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    juzInfo: {
        flex: 1,
    },
    juzTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    juzMeta: {
        fontSize: 14,
    },
    chevron: {
        marginLeft: 8,
    },
});
