import { useTheme } from '@/app/context/ThemeContext';
import DownloadModal from '@/components/DownloadModal';
import { getJuzNumber, getSurahsOnPage } from '@/constants/surahs';
import { DownloadService } from '@/services/DownloadService';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Paths } from 'expo-file-system';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppState,
  AppStateStatus,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, FeColorMatrix, Filter, Image as SvgImage } from 'react-native-svg';

// Generate all page names from 'aa' to 'xl'
function generatePageNames(): string[] {
  const pages: string[] = [];
  // Generate page names from 001 to 611
  for (let i = 1; i <= 609; i++) {
    pages.push(i.toString().padStart(3, '0'));
  }
  return pages;
}

// Generate the page list once
const PAGE_NAMES = generatePageNames();
const PAGES = PAGE_NAMES.map(name => ({
  name,
}));

// Pages that contain sajdah (prostration) in the Quran
// Note: Page numbers match the user's system where page 1 is empty, so Quran starts at page 2
const SAJDAH_PAGES = [
  177, // al-A’raf, 7:206
  252, // ar-Ra’d, 13:15
  273, // an-Nahl, 16:50
  294, // al-Isra, 17:109
  310, // Maryam, 19:58
  335, // al-Hajj, 22:18
  342, // al-Hajj, 22:77
  366, // al-Furqan, 25:60
  380, // an-Naml, 27:26
  417, // as-Sajdah, 32:15
  455, // Sad, 38:24
  481, // Fussilat, 41:38
  529, // an-Najm, 53:62
  591, // al-Inshiqaq, 84:21
  599  // al-Alaq, 96:19
];
// 177 (al-A’raf, 7:206)
// 252 (ar-Ra’d, 13:15)
import { BookmarkService, LastRead } from '@/services/BookmarkService';



const formatTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const SETTINGS_KEY = 'rowHighlighterEnabled';

// Try to import ColorMatrix at module level (will fail gracefully if not available)
// Removed react-native-color-matrix-image-filters as it is not compatible with Expo Go

// Helper component to conditionally apply color inversion
const InvertedImage = React.memo(({ source, style, contentFit, cachePolicy, isDarkMode }: {
  source: any;
  style: any;
  contentFit: any;
  cachePolicy: any;
  isDarkMode: boolean;
}) => {
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  // For web, wrap in a View with CSS filter applied to the container
  if (Platform.OS === 'web') {
    if (isDarkMode) {
      return (
        <View
          style={[
            style,
            {
              filter: 'invert(1)',
            } as any
          ]}
        >
          <Image
            source={source}
            style={StyleSheet.absoluteFill}
            contentFit={contentFit}
            cachePolicy={cachePolicy}
          />
        </View>
      );
    }
    return (
      <Image
        source={source}
        style={style}
        contentFit={contentFit}
        cachePolicy={cachePolicy}
      />
    );
  }

  // For native, use Svg with FeColorMatrix if in dark mode
  if (isDarkMode) {
    return (
      <View
        style={[style, { overflow: 'hidden' }]}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          if (width !== layout.width || height !== layout.height) {
            setLayout({ width, height });
          }
        }}
      >
        {layout.width > 0 && layout.height > 0 ? (
          <Svg
            width={layout.width}
            height={layout.height}
            style={StyleSheet.absoluteFill}
          >
            <Defs>
              <Filter id="invert">
                <FeColorMatrix
                  in="SourceGraphic"
                  type="matrix"
                  values="-1.1 0 0 0 1
                          0 -1.2 -0.4 0.1 1
                          -0.3 0 -1.4 0.1 1 
                          -0.2 -0.6 0 0.8 0"
                />
              </Filter>
            </Defs>
            <SvgImage
              x="0"
              y="0"
              width={layout.width}
              height={layout.height}
              preserveAspectRatio="none"
              href={source}
              filter="url(#invert)"
            />
          </Svg>
        ) : (
          // Render a placeholder or the original image while waiting for layout
          // Using original image ensures something is visible immediately
          <Image
            source={source}
            style={StyleSheet.absoluteFill}
            contentFit={contentFit}
            cachePolicy={cachePolicy}
          />
        )}
      </View>
    );
  }

  // Fallback: regular image (when not in dark mode)
  return (
    <Image
      source={source}
      style={style}
      contentFit={contentFit}
      cachePolicy={cachePolicy}
    />
  );
});

