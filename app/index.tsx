import { useTheme } from '@/app/context/ThemeContext';
import DownloadModal from '@/components/DownloadModal';
import { getSurahsOnPage, SURAHS } from '@/constants/surahs';
import { Bookmark, BookmarkService, LastRead } from '@/services/BookmarkService';
import { DownloadService } from '@/services/DownloadService';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Bookmark interface moved to BookmarkService

export default function HomeScreen() {
  const { theme, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [startJuz, setStartJuz] = useState('');
  const [endJuz, setEndJuz] = useState('');
  const [bookmarkMode, setBookmarkMode] = useState<'default' | 'target'>('default');
  const [targetType, setTargetType] = useState<'page' | 'juz'>('page');
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    // Initial load and subscription
    const updateData = async () => {
      const [b, lr] = await Promise.all([
        BookmarkService.getBookmarks(),
        BookmarkService.getLastRead(),
      ]);
      setBookmarks(b);
      setLastRead(lr);
    };

    updateData();
    const unsubscribe = BookmarkService.subscribe(updateData);

    // Migration logic: Force reset of pages for this version
    const checkMigration = async () => {
      const MIGRATION_KEY = 'v2_force_redownload_all_pages';
      const hasMigrated = await AsyncStorage.getItem(MIGRATION_KEY);

      if (!hasMigrated) {
        console.log('Forcing page reset for first launch...');
        try {
          // 1. Clear everything
          await DownloadService.clearPagesDirectory();

          // 2. Mark as migrated so this only happens once
          await AsyncStorage.setItem(MIGRATION_KEY, 'true');

          // 3. Show the download modal immediately
          setShowDownloadModal(true);
        } catch (error) {
          console.error('Migration failed:', error);
        }
      } else {
        // Also check if they ever finished the download. If not, show modal.
        const isDownloaded = await DownloadService.isDownloaded();
        if (!isDownloaded) {
          setShowDownloadModal(true);
        }
      }
    };
    checkMigration();

    return () => { unsubscribe(); };
  }, []);

  useFocusEffect(
    useCallback(() => {
      // We do NOT want to refresh from disk here because it might be stale.
      // The service state is already up to date from the Reader screen.
      // If anything, we can force a re-render with current service data.
      const syncData = async () => {
        const [b, lr] = await Promise.all([
          BookmarkService.getBookmarks(),
          BookmarkService.getLastRead(),
        ]);
        setBookmarks(b);
        setLastRead(lr);
      };
      syncData();
    }, [])
  );

  const generateRandomColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  };

  const getFormattedDate = (timestamp?: number, fallbackDate?: string) => {
    if (!timestamp) return fallbackDate || '';
    const date = new Date(timestamp);
    const months = ['january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'];
    return `${date.getDate()} ${t(months[date.getMonth()])}`;
  };

  const formatDate = () => {
    // Legacy function, kept for compatibility if needed, but we prefer using timestamp
    const now = new Date();
    const months = ['january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'];
    return `${now.getDate()} ${t(months[now.getMonth()])}`;
  };

  const formatTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getTranslatedSurahName = (englishName: string) => {
    const surah = SURAHS.find(s => s.englishName === englishName);
    if (!surah) return englishName;

    if (i18n.language === 'sq') return surah.albanianName || englishName;
    if (i18n.language === 'tr') return surah.turkishName || englishName;
    return surah.englishName;
  };

  const handleEditBookmark = (bookmark: Bookmark) => {
    // Close the swipeable row
    swipeableRefs.current[bookmark.id]?.close();

    setEditingBookmarkId(bookmark.id);
    setName(bookmark.name);
    setBookmarkMode(bookmark.startPage || bookmark.startJuz ? 'target' : 'default');

    if (bookmark.startPage || bookmark.startJuz) {
      if (bookmark.startPage) {
        setTargetType('page');
        setStartPage(bookmark.startPage.toString());
        setEndPage(bookmark.endPage?.toString() || '');
      } else if (bookmark.startJuz) {
        setTargetType('juz');
        setStartJuz(bookmark.startJuz.toString());
        setEndJuz(bookmark.endJuz?.toString() || '');
      }
    } else {
      setPageNumber(bookmark.page.toString());
    }

    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('error'), t('enterNameError'));
      return;
    }

    const isTargetMode = bookmarkMode === 'target';

    if (!isTargetMode) {
      if (!pageNumber.trim() || isNaN(Number(pageNumber))) {
        Alert.alert(t('error'), t('enterPageError'));
        return;
      }
    } else {
      const start = targetType === 'page' ? startPage : startJuz;
      const end = targetType === 'page' ? endPage : endJuz;
      if (!start.trim() || isNaN(Number(start)) || !end.trim() || isNaN(Number(end))) {
        Alert.alert(t('error'), t('enterPageError'));
        return;
      }
    }

    try {
      // Determine effective page number
      let effectivePage = Number(pageNumber);
      if (isTargetMode) {
        if (targetType === 'page') {
          effectivePage = Number(startPage);
        } else {
          // Adjust Juz starting page: Juz 1 starts at page 2, Juz 2 at 22, etc.
          effectivePage = (Number(startJuz) - 1) * 20 + 2;
        }
      }

      // Get the Surah name for this page
      const surahs = getSurahsOnPage(effectivePage);
      const surahName = surahs.length > 0 ? surahs[0].englishName : 'Unknown';

      if (editingBookmarkId) {
        const existingBookmark = bookmarks.find(b => b.id === editingBookmarkId);
        if (existingBookmark) {
          const updatedBookmark: Bookmark = {
            ...existingBookmark,
            name: name.trim(),
            sura: surahName,
            page: effectivePage,
            startPage: isTargetMode && targetType === 'page' ? Number(startPage) : undefined,
            endPage: isTargetMode && targetType === 'page' ? Number(endPage) : undefined,
            startJuz: isTargetMode && targetType === 'juz' ? Number(startJuz) : undefined,
            endJuz: isTargetMode && targetType === 'juz' ? Number(endJuz) : undefined,
          };
          await BookmarkService.updateBookmark(updatedBookmark);
        }
      } else {
        const newBookmark: Bookmark = {
          id: Date.now().toString(),
          name: name.trim(),
          sura: surahName,
          page: effectivePage,
          date: formatDate(),
          time: formatTime(),
          timestamp: Date.now(),
          color: generateRandomColor(),
          startPage: isTargetMode && targetType === 'page' ? Number(startPage) : undefined,
          endPage: isTargetMode && targetType === 'page' ? Number(endPage) : undefined,
          startJuz: isTargetMode && targetType === 'juz' ? Number(startJuz) : undefined,
          endJuz: isTargetMode && targetType === 'juz' ? Number(endJuz) : undefined,
        };
        await BookmarkService.addBookmark(newBookmark);
      }

      // Reset form and close modal
      setName('');
      setPageNumber('');
      setStartPage('');
      setEndPage('');
      setStartJuz('');
      setEndJuz('');
      setEditingBookmarkId(null);
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving bookmark:', error);
      Alert.alert(t('error'), t('saveError'));
    }
  };

  const handleCancel = () => {
    setName('');
    setPageNumber('');
    setStartPage('');
    setEndPage('');
    setStartJuz('');
    setEndJuz('');
    setBookmarkMode('default');
    setTargetType('page');
    setEditingBookmarkId(null);
    setModalVisible(false);
  };

  const handleDeleteBookmark = (bookmarkId: string, bookmarkName: string) => {
    Alert.alert(
      t('deleteTitle'),
      t('deleteConfirm', { name: bookmarkName }),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await BookmarkService.deleteBookmark(bookmarkId);
            } catch (error) {
              console.error('Error deleting bookmark:', error);
              Alert.alert(t('error'), t('deleteError'));
            }
          },
        },
      ]
    );
  };

  const renderRightActions = (bookmark: Bookmark) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.primary }]}
          onPress={() => handleEditBookmark(bookmark)}
        >
          <Ionicons name="pencil" size={24} color="white" />
          <Text style={styles.deleteButtonText}>{t('edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteBookmark(bookmark.id, bookmark.name)}
        >
          <Ionicons name="trash" size={24} color="white" />
          <Text style={styles.deleteButtonText}>{t('delete')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <SafeAreaView
        style={styles.safeArea}
        edges={Platform.OS === 'android' ? ['top', 'bottom', 'left', 'right'] : ['top', 'bottom']}
      >
        <View style={[
          styles.header,
          {
            backgroundColor: theme.card,
            paddingLeft: Math.max(20, insets.left),
            paddingRight: Math.max(20, insets.right)
          }
        ]}>
          <TouchableOpacity onPress={() => setMenuModalVisible(true)}>
            <Ionicons name="menu" size={32} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings" size={28} color={theme.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.content}
          contentContainerStyle={{
            paddingBottom: 100 + insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right
          }}
        >
          {/* Last Time Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {!lastRead?.date ? t('readyToRead') : t('lastTime')}
            </Text>
            {!lastRead?.date ? (
              <TouchableOpacity
                style={[styles.startReadingCard, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/reader?page=2')}
                activeOpacity={0.9}
              >
                <View style={styles.startReadingContent}>
                  <View style={styles.startReadingTextContainer}>
                    <Text style={styles.startReadingTitle}>{t('startReading')}</Text>
                    <Text style={styles.startReadingDesc}>{t('startReadingDesc')}</Text>
                  </View>
                  <View style={styles.startReadingIconContainer}>
                    <Ionicons name="book" size={40} color="rgba(255,255,255,0.9)" />
                  </View>
                </View>
                <View style={styles.startReadingBackgroundIcon}>
                  <Ionicons name="apps" size={120} color="rgba(255,255,255,0.1)" />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.lastTimeCard, { backgroundColor: theme.card }]}
                onPress={() => router.push(`/reader?page=${lastRead?.page || 0}`)}
                activeOpacity={0.7}
              >
                <View style={styles.row}>
                  <View style={styles.infoColumn}>
                    <Text style={[styles.label, { color: theme.secondaryText }]}>{t('sura')}: {getTranslatedSurahName(lastRead?.sura || 'Al-Fatihah')}</Text>
                    <View style={styles.dateTime}>
                      <Ionicons name="calendar" size={16} color="#999" />
                      <Text style={styles.dateText}>{getFormattedDate(lastRead?.timestamp, lastRead?.date)}</Text>
                    </View>
                  </View>
                  <View style={styles.infoColumn}>
                    <Text style={[styles.label, { color: theme.secondaryText }]}>{t('pageLabel')}: {lastRead?.page || 2}</Text>
                    <View style={styles.dateTime}>
                      <Ionicons name="time" size={16} color="#999" />
                      <Text style={styles.dateText}>{lastRead?.time}</Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.lastReadInfo, { color: theme.secondaryText }]}>
                  {t('lastTimeRead')}: {lastRead?.durationMinutes ? `${lastRead.durationMinutes} ${t('minutes')}` : lastRead?.duration}, {lastRead?.pages || 0} {t('pages')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bookmarks Section */}
          <View style={styles.section}>
            {bookmarks.length > 0 && <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('bookmarks')}</Text>}
            {bookmarks.map((bookmark, index) => (
              <Swipeable
                key={bookmark.id}
                ref={(ref) => { swipeableRefs.current[bookmark.id] = ref; }}
                renderRightActions={() => renderRightActions(bookmark)}
                overshootRight={false}
              >
                <TouchableOpacity
                  style={[styles.bookmarkCard, { backgroundColor: theme.card }]}
                  onPress={() => {
                    router.push(`/reader?page=${bookmark.page}&bookmarkId=${bookmark.id}`);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.bookmarkRibbon, { backgroundColor: bookmark.color || '#4CAF50' }]}>
                    <View style={[styles.ribbonTriangle, { borderBottomColor: theme.card }]} />
                  </View>
                  <View style={styles.bookmarkContent}>
                    <Text style={[styles.bookmarkName, { color: theme.text }]}>{bookmark.name}</Text>
                    <View style={styles.row}>
                      <View style={styles.infoColumn}>
                        <Text style={[styles.bookmarkLabel, { color: theme.secondaryText }]}>{t('sura')}: {getTranslatedSurahName(bookmark.sura)}</Text>
                        <View style={styles.dateTime}>
                          <Ionicons name="calendar" size={16} color="#999" />
                          <Text style={styles.dateText}>{getFormattedDate(bookmark.timestamp, bookmark.date)}</Text>
                        </View>
                      </View>
                      <View style={styles.infoColumn}>
                        <Text style={[styles.bookmarkLabel, { color: theme.secondaryText }]}>{t('pageLabel')}: {bookmark.page}</Text>
                        <View style={styles.dateTime}>
                          <Ionicons name="time" size={16} color="#999" />
                          <Text style={styles.dateText}>{bookmark.time}</Text>
                        </View>
                      </View>
                    </View>
                    {(bookmark.startPage || bookmark.startJuz) && (
                      <View style={[styles.row, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.border }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="flag" size={16} color={theme.primary} style={{ marginRight: 6 }} />
                          <Text style={{ fontSize: 13, color: theme.primary, fontWeight: '700' }}>
                            {t('target')}: {bookmark.startPage ? `${bookmark.startPage}-${bookmark.endPage}` : `${t('juz')} ${bookmark.startJuz}-${bookmark.endJuz}`}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Swipeable>
            ))}
          </View>
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity
          style={[
            styles.fab,
            {
              bottom: 30 + insets.bottom,
              right: 20 + insets.right
            }
          ]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuModalVisible}
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuModalVisible(false)}
        >
          <View style={[styles.menuContent, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: theme.border }]}
              onPress={() => {
                setMenuModalVisible(false);
                router.push('/surahs');
              }}
            >
              <Ionicons name="list" size={24} color={theme.primary} style={{ marginRight: 15 }} />
              <Text style={[styles.menuText, { color: theme.text }]}>{t('listSurahs')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuModalVisible(false);
                router.push('/juz');
              }}
            >
              <Ionicons name="grid" size={24} color={theme.primary} style={{ marginRight: 15 }} />
              <Text style={[styles.menuText, { color: theme.text }]}>{t('listJuz')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Bookmark Modal Popup */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              {!editingBookmarkId && (
                <View style={[styles.segmentContainer, { marginBottom: 16, backgroundColor: theme.background }]}>
                  <TouchableOpacity
                    style={[styles.segment, bookmarkMode === 'default' && { backgroundColor: theme.primary }]}
                    onPress={() => setBookmarkMode('default')}
                  >
                    <Text style={[styles.segmentText, bookmarkMode === 'default' && { color: '#FFF' }, bookmarkMode !== 'default' && { color: theme.secondaryText }]}>{t('default')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.segment, bookmarkMode === 'target' && { backgroundColor: theme.primary }]}
                    onPress={() => setBookmarkMode('target')}
                  >
                    <Text style={[styles.segmentText, bookmarkMode === 'target' && { color: '#FFF' }, bookmarkMode !== 'target' && { color: theme.secondaryText }]}>{t('target')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>{t('name')}</Text>
                <TextInput
                  style={[styles.input, { height: 48, backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder={t('enterNamePlaceholder')}
                  placeholderTextColor={theme.secondaryText}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              {bookmarkMode === 'default' ? (
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>{t('pageNumber')}</Text>
                  <TextInput
                    style={[styles.input, { height: 48, backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    placeholder={t('enterPagePlaceholder')}
                    placeholderTextColor={theme.secondaryText}
                    value={pageNumber}
                    onChangeText={setPageNumber}
                    keyboardType="number-pad"
                    returnKeyType="done"
                  />
                </View>
              ) : (
                <>
                  <View style={styles.row}>
                    <View style={[styles.inputContainer, { flex: 1, marginRight: 12, marginBottom: 12 }]}>
                      <Text style={[styles.inputLabel, { color: theme.text, fontSize: 13 }]}>{t('type')}</Text>
                      <View style={[styles.segmentContainer, { marginBottom: 0, padding: 2, height: 40, backgroundColor: theme.background }]}>
                        <TouchableOpacity
                          style={[styles.segment, targetType === 'page' && { backgroundColor: theme.primary }]}
                          onPress={() => setTargetType('page')}
                        >
                          <Text style={[styles.segmentText, { fontSize: 12 }, targetType === 'page' && { color: '#FFF' }, targetType !== 'page' && { color: theme.secondaryText }]}>{t('page')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.segment, targetType === 'juz' && { backgroundColor: theme.primary }]}
                          onPress={() => setTargetType('juz')}
                        >
                          <Text style={[styles.segmentText, { fontSize: 12 }, targetType === 'juz' && { color: '#FFF' }, targetType !== 'juz' && { color: theme.secondaryText }]}>{t('juz')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={[styles.inputContainer, { flex: 1.5, marginBottom: 12 }]}>
                      <Text style={[styles.inputLabel, { color: theme.text, fontSize: 13 }]}>{t('target')}</Text>
                      <View style={[styles.row, { gap: 8 }]}>
                        <TextInput
                          style={[styles.input, { flex: 1, height: 40, padding: 8, fontSize: 14, backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                          placeholder={t('start')}
                          placeholderTextColor={theme.secondaryText}
                          value={targetType === 'page' ? startPage : startJuz}
                          onChangeText={targetType === 'page' ? setStartPage : setStartJuz}
                          keyboardType="number-pad"
                        />
                        <TextInput
                          style={[styles.input, { flex: 1, height: 40, padding: 8, fontSize: 14, backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                          placeholder={t('end')}
                          placeholderTextColor={theme.secondaryText}
                          value={targetType === 'page' ? endPage : endJuz}
                          onChangeText={targetType === 'page' ? setEndPage : setEndJuz}
                          keyboardType="number-pad"
                        />
                      </View>
                    </View>
                  </View>
                </>
              )}

              <View style={[styles.buttonContainer, { marginTop: 8 }]}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { height: 48, backgroundColor: theme.background, borderColor: theme.border }]}
                  onPress={handleCancel}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.secondaryText }]}>{t('cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.saveButton, { height: 48, backgroundColor: theme.primary }]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>{t('save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <DownloadModal
        visible={showDownloadModal}
        onSuccess={() => setShowDownloadModal(false)}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  lastTimeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  startReadingCard: {
    padding: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  startReadingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  startReadingTextContainer: {
    flex: 1,
  },
  startReadingTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  startReadingDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
  },
  startReadingIconContainer: {
    marginLeft: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
  },
  startReadingBackgroundIcon: {
    position: 'absolute',
    right: -20,
    bottom: -30,
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoColumn: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  dateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#999',
  },
  lastReadInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  bookmarkCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  bookmarkRibbon: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  ribbonTriangle: {
    position: 'absolute',
    bottom: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F5F5F5',
  },
  bookmarkContent: {
    flex: 1,
    padding: 20,
  },
  bookmarkName: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000',
    marginBottom: 12,
  },
  bookmarkLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    borderWidth: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#00BCD4',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    borderRadius: 16,
    marginBottom: 16,
    marginLeft: 8,
  },
  editButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginBottom: 16,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  menuContent: {
    width: '80%',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  menuText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
