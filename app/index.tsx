import { useTheme } from '@/app/context/ThemeContext';
import { getSurahsOnPage, SURAHS } from '@/constants/surahs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

interface Bookmark {
  id: string;
  name: string;
  sura: string;
  page: number;
  date: string;
  time: string;
  timestamp?: number;
  color: string;
}

export default function HomeScreen() {
  const { theme, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [lastRead, setLastRead] = useState<{
    sura: string;
    page: number;
    date: string;
    time: string;
    timestamp?: number;
    duration: string;
    durationMinutes?: number;
    pages: number;
  } | null>(null);

  useEffect(() => {
    loadBookmarks();
    loadLastRead();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadBookmarks();
      loadLastRead();
    }, [])
  );

  const loadBookmarks = async () => {
    try {
      const stored = await AsyncStorage.getItem('bookmarks');
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const loadLastRead = async () => {
    try {
      const stored = await AsyncStorage.getItem('lastRead');
      if (stored) {
        setLastRead(JSON.parse(stored));
      } else {
        // Set default last read (Al-Fatihah, page 2)
        const surahs = getSurahsOnPage(2);
        const surahName = surahs.length > 0 ? surahs[0].englishName : 'Al-Fatihah';
        setLastRead({
          sura: surahName,
          page: 2,
          date: '12 February',
          time: '19:25',
          duration: '6 minutes',
          pages: 4,
        });
      }
    } catch (error) {
      console.error('Error loading last read:', error);
    }
  };

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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('error'), t('enterNameError'));
      return;
    }

    if (!pageNumber.trim() || isNaN(Number(pageNumber))) {
      Alert.alert(t('error'), t('enterPageError'));
      return;
    }

    try {
      // Get the Surah name for this page
      const surahs = getSurahsOnPage(Number(pageNumber));
      const surahName = surahs.length > 0 ? surahs[0].englishName : 'Unknown';

      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        name: name.trim(),
        sura: surahName,
        page: Number(pageNumber),
        date: formatDate(),
        time: formatTime(),
        timestamp: Date.now(),
        color: generateRandomColor(),
      };

      const updatedBookmarks = [...bookmarks, newBookmark];
      setBookmarks(updatedBookmarks);
      await AsyncStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));

      // Reset form and close modal
      setName('');
      setPageNumber('');
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving bookmark:', error);
      Alert.alert(t('error'), t('saveError'));
    }
  };

  const handleCancel = () => {
    setName('');
    setPageNumber('');
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
              const updatedBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
              setBookmarks(updatedBookmarks);
              await AsyncStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
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
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteBookmark(bookmark.id, bookmark.name)}
      >
        <Ionicons name="trash" size={24} color="white" />
        <Text style={styles.deleteButtonText}>{t('delete')}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: theme.card }]}>
          <TouchableOpacity onPress={() => router.push('/surahs')}>
            <Ionicons name="list" size={28} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings" size={28} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        >
          {/* Last Time Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('lastTime')}</Text>
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
                    <Text style={styles.dateText}>{getFormattedDate(lastRead?.timestamp, lastRead?.date) || '12 February'}</Text>
                  </View>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={[styles.label, { color: theme.secondaryText }]}>{t('pageLabel')}: {lastRead?.page || 2}</Text>
                  <View style={styles.dateTime}>
                    <Ionicons name="time" size={16} color="#999" />
                    <Text style={styles.dateText}>{lastRead?.time || '19:25'}</Text>
                  </View>
                </View>
              </View>
              <Text style={[styles.lastReadInfo, { color: theme.secondaryText }]}>
                {t('lastTimeRead')}: {lastRead?.durationMinutes ? `${lastRead.durationMinutes} ${t('minutes')}` : (lastRead?.duration || '6 minutes')}, {lastRead?.pages || 4} {t('pages')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bookmarks Section */}
          <View style={styles.section}>
            {bookmarks.length > 0 && <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('bookmarks')}</Text>}
            {bookmarks.map((bookmark, index) => (
              <Swipeable
                key={bookmark.id}
                renderRightActions={() => renderRightActions(bookmark)}
                overshootRight={false}
              >
                <TouchableOpacity
                  style={[styles.bookmarkCard, { backgroundColor: theme.card }]}
                  onPress={() => router.push(`/reader?page=${bookmark.page}&bookmarkId=${bookmark.id}`)}
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
                  </View>
                </TouchableOpacity>
              </Swipeable>
            ))}
          </View>
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity
          style={[styles.fab, { bottom: 30 + insets.bottom }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

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
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('addBookmark')}</Text>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>{t('name')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder={t('enterNamePlaceholder')}
                  placeholderTextColor={theme.secondaryText}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>{t('pageNumber')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder={t('enterPagePlaceholder')}
                  placeholderTextColor={theme.secondaryText}
                  value={pageNumber}
                  onChangeText={setPageNumber}
                  keyboardType="number-pad"
                  returnKeyType="done"
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                  onPress={handleCancel}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.secondaryText }]}>{t('cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>{t('save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    fontSize: 23,
    fontWeight: 'bold',
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
    fontSize: 24,
    fontWeight: 'bold',
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
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#00BCD4',
  },
  saveButtonText: {
    fontSize: 16,
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
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
});
