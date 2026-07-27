import { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
  Modal,
  FlatList,
  TextInput,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { useReadingSession } from '../../hooks/useReadingSession';
import { bookmarkService, Bookmark } from '../../services/bookmarkService';
import { highlightService, Highlight } from '../../services/highlightService';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { Ionicons } from '@expo/vector-icons';

// ─── Types ────────────────────────────────────────────────────────────────────

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type ReadingScreenProps = NativeStackScreenProps<RootStackParamList, 'ReadingScreen'>;

interface TocItem {
  id?: string;
  href: string;
  label: string;
  subitems?: TocItem[];
}

interface EpubMessage {
  type: 'PAGE_CHANGED' | 'READY' | 'ERROR' | 'TOTAL_PAGES' | 'TOC' | 'TEXT_SELECTED';
  page?: number;
  cfi?: string;
  percent?: number;
  totalPages?: number;
  error?: string;
  toc?: TocItem[];
  chapterTitle?: string;
  chapterCurrentPage?: number;
  chapterTotalPages?: number;
  text?: string;
}

// ─── JavaScript injected into the WebView ────────────────────────────────────
// This script:
//  1. Initialises epubjs with the local EPUB file.
//  2. Listens for epubjs "relocated" events to detect page changes.
//  3. Sends structured messages back to React Native.
//  4. Exposes prevPage() / nextPage() helpers that React Native can call via
//     injectJavaScript.

const EPUB_JS_BRIDGE = `
(function () {
  'use strict';

  var MAX_READY_RETRIES = 30;
  var readyRetries = 0;

  function sendMessage(obj) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(obj));
    }
  }

  function base64ToArrayBuffer(b64) {
    var binaryString = window.atob(b64);
    var len = binaryString.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function initBook() {
    if (typeof ePub === 'undefined') {
      if (++readyRetries < MAX_READY_RETRIES) {
        setTimeout(initBook, 300);
      } else {
        sendMessage({ type: 'ERROR', error: 'epubjs failed to load after retries' });
      }
      return;
    }

    var epubB64 = window.__BUKOO_EPUB_B64__;
    if (!epubB64) {
      sendMessage({ type: 'ERROR', error: 'No EPUB data provided' });
      return;
    }

    try {
      var arrayBuffer = base64ToArrayBuffer(epubB64);
      var book = ePub(arrayBuffer);
      var rendition = book.renderTo('viewer', {
        width: '100%',
        height: '100%',
        spread: 'none',
        flow: 'paginated',
      });

      rendition.display();

      book.ready.then(function () {
        return book.locations.generate(1024);
      }).then(function () {
        var total = book.spine.items ? book.spine.items.length : 0;
        sendMessage({ type: 'TOTAL_PAGES', totalPages: total });
        sendMessage({ type: 'READY' });
      }).catch(function (err) {
        sendMessage({ type: 'ERROR', error: String(err) });
      });

      book.loaded.navigation.then(function (nav) {
        sendMessage({ type: 'TOC', toc: nav.toc });
      });

      rendition.on('relocated', function (location) {
        try {
          var start  = location.start;
          var cfi    = start.cfi || '';
          var page   = (start.displayed && start.displayed.page)
                         ? start.displayed.page
                         : 0;
          var total  = (start.displayed && start.displayed.total)
                         ? start.displayed.total
                         : 1;
          var pct    = book.locations.percentageFromCfi(cfi);
          var percent = typeof pct === 'number' ? Math.round(pct * 100) : 0;

          var chapterTitle = '';
          var navItem = book.navigation.get(start.href);
          if (navItem && navItem.label) {
            chapterTitle = navItem.label.trim();
          }

          sendMessage({
            type: 'PAGE_CHANGED',
            page: page,
            cfi: cfi,
            percent: percent,
            chapterTitle: chapterTitle,
            chapterCurrentPage: page,
            chapterTotalPages: total,
          });
        } catch (e) {
          console.error('[Bridge] Error in relocated handler:', e);
        }
      });

      // Expose controls to React Native safely
      window.__bukooNext = function () { if (rendition && typeof rendition.next === 'function') rendition.next(); };
      window.__bukooPrev = function () { if (rendition && typeof rendition.prev === 'function') rendition.prev(); };
      window.__bukooDisplay = function (target) { if (rendition && typeof rendition.display === 'function') rendition.display(target); };
      window.__bukooSetTheme = function (themeObj) {
        if (rendition && rendition.themes && typeof rendition.themes.default === 'function') {
          rendition.themes.default(themeObj);
        }
      };
      window.__bukooApplyHighlights = function (highlights) {
        if (!highlights || !Array.isArray(highlights)) return;
        highlights.forEach(function (h) {
          try {
            rendition.annotations.highlight(h.cfiRange, {}, function () {}, 'bukoo-highlight', {
              fill: h.color || 'yellow',
              'fill-opacity': '0.3',
            });
          } catch (e) {}
        });
      };
    } catch (err) {
      sendMessage({ type: 'ERROR', error: 'Failed to init ePub: ' + String(err) });
    }
  }

  document.addEventListener('DOMContentLoaded', initBook);
  // Fallback in case DOMContentLoaded already fired
  if (document.readyState !== 'loading') {
    initBook();
  }
})();
true; // required for injected scripts on Android
`;

// HTML shell with epubjs bundled inline (no CDN dependency).
// The EPUB is passed as raw base64 and parsed in-memory as ArrayBuffer to bypass Android WebView file/XHR restrictions.
function buildEpubHtml(epubBase64: string, epubJsContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>BUKOO Reader</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet">
  <script>
    // Redirect console logs to React Native
    (function() {
      var send = function(type, data) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, data: data }));
        }
      };
      console.log = function() { send('CONSOLE_LOG', Array.prototype.slice.call(arguments).join(' ')); };
      console.warn = function() { send('CONSOLE_WARN', Array.prototype.slice.call(arguments).join(' ')); };
      console.error = function() { send('CONSOLE_ERROR', Array.prototype.slice.call(arguments).join(' ')); };
      window.addEventListener('error', function(e) {
        send('CONSOLE_ERROR', 'WINDOW ERROR: ' + e.message + ' at ' + e.filename + ':' + e.lineno);
      });
    })();
  </script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #F4F1E8; }
    #viewer { width: 100%; height: 100%; }
  </style>
  <script>
    window.__BUKOO_EPUB_B64__ = ${JSON.stringify(epubBase64)};
  </script>
  <script>${epubJsContent}</script>
