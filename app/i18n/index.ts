import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import 'intl-pluralrules';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import sq from './locales/sq.json';
import tr from './locales/tr.json';

const RESOURCES = {
    en: { translation: en },
    sq: { translation: sq },
    tr: { translation: tr },
};

const LANGUAGE_KEY = 'user-language';

export const detectLanguage = async () => {
    try {
        // 1. Check AsyncStorage first
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage) {
            return savedLanguage;
        }

        // 2. Check IP (with 3s timeout to prevent blocking app startup)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const response = await fetch("https://ipinfo.io/json", { signal: controller.signal });
        clearTimeout(timeout);
        const data = await response.json();
        const country = data.country;

        if (country === 'TR') {
            return 'tr';
        } else if (['MK', 'AL', 'XK'].includes(country)) {
            return 'sq';
        }

        // 3. Fallback
        return 'en';
    } catch (error) {
        console.log('Language detection failed:', error);
        return 'en';
    }
};

export const initI18n = async () => {
    const language = await detectLanguage();

    if (!i18n.isInitialized) {
        await i18n
            .use(initReactI18next)
            .init({
                resources: RESOURCES,
                lng: language,
                fallbackLng: 'en',
                interpolation: {
                    escapeValue: false,
                },
                // @ts-ignore
                compatibilityJSON: 'v3'
            });
    }

    return i18n;
};

export const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
};

export default i18n;