// Component to render a single page with optional highlighter
const PageItem = React.memo(({
  item,
  index,
  isLandscape,
  screenWidth,
  contentWidth,
  rowHighlighterEnabled,
  currentRow,
  isDarkMode,
  useLocalImages,
  quality
}: {
  item: typeof PAGES[0],
  index: number,
  isLandscape: boolean,
  screenWidth: number,
  contentWidth: number,
  rowHighlighterEnabled: boolean,
  currentRow: number,
  isDarkMode: boolean,
  useLocalImages: boolean,
  quality: string | null
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [imageHeight, setImageHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const { t } = useTranslation();

  const imageSource = useMemo(() => {
    if (useLocalImages) {
      // Use jpg extension as that's what we expect from the zip
      // Add quality param to bust cache when quality changes
      return { uri: Paths.document.uri.replace(/\/$/, '') + '/quran_pages/' + item.name + '.jpg?q=' + (quality || 'none') };
    }
    return null;
  }, [useLocalImages, item.name, quality]);

  // Animation value for current row (0-15)
  const rowProgress = useSharedValue(currentRow);

  useEffect(() => {
    rowProgress.value = withTiming(currentRow, { duration: 300 });
  }, [currentRow]);

  // Use explicit pixels instead of percentages to avoid layout instability on Android
  const highlightStyle = useAnimatedStyle(() => {
    // If we don't have height yet, hide or default to 0
    // In portrait, containerHeight IS the image height area effectively
    const activeHeight = isLandscape ? imageHeight : containerHeight;
    const activeWidth = isLandscape ? contentWidth : screenWidth;

    if (activeHeight === 0) {
      return { display: 'none' };
    }

    const rowHeight = activeHeight / 15;

    return {
      display: 'flex',
      top: rowProgress.value * rowHeight,
      height: rowHeight,
      width: activeWidth,
    };
  }, [imageHeight, containerHeight, isLandscape, contentWidth, screenWidth]);

  // Scroll to center the current row in landscape mode
  useEffect(() => {
    if (isLandscape && rowHighlighterEnabled && scrollViewRef.current && imageHeight > 0 && containerHeight > 0) {
      const rowHeight = imageHeight / 15;
      const rowCenterY = (currentRow * rowHeight) + (rowHeight / 2);
      const targetY = rowCenterY - (containerHeight / 2);
      const maxScrollY = Math.max(0, imageHeight - containerHeight);
      const clampedY = Math.max(0, Math.min(maxScrollY, targetY));

      scrollViewRef.current.scrollTo({ y: clampedY, animated: true });
    }
  }, [isLandscape, rowHighlighterEnabled, currentRow, imageHeight, containerHeight]);

  const onImageLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) setImageHeight(height);
  };

  const onContainerLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) setContainerHeight(height);
  };

  if (!useLocalImages || !imageSource) {
    const activeWidth = isLandscape ? contentWidth : screenWidth;
    return (
      <View style={[styles.pageContainer, { width: activeWidth, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ textAlign: 'center', color: isDarkMode ? '#fff' : '#000' }}>
          {t('downloadRequired') || 'Download Required'}
        </Text>
      </View>
    );
  }

  if (isLandscape) {
    const horizontalPadding = 0;
    return (
      <View
        style={[styles.pageContainer, { width: contentWidth, paddingHorizontal: horizontalPadding }]}
        onLayout={onContainerLayout}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.pageScrollView}
          showsVerticalScrollIndicator={false}
          bounces={!rowHighlighterEnabled}
          scrollEnabled={!rowHighlighterEnabled}
        >
          <View onLayout={onImageLayout}>
            <InvertedImage
              source={imageSource}
              style={styles.landscapeImage}
              contentFit="fill"
              cachePolicy="memory-disk"
              isDarkMode={isDarkMode}
            />
            {rowHighlighterEnabled && (
              <Animated.View style={[
                styles.highlightOverlay,
                highlightStyle,
                { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 255, 0, 0.15)' }
              ]} />
            )}
          </View>
        </ScrollView>
      </View>
    );
  } else {
    return (
      <View style={[styles.pageContainer, { width: contentWidth }]}>
        <View style={{ width: '100%', height: '100%' }} onLayout={onContainerLayout}>
          <InvertedImage
            source={imageSource}
            style={styles.pageImage}
            contentFit="fill"
            cachePolicy="memory-disk"
            isDarkMode={isDarkMode}
          />
          {rowHighlighterEnabled && (
            <Animated.View style={[
              styles.highlightOverlay,
              highlightStyle,
              { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 255, 0, 0.15)' }
            ]} />
          )}
        </View>
      </View >
    );
  }
});

