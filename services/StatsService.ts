import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReadingSession {
    id: string;
    timestamp: number;
    date: string;
    durationMinutes: number;
    pagesRead: number;
    startPage: number;
    endPage: number;
    surah: string;
}

export interface DailyStats {
    date: string;
    totalMinutes: number;
    totalPages: number;
    sessionCount: number;
}

export interface MonthData {
    year: number;
    month: number;
    dailyStats: Record<string, DailyStats>;
    totalMinutes: number;
    totalPages: number;
    totalSessions: number;
    activeDays: number;
}

export interface StatsSummary {
    todayMinutes: number;
    todayPages: number;
    todaySessions: number;
    currentStreak: number;
    longestStreak: number;
    totalMinutes: number;
    totalPages: number;
    totalSessions: number;
    totalDaysRead: number;
}

interface StatsData {
    sessions: ReadingSession[];
    dailyStats: Record<string, DailyStats>;
}

const STATS_STORAGE_KEY = 'readingStats';

type Listener = () => void;

class StatsServiceClass {
    private data: StatsData = { sessions: [], dailyStats: {} };
    private listeners: Set<Listener> = new Set();
    private isLoaded: boolean = false;

    constructor() {
        this.loadInitialData();
    }

    private async loadInitialData() {
        try {
            const stored = await AsyncStorage.getItem(STATS_STORAGE_KEY);
            if (stored) {
                this.data = JSON.parse(stored);
            }
            this.isLoaded = true;
            this.notify();
        } catch (error) {
            console.error('Error loading stats data:', error);
        }
    }

    subscribe(listener: Listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notify() {
        this.listeners.forEach(l => l());
    }

    private async persist() {
        await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(this.data));
    }

    private getDateString(timestamp: number): string {
        const d = new Date(timestamp);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    private getTodayString(): string {
        return this.getDateString(Date.now());
    }

    async logSession(session: Omit<ReadingSession, 'id' | 'date'>): Promise<void> {
        if (!this.isLoaded) {
            await this.loadInitialData();
        }

        const date = this.getDateString(session.timestamp);
        const id = `${session.timestamp}-${Math.random().toString(36).substring(2, 8)}`;

        const fullSession: ReadingSession = { ...session, id, date };

        this.data.sessions.push(fullSession);

        if (!this.data.dailyStats[date]) {
            this.data.dailyStats[date] = { date, totalMinutes: 0, totalPages: 0, sessionCount: 0 };
        }
        this.data.dailyStats[date].totalMinutes += session.durationMinutes;
        this.data.dailyStats[date].totalPages += session.pagesRead;
        this.data.dailyStats[date].sessionCount += 1;

        this.notify();
        await this.persist();
    }

    /**
     * Get month data for a given year and month (1-12).
     */
    async getMonthData(year: number, month: number): Promise<MonthData> {
        if (!this.isLoaded) {
            await this.loadInitialData();
        }

        const daysInMonth = new Date(year, month, 0).getDate();
        const monthStr = String(month).padStart(2, '0');
        const dailyStats: Record<string, DailyStats> = {};
        let totalMinutes = 0;
        let totalPages = 0;
        let totalSessions = 0;
        let activeDays = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
            const stats = this.data.dailyStats[dateStr];
            if (stats && stats.sessionCount > 0) {
                dailyStats[dateStr] = stats;
                totalMinutes += stats.totalMinutes;
                totalPages += stats.totalPages;
                totalSessions += stats.sessionCount;
                activeDays++;
            }
        }

        return { year, month, dailyStats, totalMinutes, totalPages, totalSessions, activeDays };
    }

