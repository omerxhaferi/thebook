import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Bookmark {
    id: string;
    name: string;
    sura: string;
    page: number;
    date: string;
    time: string;
    timestamp?: number;
    color: string;
    startPage?: number;
    endPage?: number;
    startJuz?: number;
    endJuz?: number;
    row?: number;
}

export interface LastRead {
    sura: string;
    page: number;
    date: string;
    time: string;
    timestamp?: number;
    duration: string;
    durationMinutes?: number;
    pages: number;
    row?: number;
    surahs?: string[];
}

type Listener = () => void;

class BookmarkServiceClass {
    private bookmarks: Bookmark[] = [];
    private lastRead: LastRead | null = null;
    private listeners: Set<Listener> = new Set();
    private isLoaded: boolean = false;

    constructor() {
        this.loadInitialData();
    }

    private async loadInitialData() {
        try {
            const [storedBookmarks, storedLastRead] = await Promise.all([
                AsyncStorage.getItem('bookmarks'),
                AsyncStorage.getItem('lastRead'),
            ]);

            if (storedBookmarks) {
                this.bookmarks = JSON.parse(storedBookmarks);
            }
            if (storedLastRead) {
                this.lastRead = JSON.parse(storedLastRead);
            }
            this.isLoaded = true;
            this.notify();
        } catch (error) {
            console.error('Error loading initial bookmark data:', error);
        }
    }

    subscribe(listener: Listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notify() {
        this.listeners.forEach(l => l());
    }

    async getBookmarks(): Promise<Bookmark[]> {
        if (!this.isLoaded) {
            const stored = await AsyncStorage.getItem('bookmarks');
            if (stored) this.bookmarks = JSON.parse(stored);
            this.isLoaded = true;
        }
        return this.bookmarks;
    }

    async getLastRead(): Promise<LastRead | null> {
        if (!this.isLoaded) {
            const stored = await AsyncStorage.getItem('lastRead');
            if (stored) this.lastRead = JSON.parse(stored);
            this.isLoaded = true;
        }
        return this.lastRead;
    }

    async updateLastRead(lastRead: LastRead) {
        this.lastRead = lastRead;
        this.notify();
        await AsyncStorage.setItem('lastRead', JSON.stringify(lastRead));
    }

    async updateBookmarkPage(id: string, page: number, row: number, sura: string, date: string, time: string) {
        this.bookmarks = this.bookmarks.map(b =>
            b.id === id ? { ...b, page, row, sura, date, time, timestamp: Date.now() } : b
        );
        this.notify();
        await AsyncStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    }

    async updateBookmark(updatedBookmark: Bookmark) {
        this.bookmarks = this.bookmarks.map(b =>
            b.id === updatedBookmark.id ? updatedBookmark : b
        );
        this.notify();
        await AsyncStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    }

    async addBookmark(bookmark: Bookmark) {
        this.bookmarks = [...this.bookmarks, bookmark];
        this.notify();
        await AsyncStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    }

    async deleteBookmark(id: string) {
        this.bookmarks = this.bookmarks.filter(b => b.id !== id);
        this.notify();
        await AsyncStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    }

    // Reload from storage to ensure we have latest (e.g. when app comes from background)
    async refresh() {
        await this.loadInitialData();
    }
}

export const BookmarkService = new BookmarkServiceClass();