export default function ReaderScreen() {
  const { theme, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const { page, bookmarkId } = useLocalSearchParams();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const [currentPage, setCurrentPage] = useState(0);
  const [currentSurahs, setCurrentSurahs] = useState<string[]>([]);
  const [currentRow, setCurrentRow] = useState(0); // 0-14
  const [rowHighlighterEnabled, setRowHighlighterEnabled] = useState(false);
  const [useLocalImages, setUseLocalImages] = useState(false);
  const [quality, setQuality] = useState<string | null>(null);
  const dimensions = Dimensions.get('window');
  const [screenWidth, setScreenWidth] = useState(dimensions.width);
  const [contentWidth, setContentWidth] = useState(dimensions.width);
  const [isLandscape, setIsLandscape] = useState(dimensions.width > dimensions.height);
  const sessionStartedRef = useRef(false);
  const sessionStartTimeRef = useRef<number | null>(null);
  const sessionStartPageRef = useRef<number | null>(null);
  const latestPageRef = useRef<number | null>(null);
  const currentRowRef = useRef(currentRow);
  const currentSurahsRef = useRef(currentSurahs);
  const [limits, setLimits] = useState<{
    startPage?: number;
    endPage?: number;
    startJuz?: number;
    endJuz?: number;
  }>({});
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    currentRowRef.current = currentRow;
  }, [currentRow]);

  useEffect(() => {
    currentSurahsRef.current = currentSurahs;
  }, [currentSurahs]);

  // Load settings
  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        try {
          const stored = await AsyncStorage.getItem(SETTINGS_KEY);
          if (stored !== null) {
            setRowHighlighterEnabled(JSON.parse(stored));
          }

          // Check for downloaded images
          const isDownloaded = await DownloadService.isDownloaded();

          if (!isDownloaded) {

            setShowDownloadModal(true);
          }

          setUseLocalImages(isDownloaded);
          const q = await DownloadService.getQuality();
          setQuality(q);

        } catch (error) {
          console.error('Error loading settings in Reader:', error);
        }
      };
      loadSettings();
    }, [])
  );

  const persistSession = useCallback(async () => {
    if (sessionStartTimeRef.current === null || sessionStartPageRef.current === null || latestPageRef.current === null) {
      return;
    }

    const endPage = latestPageRef.current;

    // Calculate elapsed time for this reading session
    const elapsedMs = Date.now() - sessionStartTimeRef.current;
    const elapsedMinutes = elapsedMs / 60000;

    // If user hasn't read for at least 5 seconds, don't persist anything to AsyncStorage
    if (elapsedMs < 5000) {
      return;
    }

    const durationMinutes = Math.max(1, Math.round(elapsedMinutes));

    const pagesRead = Math.max(0, Math.abs(endPage - sessionStartPageRef.current));
    const surahs = getSurahsOnPage(endPage);
    const surahName = surahs.length > 0 ? surahs[0].englishName : 'Unknown';
    const formatDate = () => {
      const now = new Date();
      const months = ['january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'];
      return `${now.getDate()} ${t(months[now.getMonth()])}`;
    };

    const sessionDate = formatDate();
    const sessionTime = formatTime();

    const lastReadPayload: LastRead = {
      sura: surahName,
      page: latestPageRef.current,
      date: sessionDate,
      time: sessionTime,
      timestamp: Date.now(),
      duration: `${durationMinutes} ${t('minutes')}`,
      durationMinutes: durationMinutes,
      pages: pagesRead,
      row: currentRowRef.current,
      surahs: currentSurahsRef.current,
    };
    try {
      await BookmarkService.updateLastRead(lastReadPayload);

      if (bookmarkId && typeof bookmarkId === 'string') {
        await BookmarkService.updateBookmarkPage(
          bookmarkId,
          latestPageRef.current,
          currentRowRef.current,
          surahName,
          sessionDate,
          sessionTime
        );
      }
    } catch (error) {
      console.error('Error saving reading session:', error);
    }
  }, [bookmarkId]); // Removed currentRow and currentSurahs dependencies

  const schedulePersist = useCallback(() => {
    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }
    persistTimeoutRef.current = setTimeout(() => {
      persistSession();
    }, 200);
  }, [persistSession]);

  const updateSessionProgress = useCallback((pageNumber: number) => {
    if (!sessionStartedRef.current) {
      sessionStartPageRef.current = pageNumber;
      sessionStartTimeRef.current = Date.now();
      sessionStartedRef.current = true;
    }

    // Track the last visible page (not just the max) so backward reading counts
    latestPageRef.current = pageNumber;

    schedulePersist();
  }, [schedulePersist]);

  // Listen for dimension changes (orientation changes)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      // Store the current page before updating width
      const currentPageBeforeResize = currentPage;
      const newWidth = window.width;
      setScreenWidth(newWidth);
      setIsLandscape(newWidth > window.height);

      // Update screen width for rotation
      // After width changes, scroll back to the current page
      setTimeout(() => {
        if (flatListRef.current && currentPageBeforeResize >= 0) {
          flatListRef.current.scrollToIndex({
            index: currentPageBeforeResize,
            animated: false
          });
        }
      }, 100);

      // Reset row if needed or keep it? 
      // User didn't specify, but keeping it seems safe.
    });

    return () => {
      subscription?.remove();
    };
  }, [currentPage]);

  // Gesture Handler
  const handleRowChange = (direction: 'up' | 'down') => {
    const isAtStartPage = limits.startPage ? (currentPage + 1 <= limits.startPage) : false;
    const isAtEndPage = limits.endPage ? (currentPage + 1 >= limits.endPage) : false;
    const currentJuz = getJuzNumber(currentPage + 1);
    const isAtStartJuz = limits.startJuz ? (currentJuz <= limits.startJuz) : false;
    const isAtEndJuz = limits.endJuz ? (currentJuz >= limits.endJuz) : false;

    if (direction === 'down') {
      // Moving highlight DOWN (reading forward)
      if (currentRowRef.current < 14) {
        setCurrentRow(prev => prev + 1);
      } else {
        // Next page
        if (currentPage < PAGES.length - 1) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          setCurrentRow(0);
          flatListRef.current?.scrollToIndex({ index: nextPage, animated: true });
        }
      }
    } else {
      // Moving highlight UP (reading backward)
      if (currentRowRef.current > 0) {
        setCurrentRow(prev => prev - 1);
      } else {
        // Previous page
        if (currentPage > 0) {
          const prevPage = currentPage - 1;
          setCurrentPage(prevPage);
          setCurrentRow(14); // Go to last row of previous page
          flatListRef.current?.scrollToIndex({ index: prevPage, animated: true });
        }
      }
    }
  };

  // Keep a fresh ref to the handler
  const handleRowChangeRef = useRef(handleRowChange);
  useEffect(() => {
    handleRowChangeRef.current = handleRowChange;
  }, [handleRowChange]);

  const panGesture = useMemo(() => Gesture.Pan()
    .enabled(rowHighlighterEnabled)
    .runOnJS(true)
    .onEnd((e) => {
      if (!rowHighlighterEnabled) return;

      const { translationY } = e;
      const threshold = 30; // Sensitivity

      if (translationY < -threshold) {
        // Swipe UP -> Move Highlight UP (index decreases)
        handleRowChangeRef.current('up');
      } else if (translationY > threshold) {
        // Swipe DOWN -> Move Highlight DOWN (index increases)
        handleRowChangeRef.current('down');
      }
    }), [rowHighlighterEnabled]);

  useFocusEffect(
    useCallback(() => {
      // When leaving the reader (blur), persist any progress immediately
      return () => {
        persistSession();
      };
    }, [persistSession])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextStatus => {
      if (appState.current === 'active' && nextStatus.match(/inactive|background/)) {
        persistSession();
      }
      appState.current = nextStatus;
    });

    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
      }
      subscription.remove();
      persistSession();
    };
  }, [persistSession]);

  useEffect(() => {
    // If a page number is provided, try to scroll to it
    // Page numbers are 1-based, but array indices are 0-based
    if (page && typeof page === 'string') {
      const pageNum = parseInt(page, 10);
      const pageIndex = pageNum - 1; // Convert 1-based to 0-based
      if (!isNaN(pageIndex) && pageIndex >= 0 && pageIndex < PAGES.length) {
        setCurrentPage(pageIndex);

        // Restore row if provided in params (e.g. from bookmark)
        // We need to check if 'row' param exists in useLocalSearchParams, 
        // but currently we only get page and bookmarkId.
        // Wait, if we are loading a bookmark, we should load the row from the bookmark data.
        // But here we only have page number. 
        // Let's check if we can get the row from the bookmark itself if bookmarkId is present.

        // Actually, the best place to restore row is probably where we load the bookmark or last session.
        // But this useEffect runs when 'page' param changes.

        // Let's try to get the row and limits from the bookmark if bookmarkId is present
        const restoreRow = async () => {
          if (bookmarkId) {
            try {
              const bookmarks = await BookmarkService.getBookmarks();
              const bookmark = bookmarks.find(b => b.id === bookmarkId);
              if (bookmark) {
                if (bookmark.row !== undefined) {
                  setCurrentRow(bookmark.row);
                } else {
                  setCurrentRow(0);
                }

                // Set limits
                setLimits({
                  startPage: bookmark.startPage,
                  endPage: bookmark.endPage,
                  startJuz: bookmark.startJuz,
                  endJuz: bookmark.endJuz,
                });
              }
            } catch (e) {
              console.error("Error loading bookmark row", e);
              setCurrentRow(0);
            }
          } else {
            // If just opening a page (not bookmark), maybe from last session?
            // But this block is for when 'page' param is provided.
            // If 'page' param is provided, it might be from a deep link or navigation.
            // If it's from "Last Read", the caller should pass the row?
            // Or we can load lastRead here if no bookmarkId?

            // Let's assume if no bookmarkId, we default to 0, UNLESS we are loading the app initial state.
            // But this useEffect runs on mount too if page is provided.

            // If we want to restore last session row, we need to read it.
            // Let's do a quick check for lastRead if no bookmarkId
            try {
              const lastRead = await BookmarkService.getLastRead();
              if (lastRead) {
                // Only restore if the page matches
                if (lastRead.page === parseInt(page as string, 10)) {
                  setCurrentRow(lastRead.row || 0);
                } else {
                  setCurrentRow(0);
                }
              }
            } catch (e) {
              setCurrentRow(0);
            }
          }
        };
        restoreRow();

        // Set initial Surahs
        const surahs = getSurahsOnPage(pageNum);
        const surahNames = surahs.map(s => {
          if (i18n.language === 'sq') return s.albanianName;
          if (i18n.language === 'tr') return s.turkishName;
          return s.englishName;
        });
        setCurrentSurahs(surahNames);
        updateSessionProgress(pageNum);

        // Small delay to ensure FlatList is ready
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: pageIndex, animated: false });
        }, 100);
      }
    } else {
      // Default to page 1
      // Try to load last session if no page param
      const loadLastSession = async () => {
        try {
          const lastRead = await BookmarkService.getLastRead();
          if (lastRead) {
            if (lastRead.page && lastRead.page > 0) {
              if (lastRead.page === 1) {
                setCurrentRow(lastRead.row || 0);
              }
            }
          }
        } catch (e) {
          console.error("Error loading last session", e);
        }
      };
      loadLastSession();

      const surahs = getSurahsOnPage(1);
      const surahNames = surahs.map(s => {
        if (i18n.language === 'sq') return s.albanianName;
        if (i18n.language === 'tr') return s.turkishName;
        return s.englishName;
      });
      setCurrentSurahs(surahNames);
      updateSessionProgress(1);
    }
  }, [page, updateSessionProgress]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const pageIndex = viewableItems[0].index || 0;
      setCurrentPage(pageIndex);

      // Update current Surahs based on page number (convert index to page number)
      const pageNumber = pageIndex + 1;
      const surahs = getSurahsOnPage(pageNumber);
      const surahNames = surahs.map(s => {
        if (i18n.language === 'sq') return s.albanianName;
        if (i18n.language === 'tr') return s.turkishName;
        return s.englishName;
      });
      setCurrentSurahs(surahNames);
      updateSessionProgress(pageNumber);
    }
  }, [updateSessionProgress]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // RTL: Going to next page means increasing index (swipe left)
  const goToNextPage = () => {
    if (currentPage < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentPage + 1, animated: true });
    }
  };

  // RTL: Going to previous page means decreasing index (swipe right)
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      flatListRef.current?.scrollToIndex({ index: currentPage - 1, animated: true });
    }
  };

  const renderPage = useCallback(({ item, index }: { item: typeof PAGES[0]; index: number }) => {
    return (
      <PageItem
        item={item}
        index={index}
        isLandscape={isLandscape}
        screenWidth={screenWidth}
        contentWidth={contentWidth}
        rowHighlighterEnabled={rowHighlighterEnabled}
        currentRow={currentRow}
        isDarkMode={isDarkMode}
        useLocalImages={useLocalImages}
        quality={quality}
      />
    );
  }, [screenWidth, contentWidth, isLandscape, rowHighlighterEnabled, currentRow, isDarkMode, useLocalImages]);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#fefce5' }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? theme.background : 'transparent'}
        translucent={true}
      />

      {/* Always visible top toolbar */}
      <SafeAreaView style={[styles.topControls, { backgroundColor: isDarkMode ? theme.background : '#fefce5' }]} edges={['top', 'left', 'right']}>
        {/* Left: Home Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.homeButton}>
          <Ionicons name="home" size={24} color={'#43a746'} />
        </TouchableOpacity>

        {/* Center: Page Indicator with Navigation Arrows */}
        <View style={[styles.centerContainer, { paddingTop: insets.top + 8 }]}>
          {/* Left Navigation Arrow (Next Page in RTL/Reading Flow) */}
          <TouchableOpacity
            onPress={goToNextPage}
            style={styles.centerNavButton}
            disabled={currentPage === PAGES.length - 1}
          >
            <Ionicons
              name="chevron-back"
              size={32}
              color={'#43a746'}
            />
          </TouchableOpacity>

          {/* Center Content */}
          <View style={styles.pageIndicatorContainer} pointerEvents="none">
            {currentSurahs.length > 0 && (
              <Text style={[styles.surahIndicator, { color: theme.text }]}>
                {currentSurahs.join(', ')}
              </Text>
            )}
            <View style={styles.pageIndicatorRow}>
              <Text style={[styles.pageIndicator, { color: theme.secondaryText }]}>
                {t('page')}: {currentPage + 1}
              </Text>
              <View style={{ width: 1, height: 12, backgroundColor: theme.border, marginHorizontal: 4 }} />
              <Text style={[styles.pageIndicator, { color: theme.secondaryText }]}>
                {t('juz')}: {getJuzNumber(currentPage + 1)}
              </Text>
            </View>
            {(limits.startPage || limits.startJuz) && (() => {
              const currentJuz = getJuzNumber(currentPage + 1);
              const isWithinPage = limits.startPage ? (currentPage + 1 >= limits.startPage && currentPage + 1 <= limits.endPage!) : true;
              const isWithinJuz = limits.startJuz ? (currentJuz >= limits.startJuz && currentJuz <= limits.endJuz!) : true;

              const isWithin = isWithinPage && isWithinJuz;
              const statusColor = isWithin ? theme.primary : '#FF5252';
              const label = limits.startPage
                ? `${t('page')} ${limits.startPage}-${limits.endPage}`
                : `${t('juz')} ${limits.startJuz}-${limits.endJuz}`;

              return (
                <View style={{ marginTop: 2, alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, color: statusColor, fontWeight: '700' }}>
                    {t('target')}: {label}
                  </Text>
                </View>
              );
            })()}
          </View>

          {/* Right Navigation Arrow (Previous Page in RTL/Reading Flow) */}
          <TouchableOpacity
            onPress={goToPreviousPage}
            style={styles.centerNavButton}
            disabled={currentPage === 0}
          >
            <Ionicons
              name="chevron-forward"
              size={32}
              color={'#43a746'}
            />
          </TouchableOpacity>
        </View>
        {SAJDAH_PAGES.includes(currentPage + 1) && (
          <View style={styles.sajdahBadge}>
            <Image
              source={require('@/assets/images/secde.png')}
              style={styles.sajdahIcon}
              contentFit="contain"
            />
          </View>
        )}
      </SafeAreaView>

      <SafeAreaView
        style={[styles.contentContainer, { backgroundColor: isDarkMode ? theme.background : '#fefce5' }]}
        edges={['bottom', 'left', 'right']}
      >
        <View
          style={{ flex: 1, width: '100%' }}
          onLayout={(e) => {
            const width = e.nativeEvent.layout.width;
            if (width > 0 && width !== contentWidth) {
              setContentWidth(width);
            }
          }}
        >
          <GestureDetector gesture={panGesture}>
            <FlatList
              key={`flatlist-${contentWidth}`}
              ref={flatListRef}
              data={PAGES}
              extraData={{ currentRow, rowHighlighterEnabled, isLandscape, contentWidth }}
              renderItem={renderPage}
              horizontal
              inverted
              pagingEnabled={!rowHighlighterEnabled}
              scrollEnabled={!rowHighlighterEnabled}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.name}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              getItemLayout={(data, index) => ({
                length: contentWidth,
                offset: contentWidth * index,
                index,
              })}
              initialScrollIndex={page ? Math.max(0, parseInt(page as string, 10) - 1) : 0}
              maxToRenderPerBatch={3}
              windowSize={5}
              removeClippedSubviews={Platform.OS === 'android'}
              initialNumToRender={2}
              snapToInterval={contentWidth}
              snapToAlignment="start"
              decelerationRate="fast"
              disableIntervalMomentum={true}
            />
          </GestureDetector>
        </View>
      </SafeAreaView>

      <DownloadModal
        visible={showDownloadModal}
        onSuccess={async () => {
          setShowDownloadModal(false);
          const isDownloaded = await DownloadService.isDownloaded();
          setUseLocalImages(isDownloaded);
          const q = await DownloadService.getQuality();
          setQuality(q);
        }}
        onCancel={() => setShowDownloadModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefce5',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#fefce5',
  },
  navButtonTop: {
    paddingHorizontal: 8,
  },
  homeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Ensure clickable above absolute center
  },
  centerContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 0,
    // Padding top handled dynamically via insets
    paddingBottom: 12, // Match topControls padding
    paddingHorizontal: 50, // Avoid home button
  },
  centerNavButton: {
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  pageIndicatorContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  pageIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  surahIndicator: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  pageIndicator: {
    color: '#000',
    fontSize: 14,
    opacity: 0.8,
  },
  sajdahBadge: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sajdahIcon: {
    width: 48,
    height: 48,
  },
  sajdahText: {
    color: '#ffa200',
    fontSize: 13,
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fefce5',
  },
  pageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageScrollView: {
    flex: 1,
    width: '100%',
  },
  pageImage: {
    width: '100%',
    height: '100%',
  },
  landscapeImage: {
    width: '100%',
    aspectRatio: 0.7, // Quran page aspect ratio (width/height)
  },
  highlightOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 255, 0, 0.15)',
    zIndex: 10,
    borderRadius: 4, // Optional: adds a bit of roundness
  },
});
