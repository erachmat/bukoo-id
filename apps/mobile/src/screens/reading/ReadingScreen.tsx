import { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
  Modal,
  FlatList
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { useReadingSession } from '../../hooks/useReadingSession';
import { bookmarkService, Bookmark } from '../../services/bookmarkService';

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
  type: 'PAGE_CHANGED' | 'READY' | 'ERROR' | 'TOTAL_PAGES' | 'TOC';
  page?: number;
  cfi?: string;
  percent?: number;
  totalPages?: number;
  error?: string;
  toc?: TocItem[];
  chapterTitle?: string;
  chapterCurrentPage?: number;
  chapterTotalPages?: number;
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

  function initBook() {
    if (typeof ePub === 'undefined') {
      if (++readyRetries < MAX_READY_RETRIES) {
        setTimeout(initBook, 300);
      } else {
        sendMessage({ type: 'ERROR', error: 'epubjs failed to load after retries' });
      }
      return;
    }

    var epubUri = window.__BUKOO_EPUB_URI__;
    if (!epubUri) {
      sendMessage({ type: 'ERROR', error: 'No EPUB URI provided' });
      return;
    }

    var book = ePub(epubUri);
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
        if (navItem) {
          chapterTitle = navItem.label;
        }

        sendMessage({
          type: 'PAGE_CHANGED',
          page: page,
          cfi: cfi,
          percent: percent,
          chapterTitle: chapterTitle,
          chapterCurrentPage: page,
          chapterTotalPages: total
        });
      } catch (e) {
        sendMessage({ type: 'ERROR', error: String(e) });
      }
    });

    // Expose navigation helpers for React Native to call
    window.__bukooPrev = function () { rendition.prev(); };
    window.__bukooNext = function () { rendition.next(); };
    window.__bukooDisplay = function (target) { rendition.display(target); };
    window.__bukooSetTheme = function (themeObj) { 
      rendition.themes.default(themeObj);
    };

    window.__bukooBook = book;
    window.__bukooRendition = rendition;
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
// epubJsContent is loaded from the local bundled asset at runtime.
function buildEpubHtml(epubUri: string, epubJsContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>BUKOO Reader</title>
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
    window.__BUKOO_EPUB_URI__ = ${JSON.stringify(epubUri)};
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

  const [toc, setToc] = useState<TocItem[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [currentCfi, setCurrentCfi] = useState<string>('');
  const [chapterTitle, setChapterTitle] = useState<string>('');
  const [chapterCurrentPage, setChapterCurrentPage] = useState<number>(0);
  const [chapterTotalPages, setChapterTotalPages] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [theme, setTheme] = useState<'Light' | 'Cream' | 'Dark' | 'Sepia'>('Cream');
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<string>('Default');
  const [epubJsContent, setEpubJsContent] = useState<string>('');

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
  }, [loadBookmarks]);

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

  const epubHtml = epubJsContent ? buildEpubHtml(localEpubUri || '', epubJsContent) : '';
  const WebViewComponent = WebView as any;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.cream}
        translucent={false}
      />

      {/* ── Progress bar (always visible, 2px) ── */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* ── Header (animated show/hide) ── */}
      {controlsVisible && (
        <Animated.View style={[styles.header, { opacity: controlsOpacity }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Kembali"
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {chapterTitle || title}
            </Text>
            <View style={styles.headerMeta}>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {isReady && chapterTotalPages > 0 
                  ? `${chapterTotalPages - chapterCurrentPage} hal. tersisa` 
                  : '…'}
              </Text>
              <Text style={styles.headerMetaDivider}>·</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {formatReadingTime(readingTimeSeconds)}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.headerAction} onPress={toggleBookmark}>
            <Text style={[styles.bookmarkIcon, bookmarks.some(b => b.cfi === currentCfi) && styles.bookmarkIconActive]}>
              🔖
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── WebView ── */}
      <View style={styles.webViewContainer}>
        {!epubJsContent ? (
          <View style={styles.loaderContainer}>
            <Text style={styles.loaderText}>Memuat pembaca buku…</Text>
          </View>
        ) : (
          <WebViewComponent
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: epubHtml, baseUrl: 'file:///' }}
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
        <Animated.View style={[styles.bottomBar, { opacity: controlsOpacity }]}>
          <TouchableOpacity style={styles.navIconButton} onPress={() => setShowToc(true)}>
            <Text style={styles.navIconText}>☰</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navIconButton} onPress={() => setShowSettings(true)}>
            <Text style={styles.navIconText}>Aa</Text>
          </TouchableOpacity>

          <View style={styles.pageCounter}>
            <Text style={styles.pageCounterText}>
              {currentPage} of {totalPages > 0 ? totalPages : '...'}
            </Text>
          </View>

          <TouchableOpacity style={styles.navIconButton} onPress={() => setShowBookmarks(true)}>
            <Text style={styles.navIconText}>📑</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── Modals ── */}
      
      {/* TOC Modal */}
      <Modal visible={showToc} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Daftar Isi</Text>
              <TouchableOpacity onPress={() => setShowToc(false)}><Text style={styles.modalClose}>Tutup</Text></TouchableOpacity>
            </View>
            <FlatList
              data={toc}
              keyExtractor={(item, index) => item.id || String(index)}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.tocItem} onPress={() => jumpToLocation(item.href)}>
                  <Text style={styles.tocItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tampilan</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}><Text style={styles.modalClose}>Tutup</Text></TouchableOpacity>
            </View>
            
            <Text style={styles.settingsLabel}>Tema</Text>
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

            <Text style={styles.settingsLabel}>Ukuran Font</Text>
            <View style={styles.fontRow}>
              <TouchableOpacity style={styles.fontButton} onPress={() => setFontSize(Math.max(14, fontSize - 2))}>
                <Text style={styles.fontButtonText}>A-</Text>
              </TouchableOpacity>
              <Text style={styles.fontSizeText}>{fontSize}</Text>
              <TouchableOpacity style={styles.fontButton} onPress={() => setFontSize(Math.min(28, fontSize + 2))}>
                <Text style={styles.fontButtonText}>A+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.settingsLabel}>Jenis Font</Text>
            <View style={styles.fontFamilyRow}>
              {['Default', 'Georgia', 'Palatino'].map(f => (
                <TouchableOpacity key={f} style={[styles.fontFamilyButton, fontFamily === f && styles.fontFamilyButtonActive]} onPress={() => setFontFamily(f)}>
                  <Text style={[styles.fontFamilyText, fontFamily === f && styles.fontFamilyTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Bookmarks Modal */}
      <Modal visible={showBookmarks} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Markah Buku</Text>
              <TouchableOpacity onPress={() => setShowBookmarks(false)}><Text style={styles.modalClose}>Tutup</Text></TouchableOpacity>
            </View>
            <FlatList
              data={bookmarks}
              keyExtractor={(item) => String(item.id)}
              ListEmptyComponent={<Text style={styles.emptyText}>Belum ada markah buku.</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.tocItem} onPress={() => jumpToLocation(item.cfi)}>
                  <Text style={styles.tocItemText}>{item.chapterTitle}</Text>
                  <Text style={styles.bookmarkDateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const COLORS = {
  cream: '#F4F1E8',
  creamLight: '#FAF8F5',
  forest: '#1B3A2D',
  forestMuted: 'rgba(27,58,45,0.08)',
  ember: '#C8541F',
  sand: '#D4CEB8',
  muted: '#9A978E',
};

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
    backgroundColor: COLORS.forestMuted,
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
});
