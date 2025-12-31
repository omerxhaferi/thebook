import { useTheme } from '@/app/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const SETTINGS_KEY = 'rowHighlighterEnabled';

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [rowHighlighterEnabled, setRowHighlighterEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored !== null) {
        setRowHighlighterEnabled(JSON.parse(stored));
      } else {
        // Default to false
        setRowHighlighterEnabled(false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(value));
      setRowHighlighterEnabled(value);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleToggle = (value: boolean) => {
    saveSettings(value);
  };

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem('user-language', lang);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('settings')}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >

        {/* Language Settings */}
        <View style={[styles.settingItem, { backgroundColor: theme.card, flexDirection: 'column', alignItems: 'flex-start', shadowColor: isDarkMode ? '#000' : '#000' }]}>
          <Text style={[styles.settingLabel, { color: theme.text, marginBottom: 12 }]}>{t('language')}</Text>

          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
            {['en', 'sq', 'tr'].map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => changeLanguage(lang)}
                style={{
                  padding: 10,
                  backgroundColor: i18n.language === lang ? theme.primary : theme.background,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.border,
                  flex: 1,
                  marginHorizontal: 4,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: i18n.language === lang ? '#FFF' : theme.text, fontWeight: '600' }}>
                  {lang === 'en' ? 'English' : lang === 'sq' ? 'Shqip' : 'Türkçe'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Row Highlighter Setting */}
        <View style={[styles.settingItem, { backgroundColor: theme.card, shadowColor: isDarkMode ? '#000' : '#000' }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{t('rowHighlighter')}</Text>
            <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>
              {t('rowHighlighterDesc')}
            </Text>
          </View>
          <Switch
            value={rowHighlighterEnabled}
            onValueChange={handleToggle}
            trackColor={{ false: '#E0E0E0', true: theme.primary }}
            thumbColor="#FFF"
            ios_backgroundColor="#E0E0E0"
          />
        </View>

        {/* Dark Mode Setting */}
        <View style={[styles.settingItem, { backgroundColor: theme.card, shadowColor: isDarkMode ? '#000' : '#000' }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{t('darkMode')}</Text>
            <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>
              {t('darkModeDesc')}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#E0E0E0', true: theme.primary }}
            thumbColor="#FFF"
            ios_backgroundColor="#E0E0E0"
          />
        </View>


      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerPlaceholder: {
    width: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
});
