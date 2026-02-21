import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeContextType = {
    isDarkMode: boolean;
    toggleTheme: () => void;
    theme: {
        background: string;
        text: string;
        card: string;
        border: string;
        primary: string;
        secondaryText: string;
        tint: string;
    };
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const stored = await AsyncStorage.getItem('isDarkMode');
            if (stored !== null) {
                setIsDarkMode(JSON.parse(stored));
            } else {
                // Default to false as requested by user ("Default should be off though always")
                setIsDarkMode(false);
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    };

    const toggleTheme = async () => {
        try {
            const newValue = !isDarkMode;
            setIsDarkMode(newValue);
            await AsyncStorage.setItem('isDarkMode', JSON.stringify(newValue));
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const theme = {
        background: isDarkMode ? '#121212' : '#F8F7F5',
        text: isDarkMode ? '#FFFFFF' : '#000000',
        card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
        border: isDarkMode ? '#333333' : '#E0E0E0',
        primary: '#2E7D32',
        secondaryText: isDarkMode ? '#B0B0B0' : '#666666',
        tint: isDarkMode ? '#FFFFFF' : '#000000',
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
