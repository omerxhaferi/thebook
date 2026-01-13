import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import { subscribe, unzip } from 'react-native-zip-archive';

const QURAN_PAGES_DIR = Paths.document.uri.replace(/\/$/, '') + '/quran_pages/';
const ZIP_URLS = {
    low: 'https://omahapp-deployments.s3.eu-central-1.amazonaws.com/low.zip',
    mid: 'https://omahapp-deployments.s3.eu-central-1.amazonaws.com/mid.zip',
    high: 'https://omahapp-deployments.s3.eu-central-1.amazonaws.com/high.zip',
};

const DOWNLOAD_SIZES = {
    low: '150 MB',
    mid: '300 MB',
    high: '1 GB'
};

export const DownloadService = {
    async ensureDirectoryExists() {
        const dirInfo = await FileSystem.getInfoAsync(QURAN_PAGES_DIR);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(QURAN_PAGES_DIR, { intermediates: true });
        }
    },

    async clearPagesDirectory() {
        try {
            const dirInfo = await FileSystem.getInfoAsync(QURAN_PAGES_DIR);
            if (dirInfo.exists) {
                await FileSystem.deleteAsync(QURAN_PAGES_DIR);
            }
            // Re-create the empty directory
            await this.ensureDirectoryExists();

            // Clear preferences
            await AsyncStorage.removeItem('quran_quality_preference');
            await AsyncStorage.removeItem('quran_images_downloaded');
        } catch (error) {
            console.error('Error clearing pages directory:', error);
            throw error;
        }
    },

    async downloadAndUnzip(quality: 'low' | 'mid' | 'high', onProgress: (progress: number, message: string) => void) {
        try {
            const url = ZIP_URLS[quality];
            if (!url) {
                throw new Error(`No URL for quality: ${quality}`);
            }

            // Clear existing pages first
            await this.clearPagesDirectory();

            const zipUri = Paths.cache.uri + '/quran_pages.zip';

            // 1. Download
            onProgress(0, 'downloading');

            const downloadResumable = FileSystem.createDownloadResumable(
                url,
                zipUri,
                {},
                (downloadProgress) => {
                    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                    // Scale download progress to 0-50%
                    onProgress(progress * 0.5, 'downloading');
                }
            );

            const downloadResul = await downloadResumable.downloadAsync();
            if (!downloadResul || downloadResul.status !== 200) {
                throw new Error('Download failed');
            }

            // 2 & 3. Native Unzip (Fast & Memory Efficient)
            onProgress(0.5, 'extracting');

            const targetPath = QURAN_PAGES_DIR.replace('file://', '').replace(/\/+$/, '');
            const sourceZip = zipUri.replace('file://', '');

            // Subscribe to native progress
            const progressSubscription = subscribe(({ progress }: { progress: number }) => {
                // Scale unzip progress from 50% to 90%
                onProgress(0.5 + (progress * 0.4), 'extracting');
            });

            try {
                await unzip(sourceZip, targetPath);
            } finally {
                progressSubscription.remove();
            }

            onProgress(0.9, 'finalizing');

            // Fix for nested folders (if zip contains a folder inside)
            const rootFiles = await FileSystem.readDirectoryAsync(QURAN_PAGES_DIR);
            for (const file of rootFiles) {
                const filePath = QURAN_PAGES_DIR + file;
                const info = await FileSystem.getInfoAsync(filePath);
                if (info.isDirectory) {
                    const subFiles = await FileSystem.readDirectoryAsync(filePath);
                    for (const subFile of subFiles) {
                        try {
                            await FileSystem.moveAsync({
                                from: filePath + '/' + subFile,
                                to: QURAN_PAGES_DIR + subFile
                            });
                        } catch (e) {
                            console.error(`Failed to move ${subFile}`, e);
                        }
                    }
                }
            }

            // 4. Cleanup and Save Preference
            await FileSystem.deleteAsync(zipUri);
            await AsyncStorage.setItem('quran_quality_preference', quality);
            await AsyncStorage.setItem('quran_images_downloaded', 'true');

            onProgress(1, 'complete');

        } catch (error) {
            console.error('Download error:', error);
            throw error;
        }
    },

    async getLocalPageUri(pageName: string): Promise<string | null> {
        const isDownloaded = await AsyncStorage.getItem('quran_images_downloaded');
        if (isDownloaded === 'true') {
            const path = QURAN_PAGES_DIR + pageName + '.jpg'; // Assuming jpg extension to match reader
            const info = await FileSystem.getInfoAsync(path);
            if (info.exists) {
                return path;
            }
        }
        return null;
    },

    async isDownloaded(): Promise<boolean> {
        const isDownloaded = await AsyncStorage.getItem('quran_images_downloaded');
        return isDownloaded === 'true';
    },

    async getQuality(): Promise<string | null> {
        return await AsyncStorage.getItem('quran_quality_preference');
    },

    getDownloadSize(quality: 'low' | 'mid' | 'high'): string {
        return DOWNLOAD_SIZES[quality];
    },

    async getFreeDiskSpace(): Promise<number> {
        return await FileSystem.getFreeDiskStorageAsync();
    }
};
