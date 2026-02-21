import { useTheme } from '@/app/context/ThemeContext';
import { getSurahsOnPage, SURAHS } from '@/constants/surahs';
import { MonthData, ReadingSession, StatsService } from '@/services/StatsService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

const DAY_KEYS = ['statsSun', 'statsMon', 'statsTue', 'statsWed', 'statsThu', 'statsFri', 'statsSat'];
const MONTH_KEYS = ['january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'];

export default function StatsScreen() {
  const { theme, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();

  const now = new Date();
  const todayDefault = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1); // 1-12
  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(todayDefault);
  const [daySessions, setDaySessions] = useState<ReadingSession[]>([]);

  // Session modal state
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [editingSession, setEditingSession] = useState<ReadingSession | null>(null);
  const [formDuration, setFormDuration] = useState('');
  const [formStartPage, setFormStartPage] = useState('');
  const [formEndPage, setFormEndPage] = useState('');

  const loadData = useCallback(async () => {
    const month = await StatsService.getMonthData(viewYear, viewMonth);
    setMonthData(month);

    if (selectedDate) {
      const sessions = await StatsService.getSessionsForDate(selectedDate);
      setDaySessions(sessions);
    }
  }, [viewYear, viewMonth, selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      const unsubscribe = StatsService.subscribe(() => { loadData(); });
      return () => { unsubscribe(); };
    }, [loadData])
  );

  const handleMonthChange = async (direction: number) => {
    let newMonth = viewMonth + direction;
    let newYear = viewYear;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }

    const now = new Date();
    if (newYear > now.getFullYear() || (newYear === now.getFullYear() && newMonth > now.getMonth() + 1)) {
      return;
    }

    setViewYear(newYear);
    setViewMonth(newMonth);
    setSelectedDate(null);
    setDaySessions([]);
    const month = await StatsService.getMonthData(newYear, newMonth);
    setMonthData(month);
  };

  const handleDayPress = async (dateStr: string) => {
    if (selectedDate === dateStr) {
      setSelectedDate(null);
      setDaySessions([]);
      return;
    }
    setSelectedDate(dateStr);
    const sessions = await StatsService.getSessionsForDate(dateStr);
    setDaySessions(sessions);
  };

  const getTranslatedSurahName = (englishName: string) => {
    const surah = SURAHS.find(s => s.englishName === englishName);
    if (!surah) return englishName;
    if (i18n.language === 'sq') return surah.albanianName || englishName;
    if (i18n.language === 'tr') return surah.turkishName || englishName;
    return surah.englishName;
  };

  const formatSessionTime = (timestamp: number): string => {
    const d = new Date(timestamp);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatDayDate = (dateStr: string): string => {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getDate()} ${t(MONTH_KEYS[d.getMonth()])}`;
  };

  const getTodayString = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const isFutureMonth = (): boolean => {
    const now = new Date();
    return viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth >= now.getMonth() + 1);
  };

  // Session CRUD
  const openAddSession = () => {
    setEditingSession(null);
    setFormDuration('');
    setFormStartPage('');
    setFormEndPage('');
    setSessionModalVisible(true);
  };

  const openEditSession = (session: ReadingSession) => {
    setEditingSession(session);
    setFormDuration(session.durationMinutes.toString());
    setFormStartPage(session.startPage.toString());
    setFormEndPage(session.endPage.toString());
    setSessionModalVisible(true);
  };

  const handleDeleteSession = (session: ReadingSession) => {
    Alert.alert(
      t('delete'),
      t('statsDeleteConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            await StatsService.deleteSession(session.id);
          },
        },
      ]
    );
  };

  const handleSaveSession = async () => {
    const duration = parseInt(formDuration);
    const startPage = parseInt(formStartPage);
    const endPage = parseInt(formEndPage);

    if (!duration || duration <= 0 || !startPage || startPage <= 0 || !endPage || endPage <= 0) {
      Alert.alert(t('error'), t('statsInvalidSession'));
      return;
    }

    const pagesRead = Math.abs(endPage - startPage);
    const surahs = getSurahsOnPage(endPage);
    const surahName = surahs.length > 0 ? surahs[0].englishName : 'Unknown';

    if (editingSession) {
      await StatsService.updateSession(editingSession.id, {
        durationMinutes: duration,
        pagesRead,
        startPage,
        endPage,
        surah: surahName,
      });
    } else if (selectedDate) {
      await StatsService.addManualSession(selectedDate, {
        durationMinutes: duration,
        pagesRead,
        startPage,
        endPage,
        surah: surahName,
      });
    }

    setSessionModalVisible(false);
    setEditingSession(null);
  };

  if (!monthData) return null;

  // Build calendar grid
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay();
  const startOffset = (firstDayOfWeek + 6) % 7;
  const todayStr = getTodayString();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={Platform.OS === 'android' ? ['top', 'bottom', 'left', 'right'] : ['top', 'bottom']}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}
        >
          <Ionicons name="arrow-back" size={22} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('readingStats')}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Calendar */}
        <View style={[styles.calendarCard, { backgroundColor: theme.card }]}>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={() => handleMonthChange(-1)} style={styles.monthNavButton}>
              <Ionicons name="chevron-back" size={22} color={theme.primary} />
            </TouchableOpacity>
            <Text style={[styles.monthTitle, { color: theme.text }]}>
              {t(MONTH_KEYS[viewMonth - 1])} {viewYear}
            </Text>
            <TouchableOpacity
              onPress={() => handleMonthChange(1)}
              style={styles.monthNavButton}
              disabled={isFutureMonth()}
            >
              <Ionicons name="chevron-forward" size={22} color={isFutureMonth() ? theme.border : theme.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarRow}>
            {[1, 2, 3, 4, 5, 6, 0].map((dayIdx) => (
              <View key={dayIdx} style={styles.calendarCell}>
                <Text style={[styles.dayHeader, { color: theme.secondaryText }]}>
                  {t(DAY_KEYS[dayIdx])}
                </Text>
              </View>
            ))}
          </View>

          {weeks.map((week, wi) => (
            <View key={wi} style={styles.calendarRow}>
              {week.map((day, di) => {
                if (day === null) {
                  return <View key={di} style={styles.calendarCell} />;
                }

                const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayStats = monthData.dailyStats[dateStr];
                const hasReading = dayStats && dayStats.sessionCount > 0;
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === todayStr;

                return (
                  <View key={di} style={styles.calendarCell}>
                    <TouchableOpacity
                      style={[
                        styles.dayButton,
                        hasReading && !isSelected && {
                          backgroundColor: isDarkMode ? '#1B3A1B' : '#E8F5E9',
                        },
                        isSelected && { backgroundColor: theme.primary },
                        isToday && !isSelected && {
                          borderWidth: 1.5,
                          borderColor: theme.primary,
                        },
                      ]}
                      onPress={() => handleDayPress(dateStr)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          { color: theme.secondaryText },
                          hasReading && !isSelected && { color: theme.primary, fontWeight: '700' },
                          isSelected && { color: '#FFF', fontWeight: '700' },
                          isToday && !isSelected && { color: theme.primary, fontWeight: '700' },
                        ]}
                      >
                        {day}
                      </Text>
                      {hasReading && !isSelected && (
                        <View style={[styles.activityDot, { backgroundColor: theme.primary }]} />
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ))}

          <View style={[styles.monthSummary, { borderTopColor: theme.border }]}>
            <View style={styles.monthSummaryItem}>
              <Text style={[styles.monthSummaryValue, { color: theme.text }]}>{monthData.totalMinutes}</Text>
              <Text style={[styles.monthSummaryLabel, { color: theme.secondaryText }]}>{t('statsMin')}</Text>
            </View>
            <View style={[styles.monthSummaryDivider, { backgroundColor: theme.border }]} />
            <View style={styles.monthSummaryItem}>
              <Text style={[styles.monthSummaryValue, { color: theme.text }]}>{monthData.totalPages}</Text>
              <Text style={[styles.monthSummaryLabel, { color: theme.secondaryText }]}>{t('pages')}</Text>
            </View>
            <View style={[styles.monthSummaryDivider, { backgroundColor: theme.border }]} />
            <View style={styles.monthSummaryItem}>
              <Text style={[styles.monthSummaryValue, { color: theme.text }]}>{monthData.activeDays}</Text>
              <Text style={[styles.monthSummaryLabel, { color: theme.secondaryText }]}>{t('statsDays')}</Text>
            </View>
          </View>
        </View>

        {/* Selected Day Detail */}
        {selectedDate && (() => {
          const dayStats = monthData.dailyStats[selectedDate];
          const hasReading = dayStats && dayStats.sessionCount > 0;

          return (
            <View style={[styles.dayDetailCard, { backgroundColor: theme.card }]}>
              <View style={styles.dayDetailHeader}>
                <Text style={[styles.dayDetailTitle, { color: theme.text }]}>
                  {formatDayDate(selectedDate)}
                </Text>
                <TouchableOpacity
                  onPress={openAddSession}
                  style={[styles.addSessionBtn, { backgroundColor: theme.primary }]}
                >
                  <Ionicons name="add" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              {!hasReading ? (
                <Text style={[styles.dayNoData, { color: theme.secondaryText }]}>
                  {t('statsNoDataDesc')}
                </Text>
              ) : (
                <>
                  <View style={styles.dayChipsRow}>
                    <View style={[styles.dayChip, { backgroundColor: isDarkMode ? '#1B3A1B' : '#E8F5E9' }]}>
                      <Ionicons name="time-outline" size={15} color={theme.primary} />
                      <Text style={[styles.dayChipText, { color: theme.primary }]}>
                        {dayStats.totalMinutes} {t('statsMin')}
                      </Text>
                    </View>
                    <View style={[styles.dayChip, { backgroundColor: isDarkMode ? '#0D2137' : '#E3F2FD' }]}>
                      <Ionicons name="document-text-outline" size={15} color="#2196F3" />
                      <Text style={[styles.dayChipText, { color: '#2196F3' }]}>
                        {dayStats.totalPages} {t('pages')}
                      </Text>
                    </View>
                    <View style={[styles.dayChip, { backgroundColor: isDarkMode ? '#2A1F3A' : '#F3E5F5' }]}>
                      <Ionicons name="bookmark-outline" size={15} color="#9C27B0" />
                      <Text style={[styles.dayChipText, { color: '#9C27B0' }]}>
                        {dayStats.sessionCount} {t('statsSessions')}
                      </Text>
                    </View>
                  </View>

                  {daySessions.map((session) => (
                    <TouchableOpacity key={session.id} style={[styles.sessionCard, { backgroundColor: theme.background }]} onPress={() => openEditSession(session)} activeOpacity={0.7}>
                      <View style={styles.sessionLeft}>
                        <Text style={[styles.sessionSurah, { color: theme.text }]} numberOfLines={1}>
                          {getTranslatedSurahName(session.surah)}
                        </Text>
                        <Text style={[styles.sessionPages, { color: theme.secondaryText }]}>
                          {t('page')} {session.startPage}–{session.endPage}
                        </Text>
                      </View>
                      <View style={styles.sessionRight}>
                        <Text style={[styles.sessionDuration, { color: theme.primary }]}>
                          {session.durationMinutes} {t('statsMin')}
                        </Text>
                        <Text style={[styles.sessionDate, { color: theme.secondaryText }]}>
                          {formatSessionTime(session.timestamp)}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={theme.secondaryText} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          );
        })()}
      </ScrollView>

      {/* Add/Edit Session Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={sessionModalVisible}
        onRequestClose={() => setSessionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior="padding" style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingSession ? t('statsEditSession') : t('statsAddSession')}
              </Text>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>{t('statsSessionDuration')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder={t('statsMin')}
                  placeholderTextColor={theme.secondaryText}
                  value={formDuration}
                  onChangeText={setFormDuration}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>{t('start')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    placeholder="1"
                    placeholderTextColor={theme.secondaryText}
                    value={formStartPage}
                    onChangeText={setFormStartPage}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>{t('end')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    placeholder="10"
                    placeholderTextColor={theme.secondaryText}
                    value={formEndPage}
                    onChangeText={setFormEndPage}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }]}
                  onPress={() => setSessionModalVisible(false)}
                >
                  <Text style={[styles.modalBtnText, { color: theme.secondaryText }]}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                  onPress={handleSaveSession}
                >
                  <Text style={[styles.modalBtnText, { color: '#FFF' }]}>{t('save')}</Text>
                </TouchableOpacity>
              </View>

              {editingSession && (
                <TouchableOpacity
                  style={styles.modalDeleteBtn}
                  onPress={() => {
                    setSessionModalVisible(false);
                    handleDeleteSession(editingSession);
                  }}
                >
                  <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                  <Text style={styles.modalDeleteText}>{t('delete')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  calendarCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavButton: {
    padding: 4,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  calendarRow: {
    flexDirection: 'row',
  },
  calendarCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 3,
  },
  dayHeader: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  dayButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
  },
  activityDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  monthSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  monthSummaryItem: {
    alignItems: 'center',
  },
  monthSummaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  monthSummaryLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  monthSummaryDivider: {
    width: 1,
    height: 30,
  },
  dayDetailCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  dayDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayDetailTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  addSessionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNoData: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  dayChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    marginBottom: 14,
  },
  dayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  sessionLeft: {
    flex: 1,
    marginRight: 12,
  },
  sessionSurah: {
    fontSize: 15,
    fontWeight: '600',
  },
  sessionPages: {
    fontSize: 13,
    marginTop: 3,
  },
  sessionRight: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  sessionDuration: {
    fontSize: 15,
    fontWeight: '700',
  },
  sessionDate: {
    fontSize: 12,
    marginTop: 3,
  },
  modalDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 10,
  },
  modalDeleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
  },
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
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    borderWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
