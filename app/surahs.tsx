import { useTheme } from '@/app/context/ThemeContext';
import { SURAHS, Surah } from '@/constants/surahs';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SurahsScreen() {
  const { theme, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = React.useState('');

  const getTranslatedSurahName = (surah: Surah) => {
    if (i18n.language === 'sq') return surah.albanianName || surah.englishName;
    if (i18n.language === 'tr') return surah.turkishName || surah.englishName;
    return surah.englishName;
  };

  const filteredSurahs = React.useMemo(() => {
    return SURAHS.filter(surah => {
      const query = searchQuery.toLowerCase();
      const name = getTranslatedSurahName(surah).toLowerCase();
      const englishName = surah.englishName.toLowerCase();
      const number = surah.number.toString();

      return name.includes(query) || englishName.includes(query) || number.includes(query);
    });
  }, [searchQuery, i18n.language]);

  const renderSurah = ({ item }: { item: Surah }) => (
    <TouchableOpacity
      style={[styles.surahCard, { backgroundColor: theme.card, shadowColor: isDarkMode ? '#000' : '#000' }]}
      onPress={() => router.push(`/reader?page=${item.startPage}`)}
      activeOpacity={0.7}
    >
      <View style={styles.surahNumber}>
        <Text style={styles.surahNumberText}>{item.number}</Text>
      </View>

      <View style={styles.surahInfo}>
        <Text style={[styles.surahArabicName, { color: theme.text }]}>{getTranslatedSurahName(item)}</Text>
        <Text style={[styles.surahEnglishName, { color: theme.secondaryText }]}>{item.name}</Text>
        <View style={styles.surahMeta}>
          <Text style={[styles.surahMetaText, { color: theme.secondaryText }]}>
            {item.verses} {t('verses')}
          </Text>
        </View>
      </View>

      <View style={styles.pageInfo}>
        <Text style={[styles.pageLabel, { color: theme.secondaryText }]}>{t('pageLabel')}</Text>
        <Text style={styles.pageNumber}>{item.startPage}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{t('surahsTitle')}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="search" size={20} color={theme.secondaryText} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={theme.secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.secondaryText} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          data={filteredSurahs}
          renderItem={renderSurah}
          keyExtractor={(item) => item.number.toString()}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 16 }]}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 36,
  },
  listContent: {
    padding: 16,
  },
  surahCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  surahNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  surahNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  surahInfo: {
    flex: 1,
  },
  surahArabicName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  surahEnglishName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  surahMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  surahMetaText: {
    fontSize: 12,
    color: '#999',
  },
  pageInfo: {
    alignItems: 'center',
    marginLeft: 12,
  },
  pageNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  pageLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  searchContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
});
