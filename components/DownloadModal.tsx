import { useTheme } from '@/app/context/ThemeContext';
import { DownloadService } from '@/services/DownloadService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

type Quality = 'low' | 'mid' | 'high';

const QUALITY_SIZES = {
    low: 150 * 1024 * 1024,   // 150MB
    mid: 300 * 1024 * 1024,  // 300MB
    high: 1024 * 1024 * 1024 // 1GB
};

interface DownloadModalProps {
    visible: boolean;
    onSuccess: () => void;
    onCancel?: () => void;
}

export default function DownloadModal({ visible, onSuccess, onCancel }: DownloadModalProps) {
    const { theme, isDarkMode } = useTheme();
    const { t } = useTranslation();

    const [selectedQuality, setSelectedQuality] = useState<Quality>('mid');
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [freeSpace, setFreeSpace] = useState<number | null>(null);

    useEffect(() => {
        if (visible) {
            checkSpace();
        }
    }, [visible]);

    const checkSpace = async () => {
        try {
            const space = await DownloadService.getFreeDiskSpace();
            setFreeSpace(space);
        } catch (e) {
            console.error('Failed to check space', e);
        }
    };

    const handleDownload = async () => {
        // Double check space
        if (freeSpace !== null && freeSpace < QUALITY_SIZES[selectedQuality]) {
            Alert.alert(t('notEnoughSpace'), t('notEnoughSpaceDesc'));
            return;
        }

        setDownloading(true);
        setProgress(0);

        try {
            await DownloadService.downloadAndUnzip(selectedQuality, (p, msg) => {
                setProgress(p);
                setStatusMessage(msg);
            });
            // Success - no alert, just continue
            onSuccess();
        } catch (error) {
            console.error(error);
            Alert.alert(t('downloadError'), t('downloadErrorDesc'));
            setDownloading(false);
        }
    };

    const renderQualityCard = (q: Quality) => {
        const size = QUALITY_SIZES[q];
        const hasSpace = freeSpace === null || freeSpace >= size;
        const isSelected = selectedQuality === q;

        return (
            <TouchableOpacity
                key={q}
                disabled={!hasSpace || downloading}
                onPress={() => setSelectedQuality(q)}
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.card,
                        borderColor: isSelected ? theme.primary : theme.border,
                        borderWidth: isSelected ? 2 : 1,
                        opacity: hasSpace ? 1 : 0.5
                    }
                ]}
            >
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                        {t(q)}
                    </Text>
                    <Text style={[styles.cardSize, { color: isSelected ? theme.primary : theme.secondaryText }]}>
                        {DownloadService.getDownloadSize(q)}
                    </Text>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color={theme.primary} />}
                </View>

                {!hasSpace && (
                    <Text style={[styles.cardSize, { color: theme.secondaryText, fontSize: 12, marginTop: 4 }]}>
                        {t('notEnoughSpace')}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    if (!visible) return null;

    return (
        <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={[styles.container, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.98)' }]}
        >
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]}>{t('initialDownloadTitle')}</Text>
                <Text style={[styles.desc, { color: theme.secondaryText }]}>{t('initialDownloadDesc')}</Text>

                <View style={styles.cardsContainer}>
                    {renderQualityCard('low')}
                    {renderQualityCard('mid')}
                    {renderQualityCard('high')}
                </View>

                {downloading ? (
                    <View style={styles.progressContainer}>
                        <Text style={[styles.progressText, { color: theme.text }]}>
                            {t(statusMessage || 'downloading')} ({Math.round(progress * 100)}%)
                        </Text>
                        <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
                            <Animated.View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        backgroundColor: theme.primary,
                                        width: `${Math.min(100, progress * 100)}%`
                                    }
                                ]}
                            />
                        </View>
                    </View>
                ) : (
                    <View style={{ gap: 12 }}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.primary }]}
                            onPress={handleDownload}
                        >
                            <Text style={styles.buttonText}>{t('startDownload')}</Text>
                        </TouchableOpacity>

                        {onCancel && (
                            <TouchableOpacity
                                style={[styles.cancelButton, { borderColor: theme.border, borderWidth: 1 }]}
                                onPress={onCancel}
                            >
                                <Text style={[styles.cancelButtonText, { color: theme.secondaryText }]}>{t('notNow')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '100%',
        maxWidth: 400,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    desc: {
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 22,
    },
    freeSpace: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center', // Center align free space text
        marginBottom: 24,
        marginTop: -16,      // Pull it up a bit closer to desc
    },
    cardsContainer: {
        gap: 12,
        marginBottom: 32,
    },
    card: {
        padding: 16,
        borderRadius: 16, // Softer corners
        marginBottom: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    cardSize: {
        fontSize: 14,
    },
    button: {
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    progressContainer: {
        marginTop: 20,
        width: '100%',
    },
    progressText: {
        marginBottom: 8,
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '600',
    },
    progressBarBg: {
        height: 12, // Thicker bar
        borderRadius: 6,
        overflow: 'hidden',
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 6,
    }
});