</head>
<body>
  <div id="viewer"></div>
  <script>
    ${EPUB_JS_BRIDGE}
  </script>
</body>
</html>`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatReadingTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}j ${m}m`;
  if (m > 0) return `${m}m ${s}d`;
  return `${s}d`;
}

// ─── Theme Colors Map ─────────────────────────────────────────────────────────

const themeColors = {
  Light: {
    bg: '#FFFFFF',
    bgHeader: '#F7F7F7',
    text: '#000000',
    border: '#E2E8F0',
    statusBarStyle: 'dark-content' as const,
  },
  Cream: {
    bg: '#F4F1E8',
    bgHeader: '#EFECE2',
    text: '#1B3A2D',
    border: '#E0DACB',
    statusBarStyle: 'dark-content' as const,
  },
  Dark: {
    bg: '#1A1A1A',
    bgHeader: '#242424',
    text: '#CCCCCC',
    border: '#2A2A2A',
    statusBarStyle: 'light-content' as const,
  },
  Sepia: {
    bg: '#F5E6C8',
    bgHeader: '#EDE0C0',
    text: '#5B4636',
    border: '#E8D5B3',
    statusBarStyle: 'dark-content' as const,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReadingScreen({ navigation, route }: ReadingScreenProps) {
  const { bookId, title, localEpubUri } = route.params;

  const { currentPage, progressPercent, readingTimeSeconds, updateProgress } =
    useReadingSession(bookId);

  const webViewRef = useRef<any>(null);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const controlsHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [controlsVisible, setControlsVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // ── Advanced Features State ───────────────────────────────────────────────
  
  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [showHighlightModal, setShowHighlightModal] = useState(false);

  const [toc, setToc] = useState<TocItem[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  
  const [currentCfi, setCurrentCfi] = useState<string>('');
  const [chapterTitle, setChapterTitle] = useState<string>('');
  const [chapterCurrentPage, setChapterCurrentPage] = useState<number>(0);
  const [chapterTotalPages, setChapterTotalPages] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [selectedText, setSelectedText] = useState('');
  const [selectedCfiRange, setSelectedCfiRange] = useState('');
  const [highlightNote, setHighlightNote] = useState('');
  const [highlightColor, setHighlightColor] = useState('rgba(250,204,21,0.4)'); // Default Yellow

  const [theme, setTheme] = useState<'Light' | 'Cream' | 'Dark' | 'Sepia'>('Cream');
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<string>('DM Sans');
  const [epubJsContent, setEpubJsContent] = useState<string>('');
  const [epubBase64, setEpubBase64] = useState<string>('');

  const loadHighlights = useCallback(async () => {
    const hls = await highlightService.getHighlights(bookId);
    setHighlights(hls);
  }, [bookId]);

  const handleSaveHighlight = async () => {
    if (!selectedCfiRange || !selectedText) return;
    await highlightService.addHighlight(
      bookId,
      selectedCfiRange,
      selectedText,
      highlightColor,
      highlightNote
    );
    setShowHighlightModal(false);
    setSelectedText('');
    setSelectedCfiRange('');
    setHighlightNote('');
    loadHighlights();
  };

  const handleDeleteHighlight = async (id: number) => {
    await highlightService.removeHighlight(id);
    loadHighlights();
  };

  // Load the bundled epubjs asset on mount (avoids CDN/CORS issues)
  useEffect(() => {
    let isMounted = true;
    const loadEpubJs = async () => {
      try {
        const asset = Asset.fromModule(require('../../assets/epub.min.txt'));
        await asset.downloadAsync();
        if (asset.localUri) {
          const content = await FileSystem.readAsStringAsync(asset.localUri);
          if (isMounted) setEpubJsContent(content);
        }
      } catch (e) {
        console.error('[ReadingScreen] Failed to load epubjs asset:', e);
      }
    };
    loadEpubJs();
    return () => { isMounted = false; };
  }, []);

  // Load the EPUB file as base64 so it can be passed to the WebView as a data URI.
  // On Android, file:// URIs to app-private storage are blocked by the WebView sandbox.
  useEffect(() => {
    let isMounted = true;
    const loadEpubBase64 = async () => {
      if (!localEpubUri) return;
      try {
        const b64 = await FileSystem.readAsStringAsync(localEpubUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        if (isMounted) setEpubBase64(b64);
      } catch (e) {
        console.error('[ReadingScreen] Failed to read EPUB as base64:', e);
      }
    };
    loadEpubBase64();
    return () => { isMounted = false; };
  }, [localEpubUri]);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('reader_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.theme) setTheme(parsed.theme);
          if (parsed.fontSize) setFontSize(parsed.fontSize);
          if (parsed.fontFamily) setFontFamily(parsed.fontFamily);
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    };
    loadPreferences();
  }, []);

  const loadBookmarks = useCallback(async () => {
    const bms = await bookmarkService.getBookmarks(bookId);
    setBookmarks(bms);
  }, [bookId]);

  useEffect(() => {
    loadBookmarks();
    loadHighlights();
  }, [loadBookmarks, loadHighlights]);

  useEffect(() => {
    if (isReady && webViewRef.current) {
      const js = `if (window.__bukooApplyHighlights) window.__bukooApplyHighlights(${JSON.stringify(highlights)}); true;`;
      webViewRef.current.injectJavaScript(js);
    }
  }, [highlights, isReady]);

  useEffect(() => {
    if (isReady && webViewRef.current) {
      const themes = {
        Light: { body: { background: '#FFFFFF', color: '#000000', 'font-size': `${fontSize}px`, 'font-family': fontFamily } },
        Cream: { body: { background: '#F4F1E8', color: '#1B3A2D', 'font-size': `${fontSize}px`, 'font-family': fontFamily } },
        Dark: { body: { background: '#1A1A1A', color: '#CCCCCC', 'font-size': `${fontSize}px`, 'font-family': fontFamily } },
        Sepia: { body: { background: '#F5E6C8', color: '#5B4636', 'font-size': `${fontSize}px`, 'font-family': fontFamily } },
      };
      
      const themeObj = themes[theme];
      const js = `if (window.__bukooSetTheme) window.__bukooSetTheme(${JSON.stringify(themeObj)}); true;`;
      webViewRef.current.injectJavaScript(js);
      
      AsyncStorage.setItem('reader_settings', JSON.stringify({ theme, fontSize, fontFamily })).catch(console.error);
    }
  }, [theme, fontSize, fontFamily, isReady]);

  const toggleBookmark = async () => {
    if (!currentCfi) return;
    const isBookmarked = await bookmarkService.isBookmarked(bookId, currentCfi);
    if (isBookmarked) {
      await bookmarkService.removeBookmark(bookId, currentCfi);
    } else {
      await bookmarkService.addBookmark(bookId, currentCfi, chapterTitle || 'Unknown Chapter');
    }
    loadBookmarks();
  };

  const jumpToLocation = (target: string) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`if (window.__bukooDisplay) window.__bukooDisplay('${target}'); true;`);
    }
    setShowToc(false);
    setShowBookmarks(false);
    setShowHighlights(false);
  };

  // ── Auto-hide controls after 3 seconds of inactivity ─────────────────────

  const scheduleHideControls = useCallback(() => {
    if (controlsHideTimer.current) clearTimeout(controlsHideTimer.current);
    controlsHideTimer.current = setTimeout(() => {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => setControlsVisible(false));
    }, 3000);
  }, [controlsOpacity]);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    scheduleHideControls();
  }, [controlsOpacity, scheduleHideControls]);

  useEffect(() => {
    scheduleHideControls();
    return () => {
      if (controlsHideTimer.current) clearTimeout(controlsHideTimer.current);
    };
  }, [scheduleHideControls]);

  // ── WebView message handler ───────────────────────────────────────────────

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg: EpubMessage = JSON.parse(event.nativeEvent.data);
        switch (msg.type) {
          case 'READY':
            setIsReady(true);
            break;
          case 'TOTAL_PAGES':
            if (msg.totalPages !== undefined) setTotalPages(msg.totalPages);
            break;
          case 'TOC':
            if (msg.toc) setToc(msg.toc);
            break;
          case 'PAGE_CHANGED':
            if (msg.page !== undefined && msg.cfi !== undefined) {
              setCurrentCfi(msg.cfi);
              if (msg.chapterTitle) setChapterTitle(msg.chapterTitle);
              if (msg.chapterCurrentPage !== undefined) setChapterCurrentPage(msg.chapterCurrentPage);
              if (msg.chapterTotalPages !== undefined) setChapterTotalPages(msg.chapterTotalPages);
              updateProgress(msg.page, msg.cfi, msg.percent);
            }
            break;
          case 'TEXT_SELECTED':
            if (msg.text && msg.cfi) {
              setSelectedText(msg.text);
              setSelectedCfiRange(msg.cfi);
              setHighlightNote('');
              setHighlightColor('rgba(250,204,21,0.4)');
              setShowHighlightModal(true);
            }
            break;
          case 'ERROR':
            console.warn('[ReadingScreen] epubjs error:', msg.error);
            break;
          case 'CONSOLE_LOG' as any:
            console.log('[WebView LOG]', (msg as any).data);
            break;
          case 'CONSOLE_WARN' as any:
            console.warn('[WebView WARN]', (msg as any).data);
            break;
          case 'CONSOLE_ERROR' as any:
            console.error('[WebView ERROR]', (msg as any).data);
            break;
          default:
            break;
        }
      } catch (e) {
        console.warn('[ReadingScreen] Failed to parse WebView message:', e);
      }
    },
    [updateProgress]
  );

  // ── Tap-zone handlers ─────────────────────────────────────────────────────

  const handleLeftTap = useCallback(() => {
    webViewRef.current?.injectJavaScript('window.__bukooPrev && window.__bukooPrev(); true;');
    showControls();
  }, [showControls]);

  const handleRightTap = useCallback(() => {
    webViewRef.current?.injectJavaScript('window.__bukooNext && window.__bukooNext(); true;');
    showControls();
  }, [showControls]);

  const handleCenterTap = useCallback(() => {
    if (controlsVisible) {
      // Already visible — hide immediately
      if (controlsHideTimer.current) clearTimeout(controlsHideTimer.current);
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setControlsVisible(false));
    } else {
      showControls();
    }
  }, [controlsVisible, controlsOpacity, showControls]);

  // Only build HTML once both epubjs library and EPUB base64 data are loaded
  const epubHtml = (epubJsContent && epubBase64) ? buildEpubHtml(epubBase64, epubJsContent) : '';
  const WebViewComponent = WebView as any;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors[theme].bg }]} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={themeColors[theme].statusBarStyle}
        backgroundColor={themeColors[theme].bgHeader}
        translucent={false}
      />

      {/* ── Progress bar (always visible, 2px) ── */}
      <View style={[styles.progressBarTrack, { backgroundColor: themeColors[theme].border }]}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* ── Header (animated show/hide) ── */}
      {controlsVisible && (
        <Animated.View style={[styles.header, { opacity: controlsOpacity, backgroundColor: themeColors[theme].bgHeader, borderBottomColor: themeColors[theme].border }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Kembali"
          >
            <Ionicons name="chevron-back" size={28} color={themeColors[theme].text} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: themeColors[theme].text, fontFamily: FONTS.sansBold }]} numberOfLines={1}>
              {chapterTitle || title}
            </Text>
            <View style={styles.headerMeta}>
              <Text style={[styles.headerSubtitle, { color: themeColors[theme].text + '99', fontFamily: FONTS.sansRegular }]} numberOfLines={1}>
                {isReady && chapterTotalPages > 0 
                  ? `${chapterTotalPages - chapterCurrentPage} hal. tersisa` 
                  : '…'}
              </Text>
              <Text style={[styles.headerMetaDivider, { color: themeColors[theme].text + '77' }]}>·</Text>
              <Text style={[styles.headerSubtitle, { color: themeColors[theme].text + '99', fontFamily: FONTS.sansRegular }]} numberOfLines={1}>
                {formatReadingTime(readingTimeSeconds)}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.headerAction} onPress={toggleBookmark}>
            <Ionicons 
              name={bookmarks.some(b => b.cfi === currentCfi) ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={bookmarks.some(b => b.cfi === currentCfi) ? COLORS.ember : themeColors[theme].text} 
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── WebView ── */}
      <View style={styles.webViewContainer}>
        {!epubHtml ? (
          <View style={styles.loaderContainer}>
            <Text style={styles.loaderText}>
              {!epubJsContent ? 'Memuat pembaca buku…' : 'Memuat berkas buku…'}
            </Text>
          </View>
        ) : (
          <WebViewComponent
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: epubHtml, baseUrl: 'about:blank' }}
            onMessage={handleMessage}
            javaScriptEnabled
            domStorageEnabled
            allowFileAccess
            allowUniversalAccessFromFileURLs
            mixedContentMode="always"
            style={styles.webView}
            // Allow the WebView to load the local EPUB file on Android
            allowFileAccessFromFileURLs={Platform.OS === 'android'}
            onError={(e: { nativeEvent: { description: string } }) =>
              console.error('[ReadingScreen] WebView error:', e.nativeEvent.description)
            }
          />
        )}

        {/* ── Tap zones (invisible overlays) ── */}
        <View style={styles.tapZoneRow} pointerEvents="box-none">
          {/* Left 30% — previous page */}
          <TouchableOpacity
            style={styles.tapLeft}
            activeOpacity={1}
            onPress={handleLeftTap}
            accessibilityLabel="Halaman sebelumnya"
          />

          {/* Center 40% — toggle controls */}
          <TouchableOpacity
            style={styles.tapCenter}
            activeOpacity={1}
            onPress={handleCenterTap}
            accessibilityLabel="Tampilkan / sembunyikan kontrol"
          />

          {/* Right 30% — next page */}
          <TouchableOpacity
            style={styles.tapRight}
            activeOpacity={1}
            onPress={handleRightTap}
            accessibilityLabel="Halaman berikutnya"
          />
        </View>
      </View>

      {/* ── Bottom bar (animated show/hide) ── */}
      {controlsVisible && (
        <Animated.View style={[styles.bottomBar, { opacity: controlsOpacity, backgroundColor: themeColors[theme].bgHeader, borderTopColor: themeColors[theme].border }]}>
          <TouchableOpacity style={styles.navIconButton} onPress={() => setShowToc(true)} accessibilityLabel="Daftar Isi">
            <Ionicons name="menu-outline" size={26} color={themeColors[theme].text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navIconButton} onPress={() => setShowSettings(true)} accessibilityLabel="Pengaturan Tampilan">
            <Text style={[styles.navIconText, { color: themeColors[theme].text, fontFamily: FONTS.sansMedium, fontSize: 20 }]}>Aa</Text>
          </TouchableOpacity>

          <View style={styles.pageCounter}>
            <Text style={[styles.pageCounterText, { color: themeColors[theme].text + 'AA', fontFamily: FONTS.sansMedium }]}>
              {currentPage} dari {totalPages > 0 ? totalPages : '...'}
            </Text>
          </View>

          <TouchableOpacity style={styles.navIconButton} onPress={() => setShowBookmarks(true)} accessibilityLabel="Bookmark">
            <Ionicons name="bookmark-outline" size={22} color={themeColors[theme].text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navIconButton} onPress={() => setShowHighlights(true)} accessibilityLabel="Sorotan & Catatan">
            <Ionicons name="create-outline" size={22} color={themeColors[theme].text} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── Modals ── */}
      
      {/* TOC Modal */}
      <Modal visible={showToc} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors[theme].bgHeader, borderTopColor: themeColors[theme].border, borderTopWidth: 1 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors[theme].text, fontFamily: FONTS.sansBold }]}>Daftar Isi</Text>
              <TouchableOpacity onPress={() => setShowToc(false)}>
                <Text style={[styles.modalClose, { color: COLORS.ember, fontFamily: FONTS.sansMedium }]}>Tutup</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={toc}
              keyExtractor={(item, index) => item.id || String(index)}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.tocItem, { borderBottomColor: themeColors[theme].border }]} onPress={() => jumpToLocation(item.href)}>
                  <Text style={[styles.tocItemText, { color: themeColors[theme].text, fontFamily: FONTS.sansRegular }]}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors[theme].bgHeader, borderTopColor: themeColors[theme].border, borderTopWidth: 1 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors[theme].text, fontFamily: FONTS.sansBold }]}>Tampilan</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Text style={[styles.modalClose, { color: COLORS.ember, fontFamily: FONTS.sansMedium }]}>Tutup</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.settingsLabel, { color: themeColors[theme].text, fontFamily: FONTS.sansMedium }]}>Tema</Text>
            <View style={styles.themeRow}>
              {(['Light', 'Cream', 'Dark', 'Sepia'] as const).map(t => {
                const themeStyles = {
                  Light: { backgroundColor: '#FFFFFF', borderColor: '#DDDDDD' },
                  Cream: { backgroundColor: '#F4F1E8', borderColor: 'transparent' },
                  Dark: { backgroundColor: '#1A1A1A', borderColor: 'transparent' },
                  Sepia: { backgroundColor: '#F5E6C8', borderColor: 'transparent' }
                };
                return (
                  <TouchableOpacity 
                    key={t} 
                    style={[
                      styles.themeCircle, 
                      themeStyles[t], 
                      theme === t && styles.themeActive
                    ]}
                    onPress={() => setTheme(t)}
                  />
                );
              })}
            </View>

            <Text style={[styles.settingsLabel, { color: themeColors[theme].text, fontFamily: FONTS.sansMedium }]}>Ukuran Font</Text>
            <View style={styles.fontRow}>
              <TouchableOpacity 
                style={[styles.fontButton, { backgroundColor: theme === 'Dark' ? 'rgba(255,255,255,0.08)' : 'rgba(27, 58, 45, 0.08)' }]} 
                onPress={() => setFontSize(Math.max(14, fontSize - 2))}
              >
                <Text style={[styles.fontButtonText, { color: themeColors[theme].text }]}>A-</Text>
              </TouchableOpacity>
              <Text style={[styles.fontSizeText, { color: themeColors[theme].text }]}>{fontSize}</Text>
              <TouchableOpacity 
                style={[styles.fontButton, { backgroundColor: theme === 'Dark' ? 'rgba(255,255,255,0.08)' : 'rgba(27, 58, 45, 0.08)' }]} 
                onPress={() => setFontSize(Math.min(28, fontSize + 2))}
              >
                <Text style={[styles.fontButtonText, { color: themeColors[theme].text }]}>A+</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.settingsLabel, { color: themeColors[theme].text, fontFamily: FONTS.sansMedium }]}>Jenis Font</Text>
            <View style={styles.fontFamilyRow}>
              {['DM Sans', 'Playfair Display', 'Georgia', 'Palatino'].map(f => (
                <TouchableOpacity 
                  key={f} 
                  style={[
                    styles.fontFamilyButton, 
                    { borderColor: themeColors[theme].border },
                    fontFamily === f && styles.fontFamilyButtonActive
                  ]} 
                  onPress={() => setFontFamily(f)}
                >
                  <Text style={[
                    styles.fontFamilyText, 
                    { color: themeColors[theme].text },
                    fontFamily === f && styles.fontFamilyTextActive
                  ]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Bookmarks Modal */}
      <Modal visible={showBookmarks} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors[theme].bgHeader, borderTopColor: themeColors[theme].border, borderTopWidth: 1 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors[theme].text, fontFamily: FONTS.sansBold }]}>Markah Buku</Text>
              <TouchableOpacity onPress={() => setShowBookmarks(false)}>
                <Text style={[styles.modalClose, { color: COLORS.ember, fontFamily: FONTS.sansMedium }]}>Tutup</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={bookmarks}
              keyExtractor={(item) => String(item.id)}
              ListEmptyComponent={<Text style={[styles.emptyText, { color: themeColors[theme].text + '99', fontFamily: FONTS.sansRegular }]}>Belum ada markah buku.</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.tocItem, { borderBottomColor: themeColors[theme].border }]} onPress={() => jumpToLocation(item.cfi)}>
                  <Text style={[styles.tocItemText, { color: themeColors[theme].text, fontFamily: FONTS.sansRegular }]}>{item.chapterTitle}</Text>
                  <Text style={[styles.bookmarkDateText, { color: themeColors[theme].text + '88', fontFamily: FONTS.sansRegular }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Highlight/Note Creation Modal */}
      <Modal visible={showHighlightModal} animationType="fade" transparent={true}>
        <View style={[styles.modalOverlay, { justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <View style={[styles.modalContent, { borderRadius: 16, marginHorizontal: 20, backgroundColor: themeColors[theme].bgHeader, borderTopLeftRadius: 16, borderTopRightRadius: 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors[theme].text, fontFamily: FONTS.sansBold }]}>Tambah Sorotan</Text>
              <TouchableOpacity onPress={() => { setShowHighlightModal(false); setSelectedText(''); }}>
                <Text style={[styles.modalClose, { color: COLORS.ember, fontFamily: FONTS.sansMedium }]}>Batal</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ width: '100%', maxHeight: 300 }} keyboardShouldPersistTaps="handled">
              <Text style={[styles.selectedSnippet, { color: themeColors[theme].text, backgroundColor: themeColors[theme].bg, borderLeftColor: COLORS.ember, fontFamily: FONTS.serifBold || 'serif' }]}>"{selectedText}"</Text>
              
              <Text style={[styles.settingsLabel, { color: themeColors[theme].text, fontFamily: FONTS.sansMedium }]}>Warna Sorotan</Text>
              <View style={[styles.themeRow, { justifyContent: 'flex-start', marginVertical: 8 }]}>
                {[
                  { name: 'Kuning', color: 'rgba(250,204,21,0.4)', bg: '#facc15' },
                  { name: 'Hijau', color: 'rgba(74,222,128,0.4)', bg: '#4ade80' },
                  { name: 'Biru', color: 'rgba(96,165,250,0.4)', bg: '#60a5fa' },
                  { name: 'Merah Muda', color: 'rgba(244,114,182,0.4)', bg: '#f472b6' }
                ].map(c => (
                  <TouchableOpacity
                    key={c.name}
                    style={[
                      styles.themeCircle,
                      { backgroundColor: c.bg, marginRight: 15 },
                      highlightColor === c.color && { borderColor: COLORS.ember, borderWidth: 3 }
                    ]}
                    onPress={() => setHighlightColor(c.color)}
                  />
                ))}
              </View>

              <Text style={[styles.settingsLabel, { color: themeColors[theme].text, fontFamily: FONTS.sansMedium }]}>Catatan Margin (Opsional)</Text>
              <TextInput
                style={[styles.noteInput, { color: themeColors[theme].text, backgroundColor: themeColors[theme].bg, borderColor: themeColors[theme].border, fontFamily: FONTS.sansRegular }]}
                placeholder="Tulis catatan Anda di sini..."
                placeholderTextColor={theme === 'Dark' ? '#666666' : COLORS.muted}
                value={highlightNote}
                onChangeText={setHighlightNote}
                multiline
              />
            </ScrollView>

            <TouchableOpacity style={styles.saveHighlightButton} onPress={handleSaveHighlight}>
              <Text style={styles.saveHighlightButtonText}>Simpan Sorotan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Highlights List Modal */}
      <Modal visible={showHighlights} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors[theme].bgHeader, borderTopColor: themeColors[theme].border, borderTopWidth: 1 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors[theme].text, fontFamily: FONTS.sansBold }]}>Sorotan & Catatan</Text>
              <TouchableOpacity onPress={() => setShowHighlights(false)}>
                <Text style={[styles.modalClose, { color: COLORS.ember, fontFamily: FONTS.sansMedium }]}>Tutup</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={highlights}
              keyExtractor={(item) => String(item.id)}
              ListEmptyComponent={<Text style={[styles.emptyText, { color: themeColors[theme].text + '99', fontFamily: FONTS.sansRegular }]}>Belum ada sorotan atau catatan.</Text>}
              renderItem={({ item }) => {
                const colorMap: Record<string, string> = {
                  'rgba(250,204,21,0.4)': '#facc15',
                  'rgba(74,222,128,0.4)': '#4ade80',
                  'rgba(96,165,250,0.4)': '#60a5fa',
                  'rgba(244,114,182,0.4)': '#f472b6'
                };
                const indicatorColor = colorMap[item.color] || '#facc15';
                return (
                  <View style={[styles.highlightListItem, { borderBottomColor: themeColors[theme].border }]}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => jumpToLocation(item.cfiRange)}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <View style={[styles.colorIndicator, { backgroundColor: indicatorColor }]} />
                        <Text style={[styles.highlightListText, { color: themeColors[theme].text, fontFamily: FONTS.sansRegular }]} numberOfLines={2}>
                          "{item.text}"
                        </Text>
                      </View>
                      {item.note ? (
                        <Text style={[styles.highlightListNote, { color: themeColors[theme].text, backgroundColor: themeColors[theme].bg, fontFamily: FONTS.sansRegular }]}>
                          📝 {item.note}
                        </Text>
                      ) : null}
                      <Text style={[styles.bookmarkDateText, { color: themeColors[theme].text + '88', fontFamily: FONTS.sansRegular }]}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteHighlightAction} 
                      onPress={() => handleDeleteHighlight(item.id)}
                    >
                      <Text style={styles.deleteHighlightText}>Hapus</Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Design tokens ────────────────────────────────────────────────────────────



// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  // Progress bar
  progressBarTrack: {
    height: 2,
    width: '100%',
    backgroundColor: COLORS.sand,
  },
  progressBarFill: {
    height: 2,
    backgroundColor: COLORS.ember,
    minWidth: 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.creamLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sand,
  },
  backButton: {
    paddingRight: 12,
    paddingVertical: 4,
  },
  backIcon: {
    fontSize: 28,
    color: COLORS.forest,
    lineHeight: 30,
    fontWeight: '300',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.forest,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerMetaDivider: {
    fontSize: 12,
    color: COLORS.sand,
    marginHorizontal: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
  },
  headerAction: {
    paddingLeft: 12,
    paddingVertical: 4,
  },
  bookmarkIcon: {
    fontSize: 22,
    color: COLORS.muted,
    opacity: 0.5,
  },
  bookmarkIconActive: {
    opacity: 1,
  },

  // WebView
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
  },
  loaderText: {
    color: COLORS.muted,
    fontSize: 15,
  },

  // Tap zones
  tapZoneRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  tapLeft: {
    width: '30%',
    height: '100%',
  },
  tapCenter: {
    width: '40%',
    height: '100%',
  },
  tapRight: {
    width: '30%',
    height: '100%',
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.creamLight,
    borderTopWidth: 1,
    borderTopColor: COLORS.sand,
  },
  navIconButton: {
    padding: 8,
  },
  navIconText: {
    fontSize: 24,
    color: COLORS.forest,
  },
  pageCounter: {
    flex: 1,
    alignItems: 'center',
  },
  pageCounterText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '500',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.creamLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.forest,
  },
  modalClose: {
    fontSize: 16,
    color: COLORS.ember,
    fontWeight: '600',
  },
  tocItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sand,
  },
  tocItemText: {
    fontSize: 16,
    color: COLORS.forest,
  },
  bookmarkDateText: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.muted,
    marginTop: 20,
  },
  
  // Settings specific
  settingsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.muted,
    marginBottom: 10,
    marginTop: 10,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  themeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeActive: {
    borderColor: COLORS.ember,
  },
  fontRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  fontButton: {
    padding: 10,
    backgroundColor: 'rgba(27, 58, 45, 0.08)',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  fontButtonText: {
    fontSize: 18,
    color: COLORS.forest,
  },
  fontSizeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.forest,
  },
  fontFamilyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fontFamilyButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.sand,
  },
  fontFamilyButtonActive: {
    backgroundColor: COLORS.forest,
    borderColor: COLORS.forest,
  },
  fontFamilyText: {
    color: COLORS.forest,
    fontSize: 14,
  },
  fontFamilyTextActive: {
    color: COLORS.creamLight,
  },
  selectedSnippet: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.forest,
    backgroundColor: COLORS.cream,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.ember,
    marginVertical: 10,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: COLORS.sand,
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    color: COLORS.forest,
    backgroundColor: COLORS.creamLight,
    marginTop: 5,
  },
  saveHighlightButton: {
    backgroundColor: COLORS.forest,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    width: '100%',
  },
  saveHighlightButtonText: {
    color: COLORS.creamLight,
    fontWeight: 'bold',
    fontSize: 16,
  },
  highlightListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sand,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  highlightListText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.forest,
    flex: 1,
  },
  highlightListNote: {
    fontSize: 14,
    color: COLORS.forest,
    backgroundColor: COLORS.cream,
    padding: 6,
    borderRadius: 4,
    marginVertical: 4,
  },
  deleteHighlightAction: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(200, 84, 31, 0.1)',
  },
  deleteHighlightText: {
    fontSize: 13,
    color: COLORS.ember,
    fontWeight: '600',
  },
});