    /**
     * Get all sessions for a specific date (YYYY-MM-DD).
     */
    async getSessionsForDate(date: string): Promise<ReadingSession[]> {
        if (!this.isLoaded) {
            await this.loadInitialData();
        }

        return this.data.sessions
            .filter(s => s.date === date)
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    async getStatsSummary(): Promise<StatsSummary> {
        if (!this.isLoaded) {
            await this.loadInitialData();
        }

        const today = this.getTodayString();
        const todayStats = this.data.dailyStats[today] || { totalMinutes: 0, totalPages: 0, sessionCount: 0 };

        // All-time totals
        const allDays = Object.values(this.data.dailyStats);
        const totalMinutes = allDays.reduce((sum, d) => sum + d.totalMinutes, 0);
        const totalPages = allDays.reduce((sum, d) => sum + d.totalPages, 0);
        const totalSessions = allDays.reduce((sum, d) => sum + d.sessionCount, 0);
        const totalDaysRead = allDays.filter(d => d.sessionCount > 0).length;

        const { currentStreak, longestStreak } = this.calculateStreaks();

        return {
            todayMinutes: todayStats.totalMinutes,
            todayPages: todayStats.totalPages,
            todaySessions: todayStats.sessionCount,
            currentStreak,
            longestStreak,
            totalMinutes,
            totalPages,
            totalSessions,
            totalDaysRead,
        };
    }

    private recalculateDailyStats(date: string) {
        const sessionsForDate = this.data.sessions.filter(s => s.date === date);
        if (sessionsForDate.length === 0) {
            delete this.data.dailyStats[date];
        } else {
            this.data.dailyStats[date] = {
                date,
                totalMinutes: sessionsForDate.reduce((sum, s) => sum + s.durationMinutes, 0),
                totalPages: sessionsForDate.reduce((sum, s) => sum + s.pagesRead, 0),
                sessionCount: sessionsForDate.length,
            };
        }
    }

    async deleteSession(sessionId: string): Promise<void> {
        if (!this.isLoaded) {
            await this.loadInitialData();
        }

        const session = this.data.sessions.find(s => s.id === sessionId);
        if (!session) return;

        const date = session.date;
        this.data.sessions = this.data.sessions.filter(s => s.id !== sessionId);
        this.recalculateDailyStats(date);

        this.notify();
        await this.persist();
    }

    async updateSession(sessionId: string, updates: Partial<Omit<ReadingSession, 'id' | 'date'>>): Promise<void> {
        if (!this.isLoaded) {
            await this.loadInitialData();
        }

        const index = this.data.sessions.findIndex(s => s.id === sessionId);
        if (index === -1) return;

        const session = this.data.sessions[index];
        this.data.sessions[index] = { ...session, ...updates };
        this.recalculateDailyStats(session.date);

        this.notify();
        await this.persist();
    }

    async addManualSession(date: string, session: { durationMinutes: number; pagesRead: number; startPage: number; endPage: number; surah: string }): Promise<void> {
        if (!this.isLoaded) {
            await this.loadInitialData();
        }

        const timestamp = new Date(date + 'T12:00:00').getTime();
        const id = `${timestamp}-${Math.random().toString(36).substring(2, 8)}`;

        const fullSession: ReadingSession = {
            ...session,
            id,
            date,
            timestamp,
        };

        this.data.sessions.push(fullSession);
        this.recalculateDailyStats(date);

        this.notify();
        await this.persist();
    }

    private calculateStreaks(): { currentStreak: number; longestStreak: number } {
        const sortedDates = Object.keys(this.data.dailyStats)
            .filter(date => this.data.dailyStats[date].sessionCount > 0)
            .sort();

        if (sortedDates.length === 0) {
            return { currentStreak: 0, longestStreak: 0 };
        }

        let longestStreak = 1;
        let currentRun = 1;

        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i - 1] + 'T00:00:00');
            const currDate = new Date(sortedDates[i] + 'T00:00:00');
            const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentRun++;
                longestStreak = Math.max(longestStreak, currentRun);
            } else {
                currentRun = 1;
            }
        }

        const today = this.getTodayString();
        const yesterday = this.getDateString(Date.now() - 86400000);

        let currentStreak = 0;
        let startDate: string;

        if (this.data.dailyStats[today]?.sessionCount > 0) {
            startDate = today;
        } else if (this.data.dailyStats[yesterday]?.sessionCount > 0) {
            startDate = yesterday;
        } else {
            return { currentStreak: 0, longestStreak };
        }

        const d = new Date(startDate + 'T00:00:00');
        while (true) {
            const dateStr = this.getDateString(d.getTime());
            if (this.data.dailyStats[dateStr]?.sessionCount > 0) {
                currentStreak++;
                d.setDate(d.getDate() - 1);
            } else {
                break;
            }
        }

        longestStreak = Math.max(longestStreak, currentStreak);

        return { currentStreak, longestStreak };
    }
}

export const StatsService = new StatsServiceClass();
