import { useTheme } from '@/app/context/ThemeContext';
import { DownloadService, FontType } from '@/services/DownloadService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type Quality = 'low' | 'mid' | 'high';
type Step = 'font' | 'quality';

const QUALITY_SIZES: Record<string, Record<string, number>> = {
    diyanet: {
        low: 150 * 1024 * 1024,
        mid: 300 * 1024 * 1024,
        high: 1024 * 1024 * 1024,
    },
    husrev: {
        high: 300 * 1024 * 1024,
    },
};

const PREVIEW_IMAGES: Record<FontType, any> = {
    diyanet: require('@/assets/images/diyanet_prev.jpg'),
    husrev: require('@/assets/images/husrev_prev.jpg'),
};

interface DownloadModalProps {
    visible: boolean;
    onSuccess: () => void;
    onCancel?: () => void;
}

export default function DownloadModal({ visible, onSuccess, onCancel }: DownloadModalProps) {
    const { theme, isDarkMode } = useTheme();
    const { t } = useTranslation();

    const [step, setStep] = useState<Step>('font');
    const [selectedFont, setSelectedFont] = useState<FontType>('diyanet');
    const [selectedQuality, setSelectedQuality] = useState<Quality>('mid');
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [freeSpace, setFreeSpace] = useState<number | null>(null);

    useEffect(() => {
        if (visible) {
            checkSpace();
            setStep('font');
            setSelectedFont('diyanet');
            setSelectedQuality('mid');
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

    const handleFontSelect = (font: FontType) => {
        setSelectedFont(font);
    };

    const handleFontContinue = () => {
        if (selectedFont === 'husrev') {
            // Husrev only has one quality, start download directly
            handleDownload('high', 'husrev');
        } else {
            setStep('quality');
        }
    };

    const handleDownload = async (quality: Quality = selectedQuality, font: FontType = selectedFont) => {
        const size = QUALITY_SIZES[font]?.[quality];
        if (size && freeSpace !== null && freeSpace < size) {
            Alert.alert(t('notEnoughSpace'), t('notEnoughSpaceDesc'));
            return;
        }

        setDownloading(true);
        setProgress(0);

        try {
            await DownloadService.downloadAndUnzip(quality, (p, msg) => {
                setProgress(p);
                setStatusMessage(msg);
            }, font);
            onSuccess();
        } catch (error) {
            console.error(error);
            Alert.alert(t('downloadError'), t('downloadErrorDesc'));
            setDownloading(false);
        }
    };

    const renderFontCard = (font: FontType) => {
        const isSelected = selectedFont === font;
        const sizeLabel = font === 'husrev' ? '300 MB' : '150 MB - 1 GB';

        return (
            <TouchableOpacity
                key={font}
                disabled={downloading}
                onPress={() => handleFontSelect(font)}
                style={[
                    styles.fontCard,
                    {
                        backgroundColor: theme.card,
                        borderColor: isSelected ? theme.primary : theme.border,
                        borderWidth: isSelected ? 2 : 1,
                    }
                ]}
            >
                <Image
                    source={PREVIEW_IMAGES[font]}
                    style={styles.previewImage}
                    resizeMode="cover"
                />
                <View style={styles.fontCardInfo}>
                    <View style={styles.fontCardHeader}>
                        <Text style={[styles.fontCardTitle, { color: theme.text }]}>
                            {t(font)}
                        </Text>
                        {isSelected && <Ionicons name="checkmark-circle" size={22} color={theme.primary} />}
                    </View>
                    <Text style={[styles.fontCardSize, { color: theme.secondaryText }]}>
                        {sizeLabel}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderQualityCard = (q: Quality) => {
        const size = QUALITY_SIZES[selectedFont]?.[q];
        if (!size) return null;
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
                        {DownloadService.getDownloadSize(q, selectedFont)}
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
                {downloading ? (
                    <View style={styles.progressContainer}>
                        <Text style={[styles.title, { color: theme.text, marginBottom: 24 }]}>
                            {t(selectedFont)} — {selectedFont === 'husrev' ? t('high') : t(selectedQuality)}
                        </Text>
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
                ) : step === 'font' ? (
                    <>
                        <Text style={[styles.title, { color: theme.text }]}>{t('chooseFontStyle')}</Text>
                        <Text style={[styles.desc, { color: theme.secondaryText }]}>{t('chooseFontStyleDesc')}</Text>

                        <View style={styles.fontCardsContainer}>
                            {renderFontCard('diyanet')}
                            {renderFontCard('husrev')}
                        </View>

                        <View style={{ gap: 12 }}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: theme.primary }]}
                                onPress={handleFontContinue}
                            >
                                <Text style={styles.buttonText}>
                                    {selectedFont === 'husrev' ? t('startDownload') : t('chooseQuality')}
                                </Text>
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
                    </>
                ) : (
                    <>
                        <TouchableOpacity onPress={() => setStep('font')} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={theme.primary} />
                        </TouchableOpacity>

                        <Text style={[styles.title, { color: theme.text }]}>{t('initialDownloadTitle')}</Text>
                        <Text style={[styles.desc, { color: theme.secondaryText }]}>{t('initialDownloadDesc')}</Text>

                        <View style={styles.cardsContainer}>
                            {renderQualityCard('low')}
                            {renderQualityCard('mid')}
                            {renderQualityCard('high')}
                        </View>

                        <View style={{ gap: 12 }}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: theme.primary }]}
                                onPress={() => handleDownload()}
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
                    </>
                )}
            </View>
        </Animated.View>
    );
}

const previewHeight = Math.min(width * 0.35, 160);

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
    backButton: {
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    // Font selection cards
    fontCardsContainer: {
        gap: 16,
        marginBottom: 32,
    },
    fontCard: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: previewHeight,
    },
    fontCardInfo: {
        padding: 14,
    },
    fontCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fontCardTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    fontCardSize: {
        fontSize: 13,
        marginTop: 2,
    },
    // Quality cards
    cardsContainer: {
        gap: 12,
        marginBottom: 32,
    },
    card: {
        padding: 16,
        borderRadius: 16,
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
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 6,
    },
});
